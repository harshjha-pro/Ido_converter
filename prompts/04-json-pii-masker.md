Read AGENTS.md and docs/ again. We are on Milestone 1, task 1.4:
build the JSON PII masker and nothing else.

First write a plan (5 to 8 lines) and wait for my OK.

Then build it following docs/PRD.md section 6:
- Mask by key name and by pattern (email, phone, JWT, Aadhaar-like,
  PAN-like). Mask styles: full, partial, placeholder.
- Handle nested objects, arrays, null, numbers and booleans.
- Output valid JSON and show how many values were masked.
- Logic goes in core/developers/json-pii-masker.ts: no DOM, no network,
  no logging of input.

Tests:
- Fixtures in tests/fixtures/json-pii-masker/.
- Cover normal, empty, invalid, large and Unicode input.
- Add a leak test with fake emails, phones, tokens, JWTs and passwords
  that must NOT appear in the output.
- Run the tests with npx vitest run and paste the real terminal output.

Then connect it to the tool page using the already-designed template,
with a how-to, privacy line and FAQ.

Finish by going through the Definition of Done in PRD section 5, saying
pass or fail for each item. Update docs/NOTES.md and stop.
