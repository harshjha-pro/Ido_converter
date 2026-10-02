# Tool spec: Bank Statement CSV Cleaner (Tally mapping)

**URL:** `/ca/bank-statement-csv-cleaner` | **Core:** `core/ca/bank-statement-cleaner.ts` | **Phase:** 2
**Search phrase:** bank statement CSV for Tally import
**Publishing:** unlisted until a CA fills `reviewedBy` in `core/ca/review.json`.

## Purpose

Turn any bank's CSV export into one layout: `Date (DD-MM-YYYY), Narration, Reference, Withdrawal, Deposit, Balance`, as CSV or Excel. TallyPrime imports bank statements in CSV/Excel/MT940 via Bank Reconciliation → Alt+O (Import) → Bank Statements ([TallyHelp](https://help.tallysolutions.com/tally-prime/banking-utilities/bank-reconciliation-tally/)); a consistent layout means one column mapping works for every bank. No tax rule is involved.

## Detection

- Delimiter: `,` `;` tab or `|`, whichever splits the first lines most consistently. RFC 4180 quotes supported.
- Header row: first row (within 60) with a date column and withdrawal/deposit or amount columns. Preamble lines above it are ignored.
- Column roles by header words: date (txn/transaction/posting date; falls back to value date), value date, narration (description/particulars/remarks), reference (chq/cheque/ref/instrument/UTR), withdrawal (withdrawal/debit/dr), deposit (deposit/credit/cr), amount + Dr/Cr column, balance. Can be forced by column index.
- Dates: DD/MM/YYYY, DD-MM-YY, DD.MM.YYYY, DD-Mon-YYYY, YYYY-MM-DD, with times ignored. Day-first unless a value proves month-first (second part > 12); can be forced. Invalid dates (31/02) rejected.
- Amounts: Indian grouping (1,23,456.78), ₹/INR/Rs, `(250.00)` negative, `100 Dr` / `Cr` suffixes, `-` as zero. Single-amount files: Dr/Cr column, Dr/Cr suffix, or negative sign decides the side. Balances with `Dr` are treated as overdrawn (negative).

## Rows skipped (counted)

Rows without a valid date (totals, footers), rows with neither withdrawal nor deposit (opening balance, B/F), unreadable amounts. Blank rows are ignored silently.

## Checks

Newest-first statements are reversed (optional). Running balance: previous balance + deposit − withdrawal must equal the row's balance (±0.01); mismatched rows are listed. Opening balance is derived from the first row; closing from the last.

## Samples (`tests/fixtures/bank-statement-cleaner/`)

Style A (preamble, opening balance, quoted narration with comma, Indian amounts, totals and footer), B (amount + Dr/Cr, month-name dates, "CR" balances), C (semicolon, ISO dates, newest first), D (US month-first dates, bracket negatives). All synthetic.
