Read AGENTS.md and docs/ again. Milestone 2, task 2.1: consistent
pseudonymizer, nothing else.

Plan first, wait for my OK.

Build per docs/PRD.md section 6:
- Same input always produces the same fake value within one run.
  Optional seed value for reproducibility.
- Works across nested JSON, any key.
- No mapping is stored or sent anywhere. Only exportable if the user
  explicitly asks, and that stays local too.
- Logic in core/developers/pseudonymizer.ts, same ToolResult contract.

Tests: fixtures covering normal, empty, invalid, large, Unicode. Run
npx vitest run and paste real output.

Connect to its tool page, link as related tool from/to the JSON PII
masker page.

Check PRD section 5 Definition of Done, update docs/NOTES.md, stop.
