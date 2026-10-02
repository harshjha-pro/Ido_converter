import type { ToolResult } from '../shared/types';

/** All money values are per order, in the seller's currency. Percentages are 0–100. */
export interface ReturnLossInput {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  marketplaceFee: number;
  returnShippingCost: number;
  /** Repacking, inspection or refurbishing cost for each returned order. */
  restockCost: number;
  /** Marketplace fees that are not refunded when an order is returned. */
  nonRefundableFees: number;
  /** Share of returned items that can be sold again. */
  resellablePercent: number;
  returnRatePercent: number;
}

export interface ReturnLossResult {
  profitPerKeptOrder: number;
  lossPerReturnedOrder: number;
  expectedProfitPerOrder: number;
  profitPer100Orders: number;
  marginWithoutReturns: number;
  /** null when every order is returned (there is no kept revenue to divide by). */
  marginAfterReturns: number | null;
  /** Return rate at which expected profit hits zero; 0 when orders lose money even with no returns. */
  breakEvenReturnRate: number;
}

// The formula approved by the team on 2026-10-02 (see docs/tools/return-loss-calculator.md).
export const FORMULAS = [
  'Profit per kept order = price − product cost − shipping − marketplace fee',
  'Loss per returned order = shipping + return shipping + restock cost + non-refundable fees + product cost × (1 − resellable %)',
  'Expected profit per order = (1 − return rate) × profit per kept order − return rate × loss per returned order',
  'Margin after returns = expected profit per order ÷ ((1 − return rate) × price)',
  'Break-even return rate = profit per kept order ÷ (profit per kept order + loss per returned order)',
];

const round2 = (n: number) => Math.round(n * 100) / 100;
const round4 = (n: number) => Math.round(n * 10000) / 10000;

const LABELS: Record<keyof ReturnLossInput, string> = {
  sellingPrice: 'Selling price',
  productCost: 'Product cost',
  shippingCost: 'Shipping cost',
  marketplaceFee: 'Marketplace fee',
  returnShippingCost: 'Return shipping cost',
  restockCost: 'Restock cost',
  nonRefundableFees: 'Non-refundable fees',
  resellablePercent: 'Resellable share',
  returnRatePercent: 'Return rate',
};

function validate(input: ReturnLossInput): string | null {
  for (const key of Object.keys(LABELS) as (keyof ReturnLossInput)[]) {
    const v = input[key];
    if (typeof v !== 'number' || !Number.isFinite(v)) return `${LABELS[key]} must be a number`;
    if (v < 0) return `${LABELS[key]} must be 0 or more`;
  }
  if (input.sellingPrice === 0) return 'Selling price must be more than 0';
  if (input.resellablePercent > 100) return 'Resellable share must be between 0 and 100%';
  if (input.returnRatePercent > 100) return 'Return rate must be between 0 and 100%';
  return null;
}

export function calculate(input: ReturnLossInput): ToolResult<ReturnLossResult> {
  const error = validate(input);
  if (error) return { ok: false, error };

  const r = input.returnRatePercent / 100;
  const resellable = input.resellablePercent / 100;

  const kept = input.sellingPrice - input.productCost - input.shippingCost - input.marketplaceFee;
  const loss = input.shippingCost + input.returnShippingCost + input.restockCost + input.nonRefundableFees
    + input.productCost * (1 - resellable);
  const expected = (1 - r) * kept - r * loss;
  const keptRevenue = (1 - r) * input.sellingPrice;
  const breakEven = kept <= 0 ? 0 : kept / (kept + loss);

  return {
    ok: true,
    output: {
      profitPerKeptOrder: round2(kept),
      lossPerReturnedOrder: round2(loss),
      expectedProfitPerOrder: round2(expected),
      profitPer100Orders: round2(expected * 100),
      marginWithoutReturns: round4(kept / input.sellingPrice),
      marginAfterReturns: keptRevenue === 0 ? null : round4(expected / keptRevenue),
      breakEvenReturnRate: round4(breakEven),
    },
    meta: { lossEvenWithoutReturns: kept <= 0 },
  };
}

/** ToolResult contract entry point: input is a JSON object with the ReturnLossInput fields. */
export function run(input: string): ToolResult<ReturnLossResult> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    const parsed = JSON.parse(input);
    if (typeof parsed !== 'object' || parsed === null) throw new Error();
    return calculate(parsed as ReturnLossInput);
  } catch {
    return { ok: false, error: 'Input must be JSON with the return-loss fields' };
  }
}
