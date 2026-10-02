import { describe, it, expect } from 'vitest';
import { run, type ResultSetInfo } from '../../core/developers/sql-output-to-json';
import fs from 'fs';
import path from 'path';

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'sql-output-to-json', name), 'utf-8');
const parse = (text: string, opts = {}) => {
  const result = run(text, opts);
  expect(result.ok).toBe(true);
  return { data: JSON.parse(result.output!), sets: result.meta?.resultSets as ResultSetInfo[] };
};

describe('SQL output to JSON', () => {
  it('rejects empty input', () => {
    expect(run('  \n')).toEqual({ ok: false, error: 'Input is empty' });
  });

  it('explains when no table is found', () => {
    const result = run('just some text\nnothing tabular here');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/No result table found/);
  });

  it('parses psql aligned output with types, NULLs, Unicode and a pipe inside a value', () => {
    const { data, sets } = parse(fixture('psql-basic.txt'));
    expect(sets).toEqual([{ format: 'psql', columns: ['id', 'customer', 'city', 'total', 'paid', 'shipped_at'], rowCount: 4 }]);
    expect(data[0]).toEqual({ id: 1, customer: 'Asha Verma', city: 'Pune', total: 1499, paid: true, shipped_at: '2026-09-28 10:15:00' });
    expect(data[1].shipped_at).toBeNull();
    expect(data[1].total).toBe(250.5);
    expect(data[2].customer).toBe('राहुल शर्मा');
    expect(data[2].city).toBe('दिल्ली');
    expect(data[3].customer).toBe("O'Brien | Ltd");
    expect(data[3].paid).toBe(false);
  });

  it('can keep empty psql cells as empty strings', () => {
    const { data } = parse(fixture('psql-basic.txt'), { psqlEmptyAs: 'empty' });
    expect(data[1].shipped_at).toBe('');
  });

  it('parses mysql grid output, keeps leading-zero codes as strings and handles Empty set', () => {
    const { data, sets } = parse(fixture('mysql-basic.txt'));
    expect(sets.map(s => s.rowCount)).toEqual([4, 0]);
    const [products, empty] = data;
    expect(products[0]).toEqual({ id: 1, sku: '007-A', name: 'Steel bottle 750ml', stock: 120, price: 499, discontinued: 0 });
    expect(products[1].name).toBeNull();
    expect(products[2].name).toBe('Café mug ☕');
    expect(products[3].name).toBe('Bamboo | brush');
    expect(products[3].stock).toBeNull();
    expect(empty).toEqual([]);
  });

  it('supports several result sets in one paste, including an empty one', () => {
    const { data, sets } = parse(fixture('multi.txt'));
    expect(sets.map(s => s.rowCount)).toEqual([1, 2, 0]);
    expect(data[0]).toEqual([{ users: 1842 }]);
    expect(data[1][1]).toEqual({ email: 'ravi@example.com', plan: 'premium' });
    expect(data[2]).toEqual([]);
    expect(sets[2].columns).toEqual(['id']);
  });

  it('parses tab-separated text', () => {
    const { data, sets } = parse(fixture('tsv.txt'));
    expect(sets[0].format).toBe('tsv');
    expect(data[0]).toEqual({ id: 1, name: 'Asha Verma', city: 'Pune', score: 9.5, verified: true });
    expect(data[1].city).toBeNull();
    expect(data[2]).toEqual({ id: 3, name: 'मीरा', city: 'Jaipur', score: null, verified: true });
  });

  it('parses mysql \\G and psql \\x vertical output', () => {
    const { data, sets } = parse(fixture('vertical.txt'));
    expect(sets.map(s => s.format)).toEqual(['mysql-vertical', 'psql-expanded']);
    expect(data[0][0]).toEqual({ id: 7, email: 'meera@example.in', last_login: null });
    expect(data[1][1]).toEqual({ id: 2, name: 'Payments', active: false });
  });

  it('keeps text columns as text even when some values look like numbers or t/f', () => {
    const text = ' code | flag\n------+------\n 42   | t\n A7   | yes\n(2 rows)';
    const { data } = parse(text);
    expect(data).toEqual([{ code: '42', flag: 't' }, { code: 'A7', flag: 'yes' }]);
  });

  it('keeps integers beyond the safe range as strings', () => {
    const { data } = parse('id\n------\n 9007199254740993\n(1 row)'.replace('id\n', ' id\n'));
    expect(data[0].id).toBe('9007199254740993');
  });

  it('can turn type detection off', () => {
    const { data } = parse(fixture('tsv.txt'), { detectTypes: false });
    expect(data[0].id).toBe('1');
    expect(data[1].city).toBeNull();
  });

  it('renames duplicate column names', () => {
    const { data } = parse(' id | id | name\n----+----+------\n  1 |  2 | x\n(1 row)');
    expect(Object.keys(data[0])).toEqual(['id', 'id_2', 'name']);
  });

  it('handles large output', () => {
    const rows = Array.from({ length: 10000 }, (_, i) => `${i}\tuser${i}\t${i % 2 === 0}`);
    const { data } = parse(['id\tname\tactive', ...rows].join('\n'));
    expect(data).toHaveLength(10000);
    expect(data[9999]).toEqual({ id: 9999, name: 'user9999', active: false });
  });

  it('handles Windows line endings', () => {
    const { data } = parse(' a | b\r\n---+---\r\n 1 | x\r\n(1 row)\r\n');
    expect(data).toEqual([{ a: 1, b: 'x' }]);
  });
});

describe('SQL output to JSON precision', () => {
  it('keeps high-precision decimals as strings', () => {
    const { data } = parse(' amount\n--------\n 12345678901234.567890\n(1 row)');
    expect(data[0].amount).toBe('12345678901234.567890');
  });
});
