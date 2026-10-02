import type { ToolResult } from '../shared/types';
import data from './tds-rates.json';

export type PayeeType = 'individual-huf' | 'other';

export interface TdsEntry {
  id: string;
  nature: string;
  oldSection: string;
  payee: string;
  payer: string;
  rates: { payee: string; rate: number }[];
  threshold: { type: string; amount?: number; single?: number; aggregate?: number; seniorAmount?: number; inclusive: boolean };
  thresholdText: string;
  source: { title: string; url: string };
}

export const TDS_DATA = data;
export const TDS_ENTRIES = data.entries as TdsEntry[];

/** Search by old section ("194J", "194-IA", "194I") or by words ("rent", "professional fees"). */
export function searchTds(query: string): TdsEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return TDS_ENTRIES;
  // Brackets are kept so "194-IA" (property) and "194-I(a)" (rent) stay different; spaces and hyphens are not.
  const section = (s: string) => s.toLowerCase().replace(/[\s-]/g, '');
  if (/^\d{3}/.test(q)) return TDS_ENTRIES.filter(e => section(e.oldSection).startsWith(section(q)));
  const terms = q.split(/\s+/);
  return TDS_ENTRIES.filter(e => terms.every(t => e.nature.toLowerCase().includes(t)));
}

export interface TdsCheckInput {
  entryId: string;
  /** This payment (for rent: the monthly rent; for property: the higher of consideration and stamp duty value). */
  amount: number;
  /** Total paid to this payee in the year including this payment (aggregate thresholds). */
  yearTotal?: number;
  payeeType?: PayeeType;
  seniorCitizen?: boolean;
}

export interface TdsCheckResult {
  applies: boolean;
  rate: number;
  tds: number;
  reason: string;
  entry: TdsEntry;
}

const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100 || 0;
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export function checkTds(input: TdsCheckInput): ToolResult<TdsCheckResult> {
  const entry = TDS_ENTRIES.find(e => e.id === input.entryId);
  if (!entry) return { ok: false, error: 'Choose the nature of payment' };
  if (typeof input.amount !== 'number' || !Number.isFinite(input.amount) || input.amount < 0) return { ok: false, error: 'Amount must be 0 or more' };
  const yearTotal = input.yearTotal ?? input.amount;
  if (!Number.isFinite(yearTotal) || yearTotal < input.amount) return { ok: false, error: 'Year total must include this payment (at least the payment amount)' };

  const rateRow = entry.rates.length === 1 ? entry.rates[0] : entry.rates.find(r => r.payee === (input.payeeType ?? 'other'));
  if (!rateRow) return { ok: false, error: 'Choose the payee type' };

  const t = entry.threshold;
  const over = (value: number, limit: number) => (t.inclusive ? value >= limit : value > limit);
  let applies: boolean, reason: string;
  switch (t.type) {
    case 'perMonth':
      applies = over(input.amount, t.amount!);
      reason = `Monthly amount ${inr(input.amount)} ${applies ? 'is above' : 'is not above'} ${inr(t.amount!)} per month.`;
      break;
    case 'singleOrAggregate':
      applies = over(input.amount, t.single!) || over(yearTotal, t.aggregate!);
      reason = applies
        ? (over(input.amount, t.single!) ? `Single payment ${inr(input.amount)} is above ${inr(t.single!)}.` : `Year total ${inr(yearTotal)} is above ${inr(t.aggregate!)}.`)
        : `Payment ${inr(input.amount)} is within ${inr(t.single!)} and the year total ${inr(yearTotal)} is within ${inr(t.aggregate!)}.`;
      break;
    case 'single':
      applies = over(input.amount, t.amount!);
      reason = `Amount ${inr(input.amount)} ${applies ? (t.inclusive ? 'reaches' : 'is above') : 'is below'} ${inr(t.amount!)}.`;
      break;
    default: {
      const limit = input.seniorCitizen && t.seniorAmount ? t.seniorAmount : t.amount!;
      applies = over(yearTotal, limit);
      reason = `Year total ${inr(yearTotal)} ${applies ? 'is above' : 'is not above'} ${inr(limit)}${input.seniorCitizen && t.seniorAmount ? ' (senior citizen limit)' : ''}.`;
    }
  }
  // Once the threshold is crossed, TDS applies to the payment (catch-up on earlier payments is not computed here).
  return { ok: true, output: { applies, rate: rateRow.rate, tds: applies ? r2(input.amount * rateRow.rate / 100) : 0, reason, entry } };
}

/** ToolResult contract entry point: input is a search query; output lists matching entries. */
export function run(input: string): ToolResult<TdsEntry[]> {
  const results = searchTds(input ?? '');
  return results.length ? { ok: true, output: results } : { ok: false, error: 'No matching TDS item. Only verified items are listed; check the Act for others.' };
}
