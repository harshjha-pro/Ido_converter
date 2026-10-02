Read AGENTS.md and docs/ again. Milestone 5, task 5.3: return-loss
calculator (Online sellers), nothing else.

IMPORTANT: write out the exact formula you intend to use before
building — this was marked "formula not yet written" in the PRD. Propose
it in your plan (e.g. accounting for product cost, return shipping,
restock/refurb cost) and wait for my confirmation of the FORMULA
itself, not just general plan approval, before coding.

Once confirmed: build core/sellers/return-loss.ts. Tests covering
normal case, zero returns, 100% return rate, invalid input. Run
npx vitest run, paste output. Add to the /sellers/ page.

Check PRD section 5, update docs/NOTES.md, stop.
