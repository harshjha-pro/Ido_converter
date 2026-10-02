import type { ToolResult } from '../shared/types';
import { buildXlsx, type CellValue } from '../shared/xlsx';

// Turns a bank's CSV export into one clean layout: Date, Narration, Reference, Withdrawal, Deposit,
// Balance. TallyPrime imports bank statements in CSV/Excel (Alt+O → Import → Bank Statements) and maps
// columns once; a consistent layout makes that mapping reusable across banks. No tax rules involved.

export type DateOrder = 'auto' | 'DMY' | 'MDY' | 'YMD';
export type Role = 'date' | 'valueDate' | 'narration' | 'reference' | 'withdrawal' | 'deposit' | 'amount' | 'drcr' | 'balance';

export interface CleanerOptions {
  dateOrder?: DateOrder;
  /** Force column roles by header index when auto-detection guesses wrong. */
  columns?: Partial<Record<Role, number>>;
  /** Output oldest first (default true): many banks export newest first. */
  oldestFirst?: boolean;
}

export interface CleanRow {
  date: string;        // DD-MM-YYYY
  narration: string;
  reference: string;
  withdrawal: number;
  deposit: number;
  balance: number | null;
}

export interface CleanerMeta {
  delimiter: string;
  headerRow: number;
  columns: Partial<Record<Role, string>>;
  dateOrder: 'DMY' | 'MDY' | 'YMD';
  reversed: boolean;
  skippedLines: number;
  totals: { withdrawals: number; deposits: number; count: number };
  /** Rows where previous balance + deposit − withdrawal ≠ balance (1-based, output order). */
  balanceMismatches: number[];
  openingBalance: number | null;
  closingBalance: number | null;
}

const ROLE_PATTERNS: [Role, RegExp][] = [
  ['valueDate', /\bvalue\s*(dt|date)\b/],
  ['date', /\b(txn|tran|transaction|posting|post|trans)?\s*(dt|date)\b/],
  ['drcr', /^(dr\s*\/\s*cr|cr\s*\/\s*dr|debit\s*\/\s*credit|type|txn type|transaction type|d\/c|c\/d)$/],
  ['withdrawal', /withdraw|debit|^dr\b|paid out|money out/],
  ['deposit', /deposit|credit|^cr\b|paid in|money in/],
  ['balance', /balance|bal\b/],
  ['reference', /chq|cheque|ref|instrument|utr/],
  ['narration', /narration|description|particulars|remarks|details|transaction remarks/],
  ['amount', /amount|amt/],
];

function detectDelimiter(text: string): string {
  const sample = text.split(/\r?\n/).slice(0, 30).join('\n');
  const candidates = [',', ';', '\t', '|'];
  let best = ',', bestScore = -1;
  for (const d of candidates) {
    const counts = sample.split('\n').map(l => l.split(d).length - 1).filter(n => n > 0);
    const score = counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length * Math.min(counts.length, 10) : 0;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return best;
}

/** RFC 4180-style CSV parsing (quotes, escaped quotes, delimiters and newlines inside quotes). */
export function parseCsv(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"' && field.trim() === '') {
      quoted = true; field = '';
    } else if (c === delimiter) {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.map(r => r.map(f => f.trim()));
}

function detectColumns(header: string[]): Partial<Record<Role, number>> {
  const roles: Partial<Record<Role, number>> = {};
  header.forEach((raw, i) => {
    const h = raw.toLowerCase().replace(/[._]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!h) return;
    for (const [role, re] of ROLE_PATTERNS) {
      if (roles[role] === undefined && re.test(h)) { roles[role] = i; return; }
    }
  });
  return roles;
}

function findHeader(rows: string[][]): number {
  for (let i = 0; i < Math.min(rows.length, 60); i++) {
    const roles = detectColumns(rows[i]);
    const hasMoney = roles.withdrawal !== undefined || roles.deposit !== undefined || roles.amount !== undefined;
    if ((roles.date !== undefined || roles.valueDate !== undefined) && hasMoney) return i;
  }
  return -1;
}

const MONTHS: Record<string, number> = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };

function validDate(d: number, m: number, y: number): boolean {
  if (y < 100) y += 2000;
  if (m < 1 || m > 12 || d < 1) return false;
  return d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Returns [day, month, year] or null. */
export function parseDate(raw: string, order: 'DMY' | 'MDY' | 'YMD'): [number, number, number] | null {
  const s = raw.trim().split(/[ T]\d{1,2}:\d{2}/)[0].trim();
  let m = /^(\d{1,2})[\s\-/.]([A-Za-z]{3,4})[\s\-/.,]*(\d{2,4})$/.exec(s);
  if (m) {
    const mon = MONTHS[m[2].toLowerCase()];
    const y = Number(m[3]) < 100 ? Number(m[3]) + 2000 : Number(m[3]);
    return mon && validDate(Number(m[1]), mon, y) ? [Number(m[1]), mon, y] : null;
  }
  m = /^(\d{4})[\-/.](\d{1,2})[\-/.](\d{1,2})$/.exec(s);
  if (m) return validDate(Number(m[3]), Number(m[2]), Number(m[1])) ? [Number(m[3]), Number(m[2]), Number(m[1])] : null;
  m = /^(\d{1,2})[\-/.](\d{1,2})[\-/.](\d{2,4})$/.exec(s);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    const y = Number(m[3]) < 100 ? Number(m[3]) + 2000 : Number(m[3]);
    const [d, mo] = order === 'MDY' ? [b, a] : [a, b];
    return validDate(d, mo, y) ? [d, mo, y] : null;
  }
  return null;
}

/** "1,23,456.78", "₹ 500", "(250.00)", "100 Dr", "-" → number (or null when not an amount). */
export function parseAmount(raw: string): { value: number; drcr?: 'dr' | 'cr' } | null {
  let s = raw.trim();
  if (s === '' || s === '-' || s === '--') return { value: 0 };
  let drcr: 'dr' | 'cr' | undefined;
  const suffix = /\s*\b(dr|cr)\.?$/i.exec(s);
  if (suffix) { drcr = suffix[1].toLowerCase() as 'dr' | 'cr'; s = s.slice(0, suffix.index); }
  let negative = false;
  if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1); }
  s = s.replace(/₹|inr|rs\.?/gi, '').replace(/[,\s]/g, '');
  if (s.startsWith('-')) { negative = true; s = s.slice(1); }
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  return { value: negative ? -Number(s) : Number(s), drcr };
}

function pickDateOrder(values: string[]): 'DMY' | 'MDY' | 'YMD' {
  // Indian banks use day-first; switch only when a value proves month-first (second part > 12).
  let mdy = false, dmy = false;
  for (const v of values) {
    const m = /^(\d{1,2})[\-/.](\d{1,2})[\-/.]\d{2,4}/.exec(v.trim());
    if (!m) continue;
    if (Number(m[1]) > 12) dmy = true;
    if (Number(m[2]) > 12) mdy = true;
  }
  if (values.some(v => /^\d{4}[\-/.]/.test(v.trim()))) return 'YMD';
  return mdy && !dmy ? 'MDY' : 'DMY';
}

const pad = (n: number) => String(n).padStart(2, '0');
const r2 = (n: number) => Math.round(n * 100) / 100;

export function clean(text: string, options: CleanerOptions = {}): ToolResult<CleanRow[]> {
  if (!text || text.trim() === '') return { ok: false, error: 'Input is empty' };
  const delimiter = detectDelimiter(text);
  const rows = parseCsv(text.replace(/^﻿/, ''), delimiter);
  const headerRow = findHeader(rows);
  if (headerRow === -1 && !options.columns) {
    return { ok: false, error: 'Could not find the header row (a row with a date column and withdrawal/deposit, debit/credit or amount columns). Check the file is the bank\'s CSV export.' };
  }
  const header = rows[Math.max(headerRow, 0)];
  const cols = { ...detectColumns(header), ...options.columns };
  if (cols.date === undefined && cols.valueDate !== undefined) { cols.date = cols.valueDate; delete cols.valueDate; }
  if (cols.date === undefined) return { ok: false, error: 'No date column found.' };
  const hasSplit = cols.withdrawal !== undefined || cols.deposit !== undefined;
  if (!hasSplit && cols.amount === undefined) return { ok: false, error: 'No withdrawal/deposit or amount column found.' };

  const body = rows.slice(headerRow + 1);
  const order = options.dateOrder && options.dateOrder !== 'auto' ? options.dateOrder : pickDateOrder(body.map(r => r[cols.date!] ?? ''));

  const out: (CleanRow & { sortKey: number; line: number })[] = [];
  let skipped = 0;
  body.forEach((r, i) => {
    const d = parseDate(r[cols.date!] ?? '', order);
    if (!d) { if (r.some(c => c !== '')) skipped++; return; }
    let withdrawal = 0, deposit = 0;
    if (hasSplit) {
      const w = cols.withdrawal !== undefined ? parseAmount(r[cols.withdrawal] ?? '') : { value: 0 };
      const dep = cols.deposit !== undefined ? parseAmount(r[cols.deposit] ?? '') : { value: 0 };
      if (!w || !dep) { skipped++; return; }
      withdrawal = Math.abs(w.value);
      deposit = Math.abs(dep.value);
    } else {
      const a = parseAmount(r[cols.amount!] ?? '');
      if (!a) { skipped++; return; }
      const flag = (cols.drcr !== undefined ? (r[cols.drcr] ?? '') : '').trim().toLowerCase();
      const isDebit = flag.startsWith('d') || flag === 'withdrawal' || a.drcr === 'dr' || (!flag && !a.drcr && a.value < 0);
      if (isDebit) withdrawal = Math.abs(a.value); else deposit = Math.abs(a.value);
    }
    // "Opening balance" / "B/F" lines and blank-amount rows are not transactions.
    if (withdrawal === 0 && deposit === 0) { skipped++; return; }
    let balance: number | null = null;
    if (cols.balance !== undefined) {
      const b = parseAmount(r[cols.balance] ?? '');
      // An overdrawn balance is often shown as "1,000 Dr".
      if (b && (r[cols.balance] ?? '').trim() !== '') balance = b.drcr === 'dr' ? -Math.abs(b.value) : b.value;
    }
    const narration = cols.narration !== undefined ? (r[cols.narration] ?? '').replace(/\s+/g, ' ') : '';
    out.push({
      date: `${pad(d[0])}-${pad(d[1])}-${d[2]}`, narration, reference: cols.reference !== undefined ? (r[cols.reference] ?? '') : '',
      withdrawal: r2(withdrawal), deposit: r2(deposit), balance, sortKey: d[2] * 10000 + d[1] * 100 + d[0], line: i,
    });
  });
  if (out.length === 0) return { ok: false, error: 'Header found, but no transaction rows with a readable date.' };

  // Newest-first export: dates decrease from the first to the last row.
  const reversed = (options.oldestFirst ?? true) && out[0].sortKey > out[out.length - 1].sortKey;
  if (reversed) out.reverse();

  const mismatches: number[] = [];
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1].balance, cur = out[i].balance;
    if (prev === null || cur === null) continue;
    if (Math.abs(r2(prev + out[i].deposit - out[i].withdrawal) - cur) > 0.01) mismatches.push(i + 1);
  }
  const first = out[0];
  const opening = first.balance === null ? null : r2(first.balance - first.deposit + first.withdrawal);

  const rowsOut: CleanRow[] = out.map(({ sortKey: _s, line: _l, ...rest }) => rest);
  const meta: CleanerMeta = {
    delimiter, headerRow: headerRow + 1,
    columns: Object.fromEntries(Object.entries(cols).map(([k, v]) => [k, header[v as number] ?? `column ${(v as number) + 1}`])),
    dateOrder: order, reversed, skippedLines: skipped,
    totals: { withdrawals: r2(rowsOut.reduce((s, x) => s + x.withdrawal, 0)), deposits: r2(rowsOut.reduce((s, x) => s + x.deposit, 0)), count: rowsOut.length },
    balanceMismatches: mismatches, openingBalance: opening, closingBalance: out[out.length - 1].balance,
  };
  return { ok: true, output: rowsOut, meta: meta as unknown as Record<string, unknown> };
}

const HEADER = ['Date', 'Narration', 'Reference', 'Withdrawal', 'Deposit', 'Balance'];

export function toCsv(rows: CleanRow[]): string {
  const q = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const money = (n: number) => (n ? n.toFixed(2) : '');
  return [HEADER.join(','), ...rows.map(r => [r.date, q(r.narration), q(r.reference), money(r.withdrawal), money(r.deposit), r.balance === null ? '' : r.balance.toFixed(2)].join(','))].join('\r\n') + '\r\n';
}

export function toXlsx(rows: CleanRow[]): Uint8Array {
  const data: CellValue[][] = [HEADER, ...rows.map(r => [r.date, r.narration, r.reference, r.withdrawal || null, r.deposit || null, r.balance])];
  return buildXlsx([{ name: 'Bank statement', rows: data, widths: [12, 60, 18, 14, 14, 16] }]);
}

/** ToolResult contract entry point: input is the CSV text; output is the cleaned CSV. */
export function run(input: string, options: CleanerOptions = {}): ToolResult<string> {
  const r = clean(input, options);
  return r.ok && r.output ? { ok: true, output: toCsv(r.output), meta: r.meta } : { ok: false, error: r.error };
}
