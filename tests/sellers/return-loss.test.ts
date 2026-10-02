import { describe, it, expect } from 'vitest';
import { calculate, run, type ReturnLossInput } from '../../core/sellers/return-loss';
import fs from 'fs';
import path from 'path';

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'return-loss', 'cases.json'), 'utf-8'));
const base: ReturnLossInput = cases[0].input;

describe('Return-loss calculator', () => {
  for (const c of cases) {
    it(c.name, () => {
      const r = calculate(c.input);
      expect(r.ok).toBe(true);
      expect(r.output).toMatchObject(c.expected);
    });
  }

  it('expected profit is exactly zero at the break-even return rate', () => {
    const be = calculate(base).output!.breakEvenReturnRate * 100;
    expect(calculate({ ...base, returnRatePercent: be }).output!.expectedProfitPerOrder).toBeCloseTo(0, 2);
  });

  it('flags orders that lose money even without returns', () => {
    expect(calculate(cases[4].input).meta?.lossEvenWithoutReturns).toBe(true);
    expect(calculate(base).meta?.lossEvenWithoutReturns).toBe(false);
  });

  it.each([
    [{ ...base, sellingPrice: 0 }, 'Selling price must be more than 0'],
    [{ ...base, productCost: -1 }, 'Product cost must be 0 or more'],
    [{ ...base, returnRatePercent: 120 }, 'Return rate must be between 0 and 100%'],
    [{ ...base, resellablePercent: 101 }, 'Resellable share must be between 0 and 100%'],
    [{ ...base, marketplaceFee: Number.NaN }, 'Marketplace fee must be a number'],
  ])('rejects invalid input %#', (input, error) => {
    expect(calculate(input)).toEqual({ ok: false, error });
  });

  it('run() accepts JSON and rejects empty or non-JSON input', () => {
    expect(run(JSON.stringify(base)).output?.expectedProfitPerOrder).toBe(292.5);
    expect(run('')).toEqual({ ok: false, error: 'Input is empty' });
    expect(run('price 1000').ok).toBe(false);
  });
});
