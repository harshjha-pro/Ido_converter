import { describe, it, expect } from 'vitest';
import { generate, toIcs, run, STATES, DUE_DATA, type DueItem } from '../../core/ca/due-dates';

const items = (o: Parameters<typeof generate>[0]) => {
  const r = generate(o);
  expect(r.ok, r.error).toBe(true);
  return r.output as DueItem[];
};
const find = (list: DueItem[], title: string, period: string) => list.find(i => i.title.startsWith(title) && i.period.startsWith(period));

describe('Compliance due-date calendar', () => {
  it('monthly GST filer: GSTR-1 on the 11th and GSTR-3B on the 20th of the next month', () => {
    const list = items({ fyStartYear: 2026, gst: 'monthly', tdsDeductor: false, advanceTax: false });
    expect(list).toHaveLength(24);
    expect(find(list, 'GSTR-1', 'April 2026')?.date).toBe('2026-05-11');
    expect(find(list, 'GSTR-3B', 'March 2027')?.date).toBe('2027-04-20');
    expect(find(list, 'GSTR-3B', 'December 2026')?.date).toBe('2027-01-20');
  });

  it('QRMP filer: PMT-06/IFF in months 1-2, quarterly returns on 13th and 22nd/24th by state', () => {
    const mh = items({ fyStartYear: 2026, gst: 'qrmp', state: 'Maharashtra', tdsDeductor: false, advanceTax: false });
    expect(find(mh, 'PMT-06', 'April 2026')?.date).toBe('2026-05-25');
    expect(find(mh, 'PMT-06', 'June 2026')).toBeUndefined();
    expect(find(mh, 'GSTR-1 (quarterly', 'April–June 2026')?.date).toBe('2026-07-13');
    expect(find(mh, 'GSTR-3B (quarterly', 'April–June 2026')?.date).toBe('2026-07-22');
    const dl = items({ fyStartYear: 2026, gst: 'qrmp', state: 'Delhi', tdsDeductor: false, advanceTax: false });
    expect(find(dl, 'GSTR-3B (quarterly', 'January–March 2027')?.date).toBe('2027-04-24');
  });

  it('QRMP needs a known state', () => {
    expect(generate({ fyStartYear: 2026, gst: 'qrmp', state: 'Atlantis', tdsDeductor: false, advanceTax: false }).error).toMatch(/state or UT/);
  });

  it('TDS: deposit by the 7th, March by 30 April; statements 31 Jul, 31 Oct, 31 Jan, 31 May', () => {
    const list = items({ fyStartYear: 2026, gst: 'none', tdsDeductor: true, advanceTax: false });
    expect(find(list, 'TDS deposit', 'April 2026')?.date).toBe('2026-05-07');
    expect(find(list, 'TDS deposit', 'February 2027')?.date).toBe('2027-03-07');
    expect(find(list, 'TDS deposit', 'March 2027')?.date).toBe('2027-04-30');
    expect(list.filter(i => i.title.startsWith('Quarterly TDS')).map(i => i.date)).toEqual(['2026-07-31', '2026-10-31', '2027-01-31', '2027-05-31']);
  });

  it('advance tax: 15 Jun, 15 Sep, 15 Dec, 15 Mar', () => {
    const list = items({ fyStartYear: 2026, gst: 'none', tdsDeductor: false, advanceTax: true });
    expect(list.map(i => i.date)).toEqual(['2026-06-15', '2026-09-15', '2026-12-15', '2027-03-15']);
  });

  it('everything is sorted by date and every item has an official source', () => {
    const list = items({ fyStartYear: 2026, gst: 'qrmp', state: 'Kerala', tdsDeductor: true, advanceTax: true });
    expect([...list].sort((a, b) => a.date.localeCompare(b.date)).map(i => i.date)).toEqual(list.map(i => i.date));
    for (const i of list) expect(i.source.url).toMatch(/\.gov\.in\//);
    expect(DUE_DATA.reviewedBy).toBe('');
  });

  it('state groups cover 36 states and UTs with no overlap', () => {
    expect(new Set(STATES).size).toBe(STATES.length);
    expect(STATES.length).toBe(36);
  });

  it('rejects early years and empty selections', () => {
    expect(generate({ fyStartYear: 2025, gst: 'monthly', tdsDeductor: false, advanceTax: false }).ok).toBe(false);
    expect(generate({ fyStartYear: 2026, gst: 'none', tdsDeductor: false, advanceTax: false }).error).toMatch(/Nothing to show/);
    expect(run('').ok).toBe(false);
  });

  it('exports a valid iCalendar file', () => {
    const ics = toIcs(items({ fyStartYear: 2026, gst: 'none', tdsDeductor: false, advanceTax: true }));
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.trimEnd().endsWith('END:VCALENDAR')).toBe(true);
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(4);
    expect(ics).toContain('DTSTART;VALUE=DATE:20260615');
    expect(ics).toContain('DTEND;VALUE=DATE:20260616');
    for (const line of ics.split('\r\n')) expect(line.length).toBeLessThanOrEqual(75);
  });
});
