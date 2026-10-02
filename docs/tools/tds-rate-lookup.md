# Tool spec: TDS Rate and Threshold Lookup

**URL:** `/ca/tds-rate-lookup` | **Core:** `core/ca/tds-lookup.ts` + `core/ca/tds-rates.json` | **Phase:** 2
**Search phrase:** TDS rate chart 2026-27 section 393
**Publishing:** unlisted until a CA fills `reviewedBy` in `core/ca/review.json` and `tds-rates.json`.

## Law

From tax year 2026-27, TDS is in **section 393 of the Income-tax Act, 2025** (three tables: resident payees, non-residents, any person). The CBDT says rates and thresholds were retained from the 1961 Act. Old section numbers are shown because people search by them. **Section 393 table item numbers are not recorded** (not verified).

## Rows (only those confirmed on incometaxindia.gov.in, 2026-10-02)

| Payment | Old section | Rate | Threshold |
|---|---|---|---|
| Rent: land, building, furniture | 194-I(b) | 10% | > ₹50,000 per month |
| Rent: plant, machinery, equipment | 194-I(a) | 2% | > ₹50,000 per month |
| Rent by individual/HUF not under audit | 194-IB | 2% | > ₹50,000 per month |
| Commission/brokerage | 194H | 2% | > ₹20,000 a year |
| Contractor | 194C | 1% individual/HUF, 2% others | single > ₹30,000 or year > ₹1,00,000 |
| Professional fees | 194J | 10% | > ₹50,000 a year |
| Technical fees | 194J | 2% | > ₹50,000 a year |
| Interest by bank/co-op/post office | 194A | 10% | > ₹50,000 (₹1,00,000 senior citizens) |
| Interest by others | 194A | 10% | > ₹10,000 |
| Immovable property purchase | 194-IA | 1% | ≥ ₹50 lakh (higher of price and stamp duty value) |
| Lottery/crossword winnings | 194B | 30% | > ₹10,000 |

Left out on purpose (sources conflicting or not found): dividends, interest on securities, salary, insurance commission, e-commerce, 194Q purchases, VDA, partner remuneration, non-resident payments, no-PAN rate.

## Checker

Given an item, the payment, the year's total to that payee (optional), payee type (contractor) and senior citizen (bank interest), it says whether the threshold is crossed (`>` or `≥` as recorded) and the TDS on this payment. It does not compute catch-up TDS on earlier payments, surcharge/cess, lower-deduction certificates or Form 121 (15G/15H) declarations.

## Search

Section-style queries (start with three digits) match old sections by prefix, keeping brackets so 194-IA and 194-I(a) differ; other queries match words in the description.
