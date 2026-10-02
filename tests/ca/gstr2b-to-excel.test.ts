import { describe, it, expect } from 'vitest';
import { convert, run, periodLabel, type Gstr2bMeta } from '../../core/ca/gstr2b-to-excel';
import fs from 'fs';
import path from 'path';

const DIR = path.join(__dirname, '..', 'fixtures', 'gstr2b-to-excel');
const file = (name: string) => ({ name, text: fs.readFileSync(path.join(DIR, name), 'utf-8') });
const sheetXml = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe('GSTR-2B JSON to Excel', () => {
  it('rejects no files, invalid JSON and non-GSTR-2B JSON', () => {
    expect(convert([]).ok).toBe(false);
    expect(convert([{ name: 'a.json', text: '{bad' }]).error).toMatch(/not valid JSON/);
    expect(convert([{ name: 'a.json', text: '{"foo": 1}' }]).error).toMatch(/does not look like a GSTR-2B/);
  });

  it('merges two months, sorted by period, into one workbook with a summary', () => {
    const r = convert([file('gstr2b-052026.json'), file('gstr2b-042026.json')]);
    expect(r.ok).toBe(true);
    const meta = r.meta as unknown as Gstr2bMeta;
    expect(meta.periods).toEqual(['Apr 2026', 'May 2026']);
    expect(meta.rowsBySection).toEqual({ B2B: 4, B2BA: 1, CDNR: 1, IMPG: 1 });
    const xml = sheetXml(r.output!);
    expect([...xml.matchAll(/<sheet name="([^"]+)"/g)].map(m => m[1])).toEqual(['Summary', 'B2B', 'B2BA', 'CDNR', 'IMPG']);
    expect(xml).toContain('ST/26-27/001');
    expect(xml).toContain('मुंबई सप्लायर्स');
    expect(xml).toContain('Credit note');
  });

  it('reports sections it does not convert instead of dropping them silently', () => {
    const meta = convert([file('gstr2b-042026.json')]).meta as unknown as Gstr2bMeta;
    expect(meta.unknownSections).toEqual(['ecom']);
    expect(meta.warnings.join(' ')).toMatch(/not converted.*ecom/);
  });

  it('warns about duplicate periods and different GSTINs', () => {
    const other = { name: 'x.json', text: JSON.stringify({ data: { gstin: '29XXXXX0000X1Z1', rtnprd: '042026', docdata: { impg: [{ txval: 1, igst: 0 }] } } }) };
    const meta = convert([file('gstr2b-042026.json'), other]).meta as unknown as Gstr2bMeta;
    expect(meta.warnings.join(' ')).toMatch(/more than one file/);
    expect(meta.warnings.join(' ')).toMatch(/different GSTINs/);
  });

  it('accepts files without the outer "data" wrapper', () => {
    const inner = JSON.parse(file('gstr2b-052026.json').text).data;
    expect(convert([{ name: 'inner.json', text: JSON.stringify(inner) }]).ok).toBe(true);
  });

  it('fails clearly when every section is empty', () => {
    const empty = { name: 'e.json', text: '{"data":{"rtnprd":"062026","docdata":{"b2b":[]}}}' };
    expect(convert([empty]).error).toMatch(/No documents found/);
  });

  it('formats return periods', () => {
    expect(periodLabel('042026')).toBe('Apr 2026');
    expect(periodLabel('weird')).toBe('weird');
  });

  it('handles many documents', () => {
    const inv = Array.from({ length: 5000 }, (_, i) => ({ inum: `I${i}`, txval: 100, igst: 18 }));
    const big = { name: 'big.json', text: JSON.stringify({ data: { rtnprd: '072026', docdata: { b2b: [{ ctin: 'X', inv }] } } }) };
    const r = convert([big]);
    expect((r.meta as unknown as Gstr2bMeta).rowsBySection.B2B).toBe(5000);
  });

  it('run() takes JSON-encoded files', () => {
    expect(run(JSON.stringify([file('gstr2b-042026.json')])).ok).toBe(true);
    expect(run('').ok).toBe(false);
  });
});
