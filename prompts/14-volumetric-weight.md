Read AGENTS.md and docs/ again. Milestone 5, task 5.2: volumetric
weight calculator (Online sellers), nothing else.

Plan first, wait for my OK.

Build: formula (L x W x H) / divisor, with the divisor editable and
labeled "check your courier's divisor" rather than hardcoded. Accept cm
or inches. Show both actual weight (if entered) and volumetric weight,
and note the higher one is usually what's charged, varies by courier.
Logic in core/sellers/volumetric-weight.ts.

Tests: normal case, each unit choice, zero/invalid dimensions. Run
npx vitest run, paste output.

Create the /sellers/ profession page and this tool's page.

Check PRD section 5, update docs/NOTES.md, stop.
