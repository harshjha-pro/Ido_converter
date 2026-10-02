import { describe, it, expect } from 'vitest';
import { calculate, run, FORMULA_TEXT } from '../../core/sellers/volumetric-weight';
import fs from 'fs';
import path from 'path';

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'volumetric-weight', 'cases.json'), 'utf-8'));
const base = { length: 40, width: 30, height: 20, unit: 'cm' as const, divisor: 5000 };

describe('Volumetric weight calculator', () => {
  for (const c of cases) {
    it(c.name, () => {
      const r = calculate(c.input);
      expect(r.ok).toBe(true);
      expect(r.output).toMatchObject(c.expected);
    });
  }

  it('shows the formula', () => {
    expect(calculate(base).output?.formula).toBe(FORMULA_TEXT);
  });

  it('requires a divisor instead of assuming one', () => {
    expect(calculate({ ...base, divisor: Number.NaN })).toEqual({ ok: false, error: "Enter your courier's divisor (check their rate card)" });
  });

  it.each([
    [{ ...base, length: 0 }, 'Length must be more than 0'],
    [{ ...base, width: -3 }, 'Width must be more than 0'],
    [{ ...base, height: Number.POSITIVE_INFINITY }, 'Height must be a number'],
    [{ ...base, divisor: 0 }, 'Divisor must be more than 0'],
    [{ ...base, actualWeight: -1 }, 'Actual weight must be 0 or more'],
    [{ ...base, unit: 'mm' }, 'Unit must be cm or in'],
  ])('rejects invalid input %#', (input, error) => {
    expect(calculate(input as never)).toEqual({ ok: false, error });
  });

  it('treats an empty actual weight as not entered', () => {
    expect(calculate({ ...base, actualWeight: Number.NaN }).output?.higher).toBeNull();
  });

  it('run() accepts JSON and rejects empty or non-JSON input', () => {
    expect(run(JSON.stringify(base)).output?.volumetricWeight).toBe(4.8);
    expect(run('')).toEqual({ ok: false, error: 'Input is empty' });
    expect(run('40x30x20').ok).toBe(false);
  });

  it('handles very large boxes', () => {
    expect(calculate({ ...base, length: 1000, width: 1000, height: 1000 }).output?.volumetricWeight).toBe(200000);
  });
});
