Read AGENTS.md and docs/ again. Milestone 2, task 2.2: log and secret
scrubber, nothing else.

Plan first, wait for my OK.

Build per docs/PRD.md section 6:
- Detect and replace API keys, tokens, JWTs, passwords and private key
  blocks with [REDACTED:type]. Show a findings list (type + count, not
  the secret itself).
- Required warning on the page: this is pattern-based and can miss
  things — review output before sharing.
- Logic in core/developers/secret-scrubber.ts.

Tests: fixtures including realistic fake AWS keys, JWTs, DB connection
strings with passwords, private key blocks. This leak test is the most
important one so far — verify NONE of them survive. Run npx vitest run,
paste real output.

Connect to its tool page, link related tools.

Check PRD section 5, update docs/NOTES.md, stop.
