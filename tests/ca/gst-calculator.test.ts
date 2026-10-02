import { describe, it, expect } from 'vitest';
import { calculate, run, GST_RATES, GST_RATE_META } from '../../core/ca/gst-calculator';
import fs from 'fs';
import path from 'path';

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'gst-calculator', 'cases.json'), 'utf-8'));

describe('GST inclusive/exclusive calculator', () => {
  for (const c of cases) {
    it(c.name, () => {
      const r = calculate(c.input);
      expect(r.ok).toBe(true);
      expect(r.output).toMatchObject(c.expected);
    });
  }

  it('CGST + SGST always equal the GST, and taxable + GST equals the total', () => {
    for (let amount = 0.01; amount < 50; amount += 0.37) {
      for (const { rate } of GST_RATES) {
        for (const mode of ['exclusive', 'inclusive'] as const) {
          const o = calculate({ amount, rate, mode, supply: 'intra' }).output!;
          expect(Math.round((o.cgst + o.sgst) * 100)).toBe(Math.round(o.gst * 100));
          expect(Math.round((o.taxableValue + o.gst) * 100)).toBe(Math.round(o.total * 100));
          if (mode === 'inclusive') expect(o.total).toBeCloseTo(amount, 2);
        }
      }
    }
  });

  it('rate data carries sources, dates and the post-22-Sep-2025 slabs', () => {
    expect(GST_RATES.map(r => r.rate)).toEqual([0, 0.25, 1.5, 3, 5, 18, 40]);
    expect(GST_RATE_META.effectiveFrom).toBe('2025-09-22');
    expect(GST_RATE_META.sources.length).toBeGreaterThan(0);
    for (const s of GST_RATE_META.sources) expect(s.url).toMatch(/^https:\/\/(www\.)?(pib|gstcouncil)\.gov\.in\//);
  });

  it.each([
    [{ amount: -1, rate: 18, mode: 'exclusive', supply: 'intra' }, 'Amount must be 0 or more'],
    [{ amount: Number.NaN, rate: 18, mode: 'exclusive', supply: 'intra' }, 'Amount must be a number'],
    [{ amount: 1, rate: 120, mode: 'exclusive', supply: 'intra' }, 'GST rate must be between 0 and 100%'],
    [{ amount: 1, rate: 18, mode: 'both', supply: 'intra' }, 'Choose GST exclusive or inclusive'],
    [{ amount: 1, rate: 18, mode: 'exclusive', supply: 'export' }, 'Choose intra-state or inter-state supply'],
  ])('rejects invalid input %#', (input, error) => {
    expect(calculate(input as never)).toEqual({ ok: false, error });
  });

  it('run() accepts JSON and handles large amounts', () => {
    expect(run(JSON.stringify({ amount: 1e10, rate: 18, mode: 'exclusive', supply: 'inter' })).output?.igst).toBe(1.8e9);
    expect(run('').ok).toBe(false);
  });
});
