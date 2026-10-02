Read AGENTS.md and docs/ again. Milestone 3, task 3.3: JSON repair,
nothing else.

Plan first, wait for my OK.

Build per docs/PRD.md section 6: fix trailing commas, single quotes,
unquoted keys, JS-style comments, markdown code fences, Python-style
True/False/None, and truncated JSON where possible. Show a change list
alongside the repaired output. If it can't repair the input, say why
clearly instead of guessing a structure. Logic in
core/developers/json-repair.ts.

Tests: one fixture per repair case, plus a truly unrepairable case. Run
npx vitest run, paste output.

Connect to its tool page, add to listing. This completes the developers
section for Phase 1 (6 tools) — confirm all 6 pass together. Check PRD
section 5, update docs/NOTES.md, mark Milestone 3 complete, stop.
