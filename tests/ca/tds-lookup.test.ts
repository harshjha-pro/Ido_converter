import { describe, it, expect } from 'vitest';
import { checkTds, searchTds, run, TDS_ENTRIES, TDS_DATA } from '../../core/ca/tds-lookup';

describe('TDS rate and threshold lookup', () => {
  it('every entry has an official incometaxindia.gov.in source, a rate and a threshold', () => {
    expect(TDS_ENTRIES.length).toBeGreaterThanOrEqual(10);
    for (const e of TDS_ENTRIES) {
      expect(e.source.url, e.id).toMatch(/^https:\/\/www\.incometaxindia\.gov\.in\//);
      expect(e.rates.length, e.id).toBeGreaterThan(0);
      expect(e.thresholdText, e.id).not.toBe('');
    }
    expect(TDS_DATA.reviewedBy).toBe('');
  });

  it('searches by old section number and by words', () => {
    expect(searchTds('194J').map(e => e.id)).toEqual(['professional-fees', 'technical-fees']);
    expect(searchTds('194-IA').map(e => e.id)).toEqual(['property-purchase']);
    expect(searchTds('194ia').map(e => e.id)).toEqual(['property-purchase']);
    expect(searchTds('rent').length).toBe(3);
    expect(searchTds('professional').map(e => e.id)).toEqual(['professional-fees']);
    expect(searchTds('').length).toBe(TDS_ENTRIES.length);
    expect(run('payroll').ok).toBe(false);
  });

  it('rent: ₹50,000 a month is not above the threshold; ₹60,000 is (10% land/building)', () => {
    expect(checkTds({ entryId: 'rent-land-building', amount: 50000 }).output).toMatchObject({ applies: false, tds: 0 });
    expect(checkTds({ entryId: 'rent-land-building', amount: 60000 }).output).toMatchObject({ applies: true, rate: 10, tds: 6000 });
    expect(checkTds({ entryId: 'rent-plant-machinery', amount: 60000 }).output).toMatchObject({ rate: 2, tds: 1200 });
  });

  it('contractor: single payment and yearly aggregate thresholds, rate by payee type', () => {
    expect(checkTds({ entryId: 'contractor', amount: 30000, yearTotal: 30000, payeeType: 'individual-huf' }).output?.applies).toBe(false);
    expect(checkTds({ entryId: 'contractor', amount: 30001, payeeType: 'individual-huf' }).output).toMatchObject({ applies: true, rate: 1, tds: 300.01 });
    expect(checkTds({ entryId: 'contractor', amount: 20000, yearTotal: 110000, payeeType: 'other' }).output).toMatchObject({ applies: true, rate: 2, tds: 400 });
    expect(checkTds({ entryId: 'contractor', amount: 20000, yearTotal: 100000, payeeType: 'other' }).output?.applies).toBe(false);
  });

  it('professional fees: above ₹50,000 in the year at 10%', () => {
    expect(checkTds({ entryId: 'professional-fees', amount: 20000, yearTotal: 50000 }).output?.applies).toBe(false);
    expect(checkTds({ entryId: 'professional-fees', amount: 20000, yearTotal: 60000 }).output).toMatchObject({ applies: true, tds: 2000 });
  });

  it('bank interest: senior citizen threshold ₹1,00,000', () => {
    expect(checkTds({ entryId: 'interest-bank', amount: 80000 }).output?.applies).toBe(true);
    expect(checkTds({ entryId: 'interest-bank', amount: 80000, seniorCitizen: true }).output?.applies).toBe(false);
    expect(checkTds({ entryId: 'interest-bank', amount: 120000, seniorCitizen: true }).output).toMatchObject({ applies: true, tds: 12000 });
  });

  it('property: ₹50 lakh or more (inclusive) at 1%', () => {
    expect(checkTds({ entryId: 'property-purchase', amount: 4999999 }).output?.applies).toBe(false);
    expect(checkTds({ entryId: 'property-purchase', amount: 5000000 }).output).toMatchObject({ applies: true, tds: 50000 });
  });

  it('rejects bad input', () => {
    expect(checkTds({ entryId: 'nope', amount: 1 }).ok).toBe(false);
    expect(checkTds({ entryId: 'rent-land-building', amount: -1 }).ok).toBe(false);
    expect(checkTds({ entryId: 'professional-fees', amount: 100, yearTotal: 50 }).ok).toBe(false);
  });
});
