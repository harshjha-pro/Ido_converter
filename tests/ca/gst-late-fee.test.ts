import { describe, it, expect } from 'vitest';
import { calculate, run, LATE_FEE_RULES } from '../../core/ca/gst-late-fee';
import fs from 'fs';
import path from 'path';

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'gst-late-fee', 'cases.json'), 'utf-8'));
const base = cases[0].input;

describe('GST late fee and interest (GSTR-3B)', () => {
  for (const c of cases) {
    it(c.name, () => {
      const r = calculate(c.input);
      expect(r.ok, r.error).toBe(true);
      expect(r.output).toMatchObject(c.expected);
    });
  }

  it('explains the calculation step by step', () => {
    const o = calculate(cases[1].input).output!;
    expect(o.explanation[0]).toMatch(/100 day\(s\) late × ₹25 per day per Act = ₹2,500 per Act, capped at ₹1,000/);
    expect(o.explanation[1]).toMatch(/Interest = ₹50,000 × 18% × 100 ÷ 365/);
  });

  it('refuses periods whose rules are not recorded', () => {
    expect(calculate({ ...base, taxPeriod: '2021-05' }).error).toMatch(/before June 2021/);
  });

  it.each([
    [{ ...base, taxPeriod: '2026-13' }, 'Tax period must be a month (YYYY-MM)'],
    [{ ...base, dueDate: '2026-02-30' }, 'Enter a valid due date'],
    [{ ...base, filingDate: 'tomorrow' }, 'Enter a valid filing date'],
    [{ ...base, turnoverBand: 'huge' }, 'Choose the turnover band'],
    [{ ...base, cashLiability: -1 }, 'Tax paid in cash must be 0 or more'],
    [{ ...base, minCashLedgerBalance: -5 }, 'Minimum cash ledger balance must be 0 or more'],
  ])('rejects invalid input %#', (input, error) => {
    expect(calculate(input as never)).toEqual({ ok: false, error });
  });

  it('rules are data with sources', () => {
    expect(LATE_FEE_RULES.lateFee.capPerAct).toEqual({ nil: 250, upTo1_5Cr: 1000, from1_5To5Cr: 2500, above5Cr: 5000 });
    expect(LATE_FEE_RULES.interest.ratePercentPerYear).toBe(18);
    for (const s of [...LATE_FEE_RULES.lateFee.sources, ...LATE_FEE_RULES.interest.sources]) expect(s.url).toMatch(/\.gov\.in\//);
  });

  it('run() accepts JSON', () => {
    expect(run(JSON.stringify(base)).output?.lateFeeTotal).toBe(500);
    expect(run('x').ok).toBe(false);
  });
});
