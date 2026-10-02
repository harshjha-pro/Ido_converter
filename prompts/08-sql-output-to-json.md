Read AGENTS.md and docs/ again. Milestone 3, task 3.1: SQL console
output to JSON, nothing else.

Plan first, wait for my OK.

Build per docs/PRD.md section 6: parse psql aligned output, mysql grid
output, and tab-separated text. Ignore row-count footers. Convert SQL
NULL to JSON null. Support multiple result sets pasted together. Logic
in core/developers/sql-output-to-json.ts.

Tests: fixtures using REAL sample outputs from psql and mysql (write
them by hand to look authentic). Cover empty results, NULLs, multiple
result sets, Unicode values. Run npx vitest run, paste output.

Connect to its tool page, add to /developers/ listing. Check PRD
section 5, update docs/NOTES.md, stop.
