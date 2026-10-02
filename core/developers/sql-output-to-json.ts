import type { ToolResult } from '../shared/types';

export interface SqlToJsonOptions {
  /** Infer numbers and booleans per column. Off = every value stays a string (NULL still becomes null). */
  detectTypes?: boolean;
  /**
   * psql prints NULL as an empty cell by default, so an empty psql cell is ambiguous.
   * 'null' (default) treats it as NULL; 'empty' keeps it as "".
   */
  psqlEmptyAs?: 'null' | 'empty';
}

export type SqlFormat = 'psql' | 'psql-expanded' | 'mysql' | 'mysql-vertical' | 'tsv';

export interface ResultSetInfo {
  format: SqlFormat;
  columns: string[];
  rowCount: number;
}

type Cell = string | null;

interface RawSet {
  format: SqlFormat;
  columns: string[];
  rows: Cell[][];
}

const PSQL_SEPARATOR = /^-+(?:\+-+)*$/;
const MYSQL_BORDER = /^\+(?:-+\+)+$/;
const MYSQL_VERTICAL_HEAD = /^\*+\s*\d+\.\s*row\s*\*+$/;
const PSQL_RECORD_HEAD = /^-\[\s*RECORD\s+\d+\s*\]-*(?:\+-*)?$/;
// Lines that are not data: footers and interactive prompts. Skipped so pasting a whole session works.
const NOISE = [
  /^\(\d+ rows?\)$/,
  /^\d+ rows? in set(?: \([\d.]+ sec\))?$/i,
  /^Query OK\b/i,
  /^mysql>/,
  /^\s*->/,
  /^[\w-]+[=-][#>]/,
  /^Time: [\d.]+ ms/,
];
const EMPTY_SET = /^Empty set(?: \([\d.]+ sec\))?$/i;

function isNoise(line: string): boolean {
  return NOISE.some(r => r.test(line.trim()));
}

// Splits on '|' when that yields the expected column count; otherwise uses the border's column
// positions, which survive values that contain '|' (but not wide Unicode alignment).
function splitRow(line: string, expected: number, boundaries: number[] | null, trimEdges: boolean): string[] {
  let body = line;
  if (trimEdges) {
    body = body.replace(/^\s*\|/, '').replace(/\|\s*$/, '');
  }
  const parts = body.split('|');
  if (parts.length === expected || !boundaries) return parts.map(p => p.trim());

  const cells: string[] = [];
  let start = 0;
  for (const b of boundaries) {
    cells.push(line.slice(start, b).replace(/^\s*\|/, '').trim());
    start = b + 1;
  }
  cells.push(line.slice(start).replace(/\|\s*$/, '').trim());
  return cells.slice(0, expected);
}

function boundariesFrom(border: string, inner: boolean): number[] {
  const out: number[] = [];
  for (let i = 0; i < border.length; i++) if (border[i] === '+') out.push(i);
  // mysql borders start and end with '+'; only the inner ones separate columns.
  return inner ? out.slice(1, -1) : out;
}

function dedupe(columns: string[]): string[] {
  const seen = new Map<string, number>();
  return columns.map((c, i) => {
    const name = c === '' ? `column_${i + 1}` : c;
    const n = (seen.get(name) ?? 0) + 1;
    seen.set(name, n);
    return n === 1 ? name : `${name}_${n}`;
  });
}

function nullable(value: string, emptyIsNull: boolean): Cell {
  if (value === 'NULL') return null;
  if (value === '' && emptyIsNull) return null;
  return value;
}

function parsePsql(lines: string[], i: number, emptyIsNull: boolean): { set: RawSet; next: number } {
  const header = lines[i];
  const separator = lines[i + 1].trim();
  const offset = lines[i + 1].indexOf(separator[0]);
  const boundaries = boundariesFrom(separator, false).map(b => b + offset);
  const columns = dedupe(splitRow(header, boundaries.length + 1, boundaries, false));
  const rows: Cell[][] = [];
  let j = i + 2;
  for (; j < lines.length; j++) {
    const line = lines[j];
    if (line.trim() === '' || isNoise(line)) break;
    rows.push(splitRow(line, columns.length, boundaries, false).map(v => nullable(v, emptyIsNull)));
  }
  return { set: { format: 'psql', columns, rows }, next: j };
}

function parseMysql(lines: string[], i: number): { set: RawSet; next: number } {
  const boundaries = boundariesFrom(lines[i].trim(), true);
  const offset = lines[i].indexOf('+');
  const abs = boundaries.map(b => b + offset);
  const expected = boundaries.length + 1;
  const columns = dedupe(splitRow(lines[i + 1], expected, abs, true));
  const rows: Cell[][] = [];
  let j = i + 2;
  if (j < lines.length && MYSQL_BORDER.test(lines[j].trim())) j++;
  for (; j < lines.length; j++) {
    const t = lines[j].trim();
    if (MYSQL_BORDER.test(t)) { j++; break; }
    if (t === '' || !t.startsWith('|')) break;
    rows.push(splitRow(lines[j], expected, abs, true).map(v => nullable(v, false)));
  }
  return { set: { format: 'mysql', columns, rows }, next: j };
}

// Vertical formats (mysql \G, psql \x) print one "column: value" or "column | value" pair per line.
function parseVertical(lines: string[], i: number, format: 'mysql-vertical' | 'psql-expanded', emptyIsNull: boolean): { set: RawSet; next: number } {
  const head = format === 'mysql-vertical' ? MYSQL_VERTICAL_HEAD : PSQL_RECORD_HEAD;
  const pair = format === 'mysql-vertical' ? /^\s*([^:]+?):\s?(.*)$/ : /^\s*(.+?)\s*\|\s?(.*)$/;
  const columns: string[] = [];
  const records: Map<string, Cell>[] = [];
  let current: Map<string, Cell> | null = null;
  let j = i;
  for (; j < lines.length; j++) {
    const line = lines[j];
    const t = line.trim();
    if (head.test(t)) {
      current = new Map();
      records.push(current);
      continue;
    }
    if (t === '' || isNoise(line)) break;
    const m = line.match(pair);
    if (!m || !current) break;
    const col = m[1].trim();
    if (!columns.includes(col)) columns.push(col);
    current.set(col, nullable(m[2].trim(), format === 'psql-expanded' && emptyIsNull));
  }
  const rows = records.map(r => columns.map(c => (r.has(c) ? r.get(c)! : null)));
  return { set: { format, columns: dedupe(columns), rows }, next: j };
}

function parseTsv(lines: string[], i: number): { set: RawSet; next: number } {
  const columns = dedupe(lines[i].split('\t').map(c => c.trim()));
  const rows: Cell[][] = [];
  let j = i + 1;
  for (; j < lines.length; j++) {
    const line = lines[j];
    if (line.trim() === '' || !line.includes('\t') || isNoise(line)) break;
    const cells = line.split('\t');
    // mysql -B escapes tabs/newlines inside values as \t and \n; keep them escaped rather than guess.
    while (cells.length < columns.length) cells.push('');
    rows.push(cells.slice(0, columns.length).map(v => nullable(v, false)));
  }
  return { set: { format: 'tsv', columns, rows }, next: j };
}

const INT = /^-?(?:0|[1-9]\d*)$/;
const DEC = /^-?(?:0|[1-9]\d*)\.\d+$/;
const BOOL = new Set(['t', 'f', 'true', 'false']);

// More than 15 significant digits cannot round-trip through a JS number (e.g. NUMERIC(30,10)); keep those as text.
function fitsDouble(v: string): boolean {
  return v.replace(/^-/, '').replace('.', '').replace(/^0+/, '').length <= 15;
}

type ColumnType = 'int' | 'decimal' | 'bool' | 'string';

// Per column, not per cell: a text column that happens to contain "t" or "42" stays text.
function inferColumn(values: Cell[], format: SqlFormat): ColumnType {
  const present = values.filter((v): v is string => v !== null);
  if (present.length === 0) return 'string';
  if (present.every(v => INT.test(v) && Number.isSafeInteger(Number(v)))) return 'int';
  if (present.every(v => (INT.test(v) && Number.isSafeInteger(Number(v))) || (DEC.test(v) && fitsDouble(v)))) return 'decimal';
  // mysql has no boolean output (it prints 0/1), so t/f only means boolean for psql.
  if ((format === 'psql' || format === 'psql-expanded') && present.every(v => BOOL.has(v.toLowerCase()))) return 'bool';
  if (present.every(v => v === 'true' || v === 'false')) return 'bool';
  return 'string';
}

function convert(value: Cell, type: ColumnType): unknown {
  if (value === null) return null;
  switch (type) {
    case 'int':
    case 'decimal':
      return Number(value);
    case 'bool':
      return value.toLowerCase().startsWith('t');
    default:
      return value;
  }
}

export function run(input: string, options: SqlToJsonOptions = {}): ToolResult<string> {
  if (!input || input.trim() === '') {
    return { ok: false, error: 'Input is empty' };
  }
  const { detectTypes = true, psqlEmptyAs = 'null' } = options;
  const emptyIsNull = psqlEmptyAs === 'null';

  const lines = input.replace(/\r\n?/g, '\n').split('\n');
  const sets: RawSet[] = [];
  const skipped: number[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (t === '' || isNoise(line)) { i++; continue; }

    if (EMPTY_SET.test(t)) {
      sets.push({ format: 'mysql', columns: [], rows: [] });
      i++;
    } else if (MYSQL_BORDER.test(t) && i + 1 < lines.length && lines[i + 1].trim().startsWith('|')) {
      const r = parseMysql(lines, i); sets.push(r.set); i = r.next;
    } else if (MYSQL_VERTICAL_HEAD.test(t)) {
      const r = parseVertical(lines, i, 'mysql-vertical', emptyIsNull); sets.push(r.set); i = r.next;
    } else if (PSQL_RECORD_HEAD.test(t)) {
      const r = parseVertical(lines, i, 'psql-expanded', emptyIsNull); sets.push(r.set); i = r.next;
    } else if (i + 1 < lines.length && PSQL_SEPARATOR.test(lines[i + 1].trim()) && !line.includes('\t')) {
      const r = parsePsql(lines, i, emptyIsNull); sets.push(r.set); i = r.next;
    } else if (line.includes('\t')) {
      const r = parseTsv(lines, i); sets.push(r.set); i = r.next;
    } else {
      skipped.push(i + 1);
      i++;
    }
  }

  if (sets.length === 0) {
    return {
      ok: false,
      error: 'No result table found. Paste psql output (with the ----+---- line), mysql output (with +----+ borders), or tab-separated text with a header row.',
    };
  }

  const resultSets = sets.map(set => {
    const types: ColumnType[] = set.columns.map((_, c) =>
      detectTypes ? inferColumn(set.rows.map(r => r[c]), set.format) : 'string');
    return set.rows.map(row => {
      const obj: Record<string, unknown> = {};
      set.columns.forEach((col, c) => { obj[col] = convert(row[c] ?? null, types[c]); });
      return obj;
    });
  });

  const info: ResultSetInfo[] = sets.map(s => ({ format: s.format, columns: s.columns, rowCount: s.rows.length }));
  const output = resultSets.length === 1 ? resultSets[0] : resultSets;

  return {
    ok: true,
    output: JSON.stringify(output, null, 2),
    meta: { resultSets: info, skippedLines: skipped },
  };
}
