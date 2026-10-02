import { describe, it, expect } from 'vitest';
import { run, type MappingEntry } from '../../core/developers/pseudonymizer';
import fs from 'fs';
import path from 'path';

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures', 'pseudonymizer');
const fixture = (name: string) => fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf-8');

describe('Consistent Pseudonymizer', () => {
  it('rejects empty input', () => {
    expect(run('   ')).toEqual({ ok: false, error: 'Input is empty' });
  });

  it('rejects invalid JSON', () => {
    const result = run('{ name: ');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Invalid JSON/);
  });

  it('gives the same fake for the same value across keys, records and case of emails', () => {
    const out = JSON.parse(run(fixture('normal.json'), { seed: 's1' }).output!);
    const [a, b, c] = out.orders;
    expect(a.customer.name).toBe(b.customer.name);
    expect(a.customer.email).toBe(b.customer.email);
    expect(a.customer.phone).toBe(b.customer.phone);
    expect(out.support_tickets[0].reporterEmail).toBe(a.customer.email);
    expect(out.support_tickets[0].note).toContain(a.customer.phone);
    expect(c.customer.email).not.toBe(a.customer.email);
  });

  it('keeps structure, ids, totals, booleans and null', () => {
    const out = JSON.parse(run(fixture('normal.json'), { seed: 's1' }).output!);
    expect(out.orders.map((o: { id: number }) => o.id)).toEqual([1001, 1002, 1003]);
    expect(out.orders[0].total).toBe(1499);
    expect(out.flags).toEqual({ active: true, deleted: null });
  });

  it('produces realistic fakes in the original format', () => {
    const out = JSON.parse(run(fixture('normal.json'), { seed: 's1' }).output!);
    const cust = out.orders[0].customer;
    expect(cust.email).toMatch(/^user\.[a-z0-9]{6}@example\.com$/);
    expect(cust.phone).toMatch(/^\+91 [6-9]\d{4} \d{5}$/);
    expect(cust.name.split(' ')).toHaveLength(2);
    expect(out.support_tickets[0].note).toMatch(/PAN [A-Z]{5}\d{4}[A-Z]/);
  });

  it('is reproducible with the same seed and different with another seed', () => {
    const input = fixture('normal.json');
    expect(run(input, { seed: 'abc' }).output).toBe(run(input, { seed: 'abc' }).output);
    expect(run(input, { seed: 'abc' }).output).not.toBe(run(input, { seed: 'xyz' }).output);
  });

  it('keeps numeric phone numbers as numbers with the same digit count', () => {
    const out = JSON.parse(run(JSON.stringify({ mobile: 9123456780, pin: 560001 }), { keysToReplace: ['mobile', 'pin'] }).output!);
    expect(typeof out.mobile).toBe('number');
    expect(String(out.mobile)).toHaveLength(10);
    expect(out.mobile).not.toBe(9123456780);
    expect(String(out.pin)).toHaveLength(6);
  });

  it('only returns the mapping when asked', () => {
    const input = fixture('normal.json');
    expect(run(input).meta?.mapping).toBeUndefined();
    const mapping = run(input, { includeMapping: true }).meta?.mapping as MappingEntry[];
    expect(mapping.find(m => m.original === 'asha.verma@example.in')?.kind).toBe('email');
  });

  it('never gives two different values the same fake (large input)', () => {
    const users = Array.from({ length: 5000 }, (_, i) => ({ email: `person${i}@example.org`, name: `Person ${i}` }));
    const result = run(JSON.stringify(users), { seed: 'big' });
    expect(result.ok).toBe(true);
    const out = JSON.parse(result.output!);
    expect(new Set(out.map((u: { email: string }) => u.email)).size).toBe(5000);
    expect(new Set(out.map((u: { name: string }) => u.name)).size).toBe(5000);
  });

  it('handles Unicode and Indian names', () => {
    const out = JSON.parse(run(JSON.stringify({ name: 'राहुल शर्मा', city: 'बेंगलुरु' })).output!);
    expect(out.name).not.toBe('राहुल शर्मा');
    expect(out.city).toBe('बेंगलुरु');
  });

  it('LEAK TEST: no original personal data survives', () => {
    const output = run(fixture('leak.json'), { seed: 'leak' }).output!;
    for (const secret of [
      'Priya Ramanathan', 'priya.r@corp-secret.in', '9123456780', '2345 6789 0123', 'PQRSX6789Z',
      'Jöhn Døe', 'john.doe@leaky.io', '+1-800-555-0199', '800-555-0199', 'hunter2-real', 'sk-live-abc123def456',
      'eyJhbGciOiJIUzI1NiJ9', 'c2lnbmF0dXJlLXJlYWw',
    ]) {
      expect(output).not.toContain(secret);
    }
    const out = JSON.parse(output);
    expect(out.users).toHaveLength(2);
    // The same email inside free text gets the same fake as the field
    expect(out.audit).toContain(out.users[0].email);
  });
});

describe('Consistent Pseudonymizer edge cases', () => {
  it('stays unique when a short number format runs out of fakes', () => {
    const input = JSON.stringify(Array.from({ length: 30 }, (_, i) => ({ pin: i })));
    const out = JSON.parse(run(input, { keysToReplace: ['pin'] }).output!);
    const values = out.map((o: { pin: unknown }) => String(o.pin));
    expect(new Set(values).size).toBe(30);
    expect(values.every((v: string) => v !== 'NaN')).toBe(true);
  });
});
