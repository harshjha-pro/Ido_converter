import type { ToolResult } from '../shared/types';
import rules from './gst-late-fee-rules.json';

export type TurnoverBand = 'upTo1_5Cr' | 'from1_5To5Cr' | 'above5Cr';

export interface LateFeeInput {
  /** Tax period as YYYY-MM (the month the return is for). */
  taxPeriod: string;
  /** Due date and actual filing/payment date, YYYY-MM-DD. */
  dueDate: string;
  filingDate: string;
  nilReturn: boolean;
  /** Aggregate annual turnover in the preceding financial year. */
  turnoverBand: TurnoverBand;
  /** Tax for this period paid by debiting the electronic cash ledger (Section 50 proviso: interest only on this). */
  cashLiability: number;
  /**
   * Lowest balance in the electronic cash ledger between the due date and the date of payment.
   * Reduces the interest base for tax periods from January 2026 (GST portal advisory).
   */
  minCashLedgerBalance?: number;
}

export interface LateFeeResult {
  daysLate: number;
  lateFeePerAct: number;
  lateFeeTotal: number;
  lateFeeCapped: boolean;
  interestBase: number;
  interest: number;
  explanation: string[];
}

export const LATE_FEE_RULES = rules;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PERIOD = /^\d{4}-(0[1-9]|1[0-2])$/;
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100 || 0;
const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

function toUtcDay(s: string): number | null {
  if (!DATE.test(s)) return null;
  const [y, m, d] = s.split('-').map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  return back.getUTCFullYear() === y && back.getUTCMonth() === m - 1 && back.getUTCDate() === d ? t / 86400000 : null;
}

export function calculate(input: LateFeeInput): ToolResult<LateFeeResult> {
  if (!PERIOD.test(input.taxPeriod ?? '')) return { ok: false, error: 'Tax period must be a month (YYYY-MM)' };
  if (input.taxPeriod < rules.lateFee.appliesFromPeriod) {
    return { ok: false, error: 'Tax periods before June 2021 used different late fee rules, which this tool does not cover.' };
  }
  const due = toUtcDay(input.dueDate);
  const filed = toUtcDay(input.filingDate);
  if (due === null) return { ok: false, error: 'Enter a valid due date' };
  if (filed === null) return { ok: false, error: 'Enter a valid filing date' };
  if (!['upTo1_5Cr', 'from1_5To5Cr', 'above5Cr'].includes(input.turnoverBand)) return { ok: false, error: 'Choose the turnover band' };
  const cash = input.nilReturn ? 0 : input.cashLiability;
  if (typeof cash !== 'number' || !Number.isFinite(cash) || cash < 0) return { ok: false, error: 'Tax paid in cash must be 0 or more' };
  const minEcl = input.minCashLedgerBalance ?? 0;
  if (typeof minEcl !== 'number' || !Number.isFinite(minEcl) || minEcl < 0) return { ok: false, error: 'Minimum cash ledger balance must be 0 or more' };

  const daysLate = Math.max(0, filed - due);
  const explanation: string[] = [];

  // Late fee: per day per Act, capped by notification 19/2021-CT.
  const perDay = input.nilReturn ? rules.lateFee.perDayPerAct.nil : rules.lateFee.perDayPerAct.withLiability;
  const cap = input.nilReturn ? rules.lateFee.capPerAct.nil : rules.lateFee.capPerAct[input.turnoverBand];
  const uncapped = daysLate * perDay;
  const lateFeePerAct = Math.min(uncapped, cap);
  const acts = rules.lateFee.acts.length;
  explanation.push(daysLate === 0
    ? 'Filed on or before the due date: no late fee or interest.'
    : `${daysLate} day(s) late × ${inr(perDay)} per day per Act = ${inr(uncapped)} per Act${uncapped > cap ? `, capped at ${inr(cap)}` : ''}; × ${acts} (${rules.lateFee.acts.join(' + ')}) = ${inr(lateFeePerAct * acts)}.`);

  // Interest: Section 50(1) proviso, on tax paid in cash; from Jan 2026 periods, less the minimum cash ledger balance.
  const eclApplies = input.taxPeriod >= rules.interest.cashLedgerBenefitFromPeriod;
  const interestBase = r2(Math.max(0, cash - (eclApplies ? minEcl : 0)));
  const interest = r2(interestBase * rules.interest.ratePercentPerYear / 100 * daysLate / rules.interest.dayCountBasis);
  if (daysLate > 0 && !input.nilReturn) {
    explanation.push(`Interest = ${inr(interestBase)} × ${rules.interest.ratePercentPerYear}% × ${daysLate} ÷ ${rules.interest.dayCountBasis} = ${inr(interest)}.`);
    if (eclApplies && minEcl > 0) explanation.push(`Interest base reduced by the minimum cash ledger balance of ${inr(minEcl)} (tax periods from January 2026).`);
    if (!eclApplies && minEcl > 0) explanation.push('The minimum cash ledger balance only reduces interest for tax periods from January 2026, so it was not used.');
  }

  return {
    ok: true,
    output: { daysLate, lateFeePerAct, lateFeeTotal: lateFeePerAct * acts, lateFeeCapped: uncapped > cap, interestBase, interest, explanation },
  };
}

/** ToolResult contract entry point: input is JSON LateFeeInput. */
export function run(input: string): ToolResult<LateFeeResult> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) throw new Error();
    return calculate(parsed as LateFeeInput);
  } catch {
    return { ok: false, error: 'Input must be JSON with the late fee fields' };
  }
}
