import { describe, it, expect } from 'vitest';
import { calculate, run, FORMULA_TEXT } from '../../core/jobseekers/notice-period-buyout';
import fs from 'fs';
import path from 'path';

const cases = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'notice-period-buyout', 'cases.json'), 'utf-8'));

describe('Notice period buyout calculator', () => {
  for (const c of cases) {
    it(c.name, () => {
      const r = calculate(c.input);
      expect(r.ok).toBe(true);
      expect(r.output).toMatchObject(c.expected);
    });
  }

  it('flags when the full notice was served', () => {
    expect(calculate({ monthlySalary: 50000, noticeDays: 30, daysServed: 30 }).meta?.servedFullNotice).toBe(true);
    expect(calculate({ monthlySalary: 50000, noticeDays: 30, daysServed: 29 }).meta?.servedFullNotice).toBe(false);
  });

  it('states the formula as an assumption-carrying text', () => {
    expect(calculate({ monthlySalary: 1, noticeDays: 1, daysServed: 0 }).output?.formula).toBe(FORMULA_TEXT);
  });

  it.each([
    [{ monthlySalary: -1, noticeDays: 30, daysServed: 0 }, 'Monthly salary must be 0 or more'],
    [{ monthlySalary: 50000, noticeDays: 0, daysServed: 0 }, 'Notice period must be more than 0'],
    [{ monthlySalary: 50000, noticeDays: 30, daysServed: -5 }, 'Days served must be 0 or more'],
    [{ monthlySalary: Number.NaN, noticeDays: 30, daysServed: 0 }, 'Monthly salary must be a number'],
    [{ monthlySalary: 50000, noticeDays: 30, daysServed: 0, dayBasis: 0 }, 'Day basis must be more than 0'],
    [{ monthlySalary: 50000, noticeDays: 30, daysServed: 0, dayBasis: 365 }, 'Day basis should be the number of days in a month (for example 30 or 26)'],
  ])('rejects invalid input %#', (input, error) => {
    expect(calculate(input as never)).toEqual({ ok: false, error });
  });

  it('run() accepts JSON input and rejects empty or non-JSON input', () => {
    expect(run('{"monthlySalary": 30000, "noticeDays": 30, "daysServed": 15}').output?.buyoutAmount).toBe(15000);
    expect(run('')).toEqual({ ok: false, error: 'Input is empty' });
    expect(run('salary 30000').ok).toBe(false);
    expect(run('"text"').ok).toBe(false);
  });

  it('handles very large salaries without overflow', () => {
    expect(calculate({ monthlySalary: 1e9, noticeDays: 90, daysServed: 0 }).output?.buyoutAmount).toBe(3e9);
  });
});
