Read AGENTS.md and docs/ again. Milestone 5, task 5.1: notice period
buyout calculator (Job seekers), nothing else.

Plan first, wait for my OK. In the plan, write out the exact formula
you intend to use and mark it clearly as an assumption, since employer
practice varies — this is not a CA/tax tool but still needs an honest,
stated formula.

Build: inputs for monthly salary, notice period length, days served.
Show the formula on the page itself. Logic in
core/jobseekers/notice-period-buyout.ts.

Tests: normal case, zero days served, full notice served (~0 buyout),
invalid/negative input. Run npx vitest run, paste output.

Create the /jobseekers/ profession page and this tool's page using the
existing design system.

Check PRD section 5, update docs/NOTES.md, stop.
