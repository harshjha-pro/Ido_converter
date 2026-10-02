import type { ToolResult } from '../shared/types';

export interface BuyoutInput {
  /** The monthly figure your employer uses for recovery (often basic or gross; check your offer letter). */
  monthlySalary: number;
  noticeDays: number;
  daysServed: number;
  /** Days per month used to get a daily rate. ASSUMPTION: 30 by default; some employers use 26 working days or calendar days. */
  dayBasis?: number;
}

export interface BuyoutResult {
  dailyRate: number;
  remainingDays: number;
  buyoutAmount: number;
  dayBasis: number;
  formula: string;
}

export const DEFAULT_DAY_BASIS = 30;

// Shown on the page verbatim so users can check the arithmetic against their employer's policy.
export const FORMULA_TEXT = 'Buyout = (monthly salary ÷ day basis) × (notice days − days served), never below 0';

const round2 = (n: number) => Math.round(n * 100) / 100;

function check(name: string, value: unknown, { min = 0, allowZero = true } = {}): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return `${name} must be a number`;
  if (value < min || (!allowZero && value === 0)) return `${name} must be ${allowZero ? `${min} or more` : 'more than 0'}`;
  return null;
}

export function calculate(input: BuyoutInput): ToolResult<BuyoutResult> {
  const dayBasis = input.dayBasis ?? DEFAULT_DAY_BASIS;
  const error =
    check('Monthly salary', input.monthlySalary) ??
    check('Notice period', input.noticeDays, { allowZero: false }) ??
    check('Days served', input.daysServed) ??
    check('Day basis', dayBasis, { allowZero: false });
  if (error) return { ok: false, error };
  if (dayBasis > 31) return { ok: false, error: 'Day basis should be the number of days in a month (for example 30 or 26)' };

  const remainingDays = Math.max(0, input.noticeDays - input.daysServed);
  const dailyRate = input.monthlySalary / dayBasis;
  const buyoutAmount = round2(dailyRate * remainingDays);

  return {
    ok: true,
    output: { dailyRate: round2(dailyRate), remainingDays, buyoutAmount, dayBasis, formula: FORMULA_TEXT },
    meta: { servedFullNotice: input.daysServed >= input.noticeDays },
  };
}

/** ToolResult contract entry point: input is a JSON object with the BuyoutInput fields. */
export function run(input: string): ToolResult<BuyoutResult> {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch {
    return { ok: false, error: 'Input must be JSON with monthlySalary, noticeDays and daysServed' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Input must be JSON with monthlySalary, noticeDays and daysServed' };
  }
  return calculate(parsed as BuyoutInput);
}
