import type { ToolResult } from '../shared/types';
import { buildXlsx, type CellValue, type Sheet } from '../shared/xlsx';

// Converts one or more GSTR-2B JSON files (GST portal: Returns Dashboard → GSTR-2B → Download JSON)
// into one Excel workbook, merging months. It only reshapes the data; it calculates no tax.
// Field names follow the portal's GSTR-2B JSON (data.docdata.<section>[]). VERIFY against a real
// downloaded file when the portal changes its format; unknown sections are reported, never dropped silently.

export interface Gstr2bFile {
  name: string;
  text: string;
}

export interface Gstr2bMeta {
  periods: string[];
  gstins: string[];
  rowsBySection: Record<string, number>;
  unknownSections: string[];
  warnings: string[];
}

type Json = Record<string, unknown>;
type Column = [header: string, get: (party: Json, doc: Json, period: string) => CellValue, width?: number];

const num = (v: unknown): CellValue => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : null);
const str = (v: unknown): CellValue => (v === null || v === undefined ? null : String(v));
const yn = (v: unknown): CellValue => (v === 'Y' ? 'Yes' : v === 'N' ? 'No' : str(v));
const noteType = (v: unknown): CellValue => (v === 'C' ? 'Credit note' : v === 'D' ? 'Debit note' : str(v));

/** "042026" → "Apr 2026" so months sort and read naturally. */
export function periodLabel(rtnprd: string): string {
  const m = /^(\d{2})(\d{4})$/.exec(rtnprd);
  if (!m) return rtnprd;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(m[1]) - 1] ?? m[1]} ${m[2]}`;
}

function periodKey(rtnprd: string): string {
  const m = /^(\d{2})(\d{4})$/.exec(rtnprd);
  return m ? `${m[2]}${m[1]}` : rtnprd;
}

const TAX: Column[] = [
  ['Taxable value', (_p, d) => num(d.txval), 14],
  ['IGST', (_p, d) => num(d.igst), 12],
  ['CGST', (_p, d) => num(d.cgst), 12],
  ['SGST/UTGST', (_p, d) => num(d.sgst), 12],
  ['Cess', (_p, d) => num(d.cess), 10],
];
const PARTY: Column[] = [
  ['Return period', (_p, _d, per) => periodLabel(per), 12],
  ['Supplier GSTIN', (p) => str(p.ctin), 18],
  ['Supplier name', (p) => str(p.trdnm), 28],
];
const FILING: Column[] = [
  ['ITC available', (_p, d) => yn(d.itcavl), 12],
  ['Reason', (_p, d) => str(d.rsn), 12],
  ['Applicable %', (_p, d) => num(d.diffprcnt), 12],
  ['GSTR-1/IFF/5 period', (p) => str(p.supprd), 14],
  ['GSTR-1/IFF/5 filing date', (p) => str(p.supfildt), 16],
  ['Source', (_p, d) => str(d.srctyp), 10],
  ['IRN', (_p, d) => str(d.irn), 30],
  ['IRN date', (_p, d) => str(d.irngendate), 12],
];

interface SectionSpec {
  key: string;
  sheet: string;
  /** Array of documents inside each party record (e.g. "inv"); null when rows are the records themselves. */
  docs: string | null;
  columns: Column[];
}

const SECTIONS: SectionSpec[] = [
  { key: 'b2b', sheet: 'B2B', docs: 'inv', columns: [...PARTY,
    ['Invoice number', (_p, d) => str(d.inum), 16], ['Invoice type', (_p, d) => str(d.typ), 10], ['Invoice date', (_p, d) => str(d.dt), 12],
    ['Invoice value', (_p, d) => num(d.val), 14], ['Place of supply', (_p, d) => str(d.pos), 10], ['Reverse charge', (_p, d) => yn(d.rev), 10],
    ...TAX, ...FILING] },
  { key: 'b2ba', sheet: 'B2BA', docs: 'inv', columns: [...PARTY,
    ['Original invoice number', (_p, d) => str(d.oinum), 16], ['Original invoice date', (_p, d) => str(d.oidt), 12],
    ['Invoice number', (_p, d) => str(d.inum), 16], ['Invoice type', (_p, d) => str(d.typ), 10], ['Invoice date', (_p, d) => str(d.dt), 12],
    ['Invoice value', (_p, d) => num(d.val), 14], ['Place of supply', (_p, d) => str(d.pos), 10], ['Reverse charge', (_p, d) => yn(d.rev), 10],
    ...TAX, ...FILING] },
  { key: 'cdnr', sheet: 'CDNR', docs: 'nt', columns: [...PARTY,
    ['Note number', (_p, d) => str(d.ntnum), 16], ['Note type', (_p, d) => noteType(d.typ), 12], ['Note supply type', (_p, d) => str(d.suptyp), 12],
    ['Note date', (_p, d) => str(d.dt), 12], ['Note value', (_p, d) => num(d.val), 14], ['Place of supply', (_p, d) => str(d.pos), 10],
    ['Reverse charge', (_p, d) => yn(d.rev), 10], ...TAX, ...FILING] },
  { key: 'cdnra', sheet: 'CDNRA', docs: 'nt', columns: [...PARTY,
    ['Original note number', (_p, d) => str(d.ontnum), 16], ['Original note date', (_p, d) => str(d.ontdt), 12],
    ['Note number', (_p, d) => str(d.ntnum), 16], ['Note type', (_p, d) => noteType(d.typ), 12], ['Note supply type', (_p, d) => str(d.suptyp), 12],
    ['Note date', (_p, d) => str(d.dt), 12], ['Note value', (_p, d) => num(d.val), 14], ['Place of supply', (_p, d) => str(d.pos), 10],
    ['Reverse charge', (_p, d) => yn(d.rev), 10], ...TAX, ...FILING] },
  { key: 'isd', sheet: 'ISD', docs: 'doclist', columns: [
    ['Return period', (_p, _d, per) => periodLabel(per), 12], ['ISD GSTIN', (p) => str(p.ctin), 18], ['ISD name', (p) => str(p.trdnm), 28],
    ['Document type', (_p, d) => str(d.doctyp), 12], ['Document number', (_p, d) => str(d.docnum), 16], ['Document date', (_p, d) => str(d.docdt), 12],
    ['Original document number', (_p, d) => str(d.oinvnum), 16], ['Original document date', (_p, d) => str(d.oinvdt), 12],
    ['IGST', (_p, d) => num(d.igst), 12], ['CGST', (_p, d) => num(d.cgst), 12], ['SGST/UTGST', (_p, d) => num(d.sgst), 12], ['Cess', (_p, d) => num(d.cess), 10],
    ['ITC eligible', (_p, d) => yn(d.itcelg), 10], ['ISD period', (p) => str(p.supprd), 12], ['ISD filing date', (p) => str(p.supfildt), 14]] },
  { key: 'impg', sheet: 'IMPG', docs: null, columns: [
    ['Return period', (_p, _d, per) => periodLabel(per), 12], ['Reference date', (_p, d) => str(d.refdt), 12], ['Port code', (_p, d) => str(d.portcode), 10],
    ['Bill of entry number', (_p, d) => str(d.boenum), 16], ['Bill of entry date', (_p, d) => str(d.boedt), 12], ['Amended', (_p, d) => yn(d.isamd), 10],
    ['Taxable value', (_p, d) => num(d.txval), 14], ['IGST', (_p, d) => num(d.igst), 12], ['Cess', (_p, d) => num(d.cess), 10]] },
  { key: 'impgsez', sheet: 'IMPGSEZ', docs: null, columns: [
    ['Return period', (_p, _d, per) => periodLabel(per), 12], ['SEZ supplier GSTIN', (_p, d) => str(d.ctin), 18], ['SEZ supplier name', (_p, d) => str(d.trdnm), 28],
    ['Reference date', (_p, d) => str(d.refdt), 12], ['Port code', (_p, d) => str(d.portcode), 10], ['Bill of entry number', (_p, d) => str(d.boenum), 16],
    ['Bill of entry date', (_p, d) => str(d.boedt), 12], ['Amended', (_p, d) => yn(d.isamd), 10],
    ['Taxable value', (_p, d) => num(d.txval), 14], ['IGST', (_p, d) => num(d.igst), 12], ['Cess', (_p, d) => num(d.cess), 10]] },
];

interface ParsedFile {
  period: string;
  gstin: string;
  docdata: Json;
}

function parseFile(file: Gstr2bFile): { ok: true; value: ParsedFile } | { ok: false; error: string } {
  let json: unknown;
  try {
    json = JSON.parse(file.text);
  } catch {
    return { ok: false, error: `${file.name}: not valid JSON` };
  }
  const root = (json as Json)?.data && typeof (json as Json).data === 'object' ? (json as Json).data as Json : json as Json;
  const docdata = root?.docdata;
  if (!root || typeof docdata !== 'object' || docdata === null) {
    return { ok: false, error: `${file.name}: does not look like a GSTR-2B JSON file (no "docdata" section)` };
  }
  return { ok: true, value: { period: String(root.rtnprd ?? ''), gstin: String(root.gstin ?? ''), docdata: docdata as Json } };
}

export function convert(files: Gstr2bFile[]): ToolResult<Uint8Array> {
  if (files.length === 0) return { ok: false, error: 'Choose at least one GSTR-2B JSON file' };

  const parsed: ParsedFile[] = [];
  for (const f of files) {
    const r = parseFile(f);
    if (!r.ok) return { ok: false, error: r.error };
    parsed.push(r.value);
  }
  parsed.sort((a, b) => periodKey(a.period).localeCompare(periodKey(b.period)));

  const meta: Gstr2bMeta = { periods: [], gstins: [], rowsBySection: {}, unknownSections: [], warnings: [] };
  const seenPeriods = new Set<string>();
  for (const p of parsed) {
    if (seenPeriods.has(p.period)) meta.warnings.push(`Return period ${periodLabel(p.period)} appears in more than one file; both are included.`);
    seenPeriods.add(p.period);
    if (!meta.gstins.includes(p.gstin)) meta.gstins.push(p.gstin);
  }
  meta.periods = [...seenPeriods].map(periodLabel);
  if (meta.gstins.length > 1) meta.warnings.push(`Files belong to different GSTINs (${meta.gstins.join(', ')}).`);

  const known = new Set(SECTIONS.map(s => s.key));
  const sheets: Sheet[] = [];
  const summary: CellValue[][] = [['Return period', 'Section', 'Documents', 'Taxable value', 'IGST', 'CGST', 'SGST/UTGST', 'Cess']];

  for (const spec of SECTIONS) {
    const rows: CellValue[][] = [spec.columns.map(c => c[0])];
    for (const file of parsed) {
      const records = file.docdata[spec.key];
      if (!Array.isArray(records)) continue;
      const totals = { n: 0, txval: 0, igst: 0, cgst: 0, sgst: 0, cess: 0 };
      for (const party of records as Json[]) {
        const docs = spec.docs ? (Array.isArray(party[spec.docs]) ? party[spec.docs] as Json[] : []) : [party];
        for (const doc of docs) {
          rows.push(spec.columns.map(c => c[1](party, doc, file.period)));
          totals.n++;
          for (const k of ['txval', 'igst', 'cgst', 'sgst', 'cess'] as const) totals[k] += Number(num(doc[k]) ?? 0);
        }
      }
      if (totals.n > 0) {
        const r2 = (x: number) => Math.round(x * 100) / 100;
        summary.push([periodLabel(file.period), spec.sheet, totals.n, r2(totals.txval), r2(totals.igst), r2(totals.cgst), r2(totals.sgst), r2(totals.cess)]);
      }
    }
    if (rows.length > 1) {
      sheets.push({ name: spec.sheet, rows, widths: spec.columns.map(c => c[2] ?? 12) });
      meta.rowsBySection[spec.sheet] = rows.length - 1;
    }
  }

  for (const file of parsed) {
    for (const key of Object.keys(file.docdata)) {
      if (!known.has(key) && !meta.unknownSections.includes(key)) meta.unknownSections.push(key);
    }
  }
  if (meta.unknownSections.length) {
    meta.warnings.push(`Sections not converted (not yet supported): ${meta.unknownSections.join(', ')}. Check them on the GST portal.`);
  }

  if (sheets.length === 0) {
    return { ok: false, error: 'No documents found in these files (all sections empty).' };
  }
  // Month first, then the section order above, so each month's lines sit together.
  const order = SECTIONS.map(x => x.sheet);
  const byMonth = parsed.map(p => periodLabel(p.period));
  const body = summary.slice(1).sort((a, b) =>
    byMonth.indexOf(String(a[0])) - byMonth.indexOf(String(b[0])) || order.indexOf(String(a[1])) - order.indexOf(String(b[1])));
  summary.splice(1, summary.length - 1, ...body);
  summary.push([]);
  summary.push(['Credit notes are shown with the amounts as reported; they reduce ITC. This sheet is a convenience total, not the official ITC summary.']);
  sheets.unshift({ name: 'Summary', rows: summary, widths: [14, 10, 11, 15, 13, 13, 13, 11] });

  return { ok: true, output: buildXlsx(sheets), meta: meta as unknown as Record<string, unknown> };
}

/** ToolResult contract entry point: input is JSON `[{ name, text }]` (the files' contents). */
export function run(input: string): ToolResult<Uint8Array> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    return convert(JSON.parse(input));
  } catch {
    return { ok: false, error: 'Input must be a JSON array of { name, text } files' };
  }
}
