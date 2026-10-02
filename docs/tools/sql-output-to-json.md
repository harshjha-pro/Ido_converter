# Tool spec: SQL Output to JSON

**URL:** `/developers/sql-output-to-json` | **Core:** `core/developers/sql-output-to-json.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Purpose

Paste the text grid printed by psql or mysql (or tab-separated text) and get typed JSON.

## Supported input

| Format | Recognised by |
|---|---|
| psql aligned | header line followed by a `----+----` separator; ends at a blank line or `(N rows)` |
| psql expanded (`\x`) | `-[ RECORD n ]----` lines, then `column \| value` |
| mysql table | `+----+` border, `\| header \|`, border, rows, border; `N rows in set` |
| mysql vertical (`\G`) | `*** n. row ***` lines, then `column: value` |
| mysql `Empty set` | becomes an empty result set |
| Tab-separated | first line with tabs is the header (mysql `-B`, spreadsheet copy) |

Prompt lines (`mysql>`, `db=#`, `db=>`, `->`), footers (`(N rows)`, `N rows in set`, `Query OK`, `Time:`) and blank lines are skipped, so a whole terminal session can be pasted. Other unrecognised lines are skipped and counted.

## Options

- `detectTypes` (default on): per-column inference. A column is integer if every non-null value is a safe integer without leading zeros; decimal if every value is a number with at most 15 significant digits; boolean if every value is `t/f/true/false` (psql) or `true/false` (any format). Otherwise text. mysql prints booleans as `0/1`, which stay numbers.
- `psqlEmptyAs` (default `'null'`): psql prints NULL as an empty cell, so empty psql cells become `null`; `'empty'` keeps them as `""`. The literal `NULL` is always `null`.

## Output

One result set → an array of row objects. Several → an array of arrays, in paste order. `meta.resultSets` lists format, columns and row count; `meta.skippedLines` lists unrecognised line numbers. Duplicate column names get `_2`, `_3`; blank names become `column_N`.

## Edge cases

Empty input → `Input is empty`. No table → a message explaining the accepted formats. Values containing `|` are recovered from the border's column positions. Windows line endings, Unicode values and 10,000-row pastes work.

## Known limits

psql wrapped/multi-line cells (`+` continuation) are not joined. Column positions from the border can be off for wide characters (CJK, emoji) when a value also contains `|`. CSV with commas is not parsed (tabs only).

## Samples (fixtures in `tests/fixtures/sql-output-to-json/`)

`psql-basic.txt` (types, NULL, Hindi, pipe inside value), `mysql-basic.txt` (leading-zero SKUs, NULL, emoji, Empty set), `multi.txt` (three psql result sets incl. 0 rows), `tsv.txt`, `vertical.txt` (`\G` and `\x`).
