import type { ToolResult } from '../shared/types';
import rateData from './gst-rates.json';

export type GstMode = 'exclusive' | 'inclusive';
export type SupplyType = 'intra' | 'inter';

export interface GstInput {
  amount: number;
  rate: number;
  /** exclusive: amount is before GST (add GST). inclusive: amount already includes GST (take it out). */
  mode: GstMode;
  /** intra-state: CGST + SGST/UTGST, half each. inter-state: IGST. */
  supply: SupplyType;
}

export interface GstResult {
  taxableValue: number;
  gst: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  rate: number;
  formula: string;
}

export const GST_RATES = rateData.rates;
export const GST_RATE_META = { effectiveFrom: rateData.effectiveFrom, lastChecked: rateData.lastChecked, reviewedBy: rateData.reviewedBy, sources: rateData.sources, note: rateData.note };

// `|| 0` turns floating-point -0 into 0 so "-0.00" never shows.
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100 || 0;

export function calculate(input: GstInput): ToolResult<GstResult> {
  const { amount, rate, mode, supply } = input;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return { ok: false, error: 'Amount must be a number' };
  if (amount < 0) return { ok: false, error: 'Amount must be 0 or more' };
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate < 0 || rate > 100) return { ok: false, error: 'GST rate must be between 0 and 100%' };
  if (mode !== 'exclusive' && mode !== 'inclusive') return { ok: false, error: 'Choose GST exclusive or inclusive' };
  if (supply !== 'intra' && supply !== 'inter') return { ok: false, error: 'Choose intra-state or inter-state supply' };

  let taxable: number, gst: number;
  if (mode === 'exclusive') {
    taxable = r2(amount);
    gst = r2(amount * rate / 100);
  } else {
    taxable = r2(amount * 100 / (100 + rate));
    gst = r2(amount - taxable);
  }
  // Intra-state: split equally; any odd paisa goes to CGST so the two halves always add up to the GST.
  const sgst = supply === 'intra' ? Math.floor(gst * 100 / 2) / 100 : 0;
  const cgst = supply === 'intra' ? r2(gst - sgst) : 0;
  const igst = supply === 'inter' ? gst : 0;
  const formula = mode === 'exclusive'
    ? `GST = amount × ${rate}% ; total = amount + GST`
    : `Taxable value = amount × 100 ÷ (100 + ${rate}) ; GST = amount − taxable value`;
  return { ok: true, output: { taxableValue: taxable, gst, cgst, sgst, igst, total: r2(taxable + gst), rate, formula } };
}

/** ToolResult contract entry point: input is JSON GstInput. */
export function run(input: string): ToolResult<GstResult> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) throw new Error();
    return calculate(parsed as GstInput);
  } catch {
    return { ok: false, error: 'Input must be JSON with amount, rate, mode and supply' };
  }
}
