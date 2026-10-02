Read AGENTS.md and docs/ again. Milestone 5, task 5.4: visa and
passport photo sizer (Exam and form applicants), nothing else.

IMPORTANT: this tool needs real specs with sources, per AGENTS.md rule
4 and 5. Before building, check docs/rules-and-sources.md for [country]
photo specs. If none are listed, STOP and tell me which countries you
need specs for — do not invent dimensions, DPI or file size limits.

Once specs are confirmed and sourced (2-3 countries to start):

Plan first, wait for my OK.

Build: upload/drag a photo, crop to the required aspect ratio, resize
to required pixel dimensions, compress toward any file-size limit — all
in the browser (canvas API, no upload anywhere). Country presets as a
dropdown, each showing its source and "last checked" date. Include a
"not official advice, verify with the official portal" disclaimer.
Logic in core/forms/visa-photo-sizer.ts.

Tests: verify the resize/crop math with sample images or synthetic data.

Create the /forms/ profession page and this tool's page.

Check PRD section 5 including rule 5's extra requirements, update
docs/NOTES.md, stop.
