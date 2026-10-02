import type { ToolResult } from '../shared/types';
import data from './due-dates.json';

export type GstFiling = 'monthly' | 'qrmp' | 'none';
export type Category = 'GST' | 'TDS' | 'Advance tax';

export interface CalendarOptions {
  /** Financial year start, e.g. 2026 for FY 2026-27 (April 2026 to March 2027). */
  fyStartYear: number;
  gst: GstFiling;
  /** Needed for QRMP GSTR-3B (22nd or 24th by state of principal place of business). */
  state?: string;
  tdsDeductor: boolean;
  advanceTax: boolean;
}

export interface DueItem {
  date: string;        // YYYY-MM-DD
  title: string;
  period: string;
  category: Category;
  source: { title: string; url: string };
}

export const DUE_DATA = data;
export const STATES = [...data.gst.groupA, ...data.gst.groupB].sort();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
/** The month after (year, month) as [year, month]. */
const next = (y: number, m: number): [number, number] => (m === 12 ? [y + 1, 1] : [y, m + 1]);

/** The 12 months of a financial year, April to March, as [year, month]. */
function fyMonths(fy: number): [number, number][] {
  return Array.from({ length: 12 }, (_, i) => (i < 9 ? [fy, i + 4] : [fy + 1, i - 8]) as [number, number]);
}

export function generate(o: CalendarOptions): ToolResult<DueItem[]> {
  if (!Number.isInteger(o.fyStartYear) || o.fyStartYear < 2026 || o.fyStartYear > 2100) {
    return { ok: false, error: 'Choose financial year 2026-27 or later (earlier years had different forms and rules).' };
  }
  if (!['monthly', 'qrmp', 'none'].includes(o.gst)) return { ok: false, error: 'Choose how you file GST' };
  let gstr3bQuarterDay = 0;
  if (o.gst === 'qrmp') {
    if (data.gst.groupA.includes(o.state ?? '')) gstr3bQuarterDay = data.gst.qrmp.gstr3bDayGroupA;
    else if (data.gst.groupB.includes(o.state ?? '')) gstr3bQuarterDay = data.gst.qrmp.gstr3bDayGroupB;
    else return { ok: false, error: 'Choose the state or UT of your principal place of business (quarterly GSTR-3B is due on the 22nd or 24th depending on it).' };
  }

  const S = data.sources;
  const items: DueItem[] = [];
  const fyLabel = `FY ${o.fyStartYear}-${String(o.fyStartYear + 1).slice(2)}`;

  for (const [y, m] of fyMonths(o.fyStartYear)) {
    const [ny, nm] = next(y, m);
    const period = `${MONTHS[m - 1]} ${y}`;
    const quarterEnd = m % 3 === 0;
    if (o.gst === 'monthly') {
      items.push({ date: iso(ny, nm, data.gst.monthly.gstr1Day), title: 'GSTR-1 (monthly)', period, category: 'GST', source: S.gstr1 });
      items.push({ date: iso(ny, nm, data.gst.monthly.gstr3bDay), title: 'GSTR-3B (monthly) and tax payment', period, category: 'GST', source: S.gstr3b });
    }
    if (o.gst === 'qrmp') {
      if (!quarterEnd) {
        items.push({ date: iso(ny, nm, data.gst.qrmp.iffDay), title: 'IFF: invoice furnishing facility (optional, QRMP)', period, category: 'GST', source: S.qrmp });
        items.push({ date: iso(ny, nm, data.gst.qrmp.pmt06Day), title: 'PMT-06 monthly tax payment (QRMP)', period, category: 'GST', source: S.qrmp });
      } else {
        const q = `${MONTHS[m - 3]}–${MONTHS[m - 1]} ${y}`;
        items.push({ date: iso(ny, nm, data.gst.qrmp.gstr1Day), title: 'GSTR-1 (quarterly, QRMP)', period: q, category: 'GST', source: S.gstr1 });
        items.push({ date: iso(ny, nm, gstr3bQuarterDay), title: `GSTR-3B (quarterly, QRMP, ${o.state})`, period: q, category: 'GST', source: S.rule61 });
      }
    }
    if (o.tdsDeductor) {
      const march = m === 3;
      const date = march ? iso(y, data.tds.marchDeposit.month, data.tds.marchDeposit.day) : iso(ny, nm, data.tds.depositDay);
      items.push({ date, title: 'TDS deposit (non-government deductors)', period, category: 'TDS', source: S.tdsDeposit });
    }
  }
  if (o.tdsDeductor) {
    for (const s of data.tds.statements) {
      const year = s.nextYear || s.month < 4 ? o.fyStartYear + 1 : o.fyStartYear;
      items.push({ date: iso(year, s.month, s.day), title: 'Quarterly TDS statements (earlier Forms 24Q, 26Q and others)', period: `${s.quarter} ${fyLabel}`, category: 'TDS', source: S.tdsReturn });
    }
  }
  if (o.advanceTax) {
    for (const a of data.advanceTax) {
      const year = a.month < 4 ? o.fyStartYear + 1 : o.fyStartYear;
      items.push({ date: iso(year, a.month, a.day), title: `Advance tax instalment (${a.cumulative} of the year's tax, cumulative)`, period: fyLabel, category: 'Advance tax', source: S.advanceTax });
    }
  }
  if (items.length === 0) return { ok: false, error: 'Nothing to show: choose GST filing, TDS or advance tax.' };
  items.sort((a, b) => a.date.localeCompare(b.date) || a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  return { ok: true, output: items, meta: { lastChecked: data.lastChecked } };
}

/** iCalendar file (RFC 5545) with an all-day event per due date, so it can be added to any calendar app. */
export function toIcs(items: DueItem[], stamp = '20261002T000000Z'): string {
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/[,;]/g, m => `\\${m}`).replace(/\n/g, '\\n');
  const fold = (line: string) => {
    // Lines over 75 octets must be folded; keep it simple by splitting on characters (ASCII-safe content).
    const out: string[] = [];
    for (let i = 0; i < line.length; i += 73) out.push((i ? ' ' : '') + line.slice(i, i + 73));
    return out.join('\r\n');
  };
  const events = items.map((it, i) => {
    const d = it.date.replace(/-/g, '');
    const [y, m, day] = it.date.split('-').map(Number);
    const end = new Date(Date.UTC(y, m - 1, day + 1)).toISOString().slice(0, 10).replace(/-/g, '');
    return ['BEGIN:VEVENT', `UID:${d}-${i}@idoconverter`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${end}`,
      fold(`SUMMARY:${esc(`${it.title}: ${it.period}`)}`), fold(`DESCRIPTION:${esc(`Due date as per rules; check for extensions. Source: ${it.source.url}`)}`), 'END:VEVENT'].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//idoconverter//compliance calendar//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join('\r\n') + '\r\n';
}

/** ToolResult contract entry point: input is JSON CalendarOptions. */
export function run(input: string): ToolResult<DueItem[]> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) throw new Error();
    return generate(parsed as CalendarOptions);
  } catch {
    return { ok: false, error: 'Input must be JSON calendar options' };
  }
}
