import { describe, it, expect } from 'vitest';
import { clean, run, parseAmount, parseDate, parseCsv, toCsv, type CleanerMeta, type CleanRow } from '../../core/ca/bank-statement-cleaner';
import fs from 'fs';
import path from 'path';

const fixture = (n: string) => fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'bank-statement-cleaner', n), 'utf-8');
const ok = (text: string, opts = {}) => {
  const r = clean(text, opts);
  expect(r.ok, r.error).toBe(true);
  return { rows: r.output as CleanRow[], meta: r.meta as unknown as CleanerMeta };
};

describe('Bank statement CSV cleaner', () => {
  it('rejects empty input and files without a recognisable header', () => {
    expect(clean('').ok).toBe(false);
    expect(clean('hello,world\n1,2').error).toMatch(/header row/);
  });

  it('style A: skips preamble, opening balance, totals and footer; parses Indian amounts', () => {
    const { rows, meta } = ok(fixture('style-a-split-columns.csv'));
    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({ date: '02-04-2026', narration: 'UPI/ASHA VERMA/rent, April', reference: '0000412345', withdrawal: 15000, deposit: 0, balance: 35000 });
    expect(rows[1].deposit).toBe(85000);
    expect(rows[1].balance).toBe(120000);
    expect(meta.headerRow).toBe(5);
    expect(meta.columns).toMatchObject({ date: 'Date', narration: 'Narration', withdrawal: 'Withdrawal Amt.', deposit: 'Deposit Amt.', balance: 'Closing Balance' });
    expect(meta.totals).toEqual({ withdrawals: 17000, deposits: 85412.5, count: 4 });
    expect(meta.openingBalance).toBe(50000);
    expect(meta.closingBalance).toBe(118412.5);
    expect(meta.balanceMismatches).toEqual([]);
    expect(meta.skippedLines).toBe(3); // opening balance, total row, footer (blank rows are not counted)
  });

  it('style B: single amount column with Dr/Cr and "CR" balances, month-name dates', () => {
    const { rows, meta } = ok(fixture('style-b-amount-drcr.csv'));
    expect(rows.map(r => [r.date, r.withdrawal, r.deposit, r.balance])).toEqual([
      ['01-04-2026', 10000, 0, 40000], ['03-04-2026', 0, 25000, 65000], ['17-04-2026', 1234.56, 0, 63765.44],
    ]);
    expect(meta.balanceMismatches).toEqual([]);
  });

  it('style C: semicolon file, ISO dates, newest first is reversed to oldest first', () => {
    const { rows, meta } = ok(fixture('style-c-newest-first.csv'));
    expect(meta.delimiter).toBe(';');
    expect(meta.reversed).toBe(true);
    expect(rows.map(r => r.date)).toEqual(['01-04-2026', '15-04-2026', '28-04-2026']);
    expect(meta.balanceMismatches).toEqual([]);
    expect(meta.columns.date).toBe('Transaction Date');
  });

  it('style D: US month-first dates detected; brackets mean withdrawal', () => {
    const { rows, meta } = ok(fixture('style-d-negative-amount.csv'));
    expect(meta.dateOrder).toBe('MDY');
    expect(rows.map(r => [r.date, r.withdrawal, r.deposit])).toEqual([['13-04-2026', 0, 2000], ['15-04-2026', 1000, 0], ['30-04-2026', 0, 250]]);
  });

  it('flags rows where the running balance does not add up', () => {
    const broken = fixture('style-b-amount-drcr.csv').replace('"65,000.00 CR"', '"66,000.00 CR"');
    expect(ok(broken).meta.balanceMismatches).toEqual([2, 3]);
  });

  it('lets the user force the date order and columns', () => {
    const text = 'Date,Info,Debit,Credit\n03/04/2026,x,10,\n';
    expect(ok(text).rows[0].date).toBe('03-04-2026');
    expect(ok(text, { dateOrder: 'MDY' }).rows[0].date).toBe('04-03-2026');
    const custom = 'A,B,C\n03/04/2026,thing,50\n';
    expect(ok(custom, { columns: { date: 0, narration: 1, withdrawal: 2 } }).rows[0]).toMatchObject({ narration: 'thing', withdrawal: 50 });
  });

  it('parses amounts, dates and CSV edge cases', () => {
    expect(parseAmount('1,23,456.78')).toEqual({ value: 123456.78 });
    expect(parseAmount('₹ 500')?.value).toBe(500);
    expect(parseAmount('(250.00)')?.value).toBe(-250);
    expect(parseAmount('100 Dr')).toEqual({ value: 100, drcr: 'dr' });
    expect(parseAmount('abc')).toBeNull();
    expect(parseDate('31/02/2026', 'DMY')).toBeNull();
    expect(parseDate('29-Feb-2028', 'DMY')).toEqual([29, 2, 2028]);
    expect(parseDate('2026-04-05 10:30:00', 'DMY')).toEqual([5, 4, 2026]);
    expect(parseCsv('a,"b ""q"", c",d\n', ',')).toEqual([['a', 'b "q", c', 'd']]);
  });

  it('writes a clean CSV with quoted narrations', () => {
    const csv = toCsv(ok(fixture('style-a-split-columns.csv')).rows);
    expect(csv.split('\r\n')[0]).toBe('Date,Narration,Reference,Withdrawal,Deposit,Balance');
    expect(csv).toContain('02-04-2026,"UPI/ASHA VERMA/rent, April",0000412345,15000.00,,35000.00');
    expect(run(fixture('style-c-newest-first.csv')).output).toContain('01-04-2026,GST PAYMENT,,1000.00,,5000.00');
  });

  it('handles large statements and Unicode narrations', () => {
    const lines = ['Date,Narration,Debit,Credit,Balance'];
    let bal = 0;
    for (let i = 0; i < 20000; i++) { bal += 10; lines.push(`01/04/2026,जमा ${i},,10.00,${bal}.00`); }
    const { rows, meta } = ok(lines.join('\n'));
    expect(rows).toHaveLength(20000);
    expect(rows[5].narration).toBe('जमा 5');
    expect(meta.balanceMismatches).toEqual([]);
  });
});
