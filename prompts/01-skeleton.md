Read AGENTS.md and every file in docs/ before doing anything.

We are on Milestone 1, task 1.1 of docs/IMPLEMENTATION_PLAN.md.
Create a SKELETON ONLY. Do not write any real tool logic.

First, write a short plan (5 to 8 lines) and wait for my OK.

Then do this:
1. Set up an Astro project (static output) with TypeScript in strict
   mode, and Vitest for tests.
2. Create the folder structure from docs/TECHNICAL_SPEC.md section 4:
   core/ (shared, developers, ca, frontend, jobseekers, forms, sellers),
   website/, extension/json-privacy-masker/, tests/fixtures/, docs/tools/.
3. In core/, create the ToolResult type and the run(input, options)
   contract from the technical spec, plus an empty file with function
   signatures for core/developers/json-pii-masker.ts only.
4. In website/, create a home page listing the six professions, a
   /developers/ page, and one reusable tool page template with: H1, tool
   area (placeholder), how-to, privacy line, FAQ, related tools.
5. Add a simple header and footer. Mobile first, works at 360 px.
6. Create one empty test file for the masker in tests/.
7. Fill in the real install, dev, build and test commands in the
   "Commands" section of AGENTS.md.

Rules:
- No dependency other than Astro, TypeScript and Vitest. If you think
  another is needed, stop and ask.
- No backend code, no PHP, no accounts, no database, no network calls,
  no analytics.
- Do not build any other tool.
- Only create or edit files inside this project folder.

When finished: show the folder tree, the commands to run the site and
the tests, update docs/NOTES.md, and STOP for my review.
