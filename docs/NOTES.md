# idoconverter: Notes and Progress Log

The AI assistant reads this at the start of every session and updates it at the end. Keep entries short and dated.

**Last updated:** 2026-10-02

---

## 1. Current status

| Item | Status |
|---|---|
| Current milestone | Milestone 4: Extension (Milestones 1–3 complete pending manual browser checks) |
| Current tool | JSON PII masker (task 1.4): logic, page and tests done; tool spec written; Definition of Done still needs the Edge/Firefox/Safari check and a search phrase in the tracker |
| Blockers | Open questions below |
| Next step | Task 1.5 (test deploy), then Milestone 2 |

## 2. Open questions

| # | Question | Owner | Answer |
|---|---|---|---|
| 1 | Who builds this, and what is their coding comfort? | | |
| 2 | Is a CA available for review and task input? | | |
| 3 | Is "idoconverter" the main brand or a sub-brand? | | |
| 4 | Launch hosting: current Hostinger plan or Cloudflare Pages? | | Hostinger (stated by the team). Still to check in hPanel: PHP version, SSH on or off, Composer available. |
| 5 | Which countries come first for the visa photo sizer? | | |
| 6 | Who reviews the legal pages? | | |
| 7 | Confirm the ₹89 yearly Basic price — is it correct, or should it be closer to ₹29×12=₹348 minus a normal discount? | | |
| 8 | Is ₹89 the yearly price for Basic, or a separate 4th tier? Team said "4 tiers: 29, 89, 129, 429" but also "89 if paid yearly" | | |
| 9 | Feature list per paid tier | | |
| 10 | Payment gateway choice for India | | |
| 11 | Data retention period and deletion process for stored history | | |
| 13 | Docs live in `Docs/` but every doc refers to `docs/`, and AGENTS.md/CLAUDE.md expect to sit at the repo root. Rename `Docs/` → `docs/` and move AGENTS.md/CLAUDE.md to the root? (Renames need approval per AGENTS.md.) | | Yes, done 2026-10-02. `Design.md` also renamed to `DESIGN.md` to match the references. |
| 14 | `public/footer-art.png` is outside Astro's configured `website/public/`, so it is not served. Move it, or delete it if unused? | | Moved to `website/public/` 2026-10-02. |
| 15 | `tsc --noEmit` fails on the tests because `@types/node` is missing (it is not in CI). Add `@types/node` as a dev dependency (MIT, types only)? | | Yes, added 2026-10-02. |
| 17 | Muted text fails contrast. The site uses `--color-text-muted: #6B726F` (4.32:1 on cream, below 4.5:1); DESIGN.md says `#88928A` (2.82:1, worse). Proposal: `#5F6662` (5.17:1 on cream, 5.89:1 on white), and update DESIGN.md to match. | | Yes. Applied 2026-10-02 in Layout.astro and DESIGN.md. |
| 16 | `.claude/skills/idoconverter-design/SKILL.md` does not exist; the skill file is at `Docs/SKILL.md`. Move it? | | Moved 2026-10-02. |
| 12 | What exactly is the "motion" need — a few subtle CSS transitions on the home page, or real animated marketing sections (which would mean adding React just for that)? | | |

## 3. Decisions log

| Date | Decision | Why |
|---|---|---|
| 2026-09-28 | Keep the name idoconverter | Already owned |
| 2026-09-28 | Static site, all tools run in the browser | No VPS, crowded shared hosting, and privacy is the selling point |
| 2026-09-28 | Six professions: developers, CAs and accountants, frontend developers, job seekers, exam and form applicants (India), online sellers | Chosen by the team |
| 2026-09-28 | Start with developers, then add professions in phases | Can be built and tested without an outside expert |
| 2026-09-28 | One extension first: JSON Privacy Masker | Chrome requires a narrow single purpose and rejects repetitive or broad-toolbox extensions |
| 2026-09-28 | Other professions get an extension only if the work happens on a page the user is already viewing | Upload-and-download tasks fit the website better |
| 2026-09-28 | CA tools wait for a CA reviewer | Tax rules change yearly and accuracy is critical |
| 2026-09-28 | Frontend: Astro (static) with TypeScript | Confirmed by the team |
| 2026-09-28 | AI tool: Google Antigravity. Rules file is AGENTS.md at the project root (renamed from CLAUDE.md). Do not also create GEMINI.md, to avoid conflicting rules. | Antigravity reads AGENTS.md and GEMINI.md as rules |
| 2026-09-28 | Hosting: Hostinger. Main domain: idoconverter | Already owned |
| 2026-09-28 | Backend: PHP only for non-tool pages (contact form). No Laravel for now. | Tools run in the browser; Laravel is heavy for a crowded shared plan |
| 2026-09-28 | Build with AI (vibe coding). Start with 4 professions: developers, online sellers, job seekers, exam and form (visa photo sizer first) | Lowest risk without an outside expert. CA and frontend tools wait. |
| 2026-09-28 | Add paid plans (Free, Basic, Plus, Premium at ₹29/₹89/₹129/₹429) with storage and history, as Phase 4 | Team decision. Numbers and features not fully confirmed yet — see open questions 7–9. Placed in Phase 4 so it doesn't block or complicate the free static tools. |
| 2026-09-30 | Switch AI tool from Antigravity to Claude Code | Already-built skeleton (plain Astro/TS) carries over unchanged |
| 2026-09-30 | CLAUDE.md added, imports AGENTS.md (@AGENTS.md) and docs/CONTEXT.md — avoids duplicating rules across tools | Claude Code's own recommended pattern for projects that may use multiple AI coding tools |
| 2026-09-30 | docs/DESIGN.md duplicated as a Claude Code skill at .claude/skills/idoconverter-design/SKILL.md | Lets design rules auto-trigger only for UI work instead of loading every session |
| 2026-09-30 | Chrome DevTools MCP added (`claude mcp add chrome-devtools --scope user -- npx chrome-devtools-mcp@latest`) | Automates checking the Network tab for the "no tool sends input anywhere" rule, plus 360px and performance testing |
| 2026-10-02 | Repo layout matches the docs: `docs/` (lowercase), `AGENTS.md` and `CLAUDE.md` at the root, design skill at `.claude/skills/idoconverter-design/SKILL.md` | Every document referred to these paths; agents only auto-load root files |
| 2026-09-30 | Motion MCP and a UI/component-generation MCP NOT added | Motion MCP is React-only (motion/react), and this project has no React — adding it means adding React as a new dependency. A component-generation MCP would produce styling that doesn't match the locked DESIGN.md tokens. Both need the team to clarify scope first — see open question 11. |

## 4. Tool tracker

Fill the search phrase and "who ranks" columns during Milestone 0 by googling the exact phrase. Crowding below is an estimate from earlier research, not measured.

| Tool | Profession | Search phrase | Who ranks now | Crowding (est.) | Phase | Status |
|---|---|---|---|---|---|---|
| JSON PII masker | Developers | | | Low | 1 | Built, DoD partly verified |
| Consistent pseudonymizer | Developers | | | Low | 1 | Built, DoD partly verified |
| Log and secret scrubber | Developers | | | Medium | 1 | Built, DoD partly verified |
| SQL console output to JSON | Developers | | | Low to medium | 1 | Built, DoD partly verified |
| JSON to TypeScript and Zod | Developers | | | Medium | 1 | Built, DoD partly verified |
| JSON repair | Developers | | | Low to medium | 1 | Built, DoD partly verified |
| Visa and passport photo sizer | Exam and form | | | Medium | 1 | Not started |
| Notice period buyout calculator | Job seekers | | | Low | 1 | Not started |
| Volumetric weight calculator | Online sellers | | | Medium | 1 | Not started |
| Return-loss calculator | Online sellers | | | Low (unverified) | 1 | Not started |
| GSTR-2B JSON to Excel (multi-month) | CAs | | | High | 2 | Not started |
| Bank statement CSV cleaner (Tally mapping) | CAs | | | Medium | 2 | Not started |
| GST inclusive and exclusive calculator | CAs | | | High | 2 | Not started |
| GST late fee and interest calculator | CAs | | | Medium | 2 | Not started |
| TDS rate and threshold lookup | CAs | | | Medium | 2 | Not started |
| Compliance due-date calendar | CAs | | | Medium | 2 | Not started |
| JSON formatter and validator, JWT decoder | Developers | | | High | 3 | Not started |
| Clamp generator, px/rem/em, color converter | Frontend | | | High | 3 | Not started |
| CSS to Tailwind | Frontend | | | Medium | 3 | Not started |
| Tailwind v3 to v4 helper | Frontend | | | Unknown | 3 | Needs validation |
| CTC to in-hand, hike comparison | Job seekers | | | High / Medium | 3 | Not started |
| Resume keyword matcher, ATS preview | Job seekers | | | High / Medium | 3 | Not started |
| Photo and signature resizer, PDF compress, HEIC to JPG | Exam and form | | | High | 3 | Not started |
| Marketplace image checker, profit calculator, GST price and margin | Sellers | | | Medium / High | 3 | Not started |

## 5. Research summary (from planning, 2026-09-28)

These findings came from web searches during planning. Re-check anything that affects a decision.

**Hosting**
- Shared hosting throttles by process, RAM and CPU limits. Hitting them causes 503 errors or slowness. So the server should do almost nothing.
- Competitor converters that process files on servers need storage and CPU. We cannot do that. Browser-side processing (for example pdf.js for PDF work) avoids it.

**Users and competitors**
- Complaints about online converters: privacy of uploaded files, daily limits, watermarks and sign-up friction, no batch on free plans, need for an internet connection.
- Tool pages hold up better than articles against AI summaries, according to Ahrefs' argument. This is a vendor's view.
- Very high search volume exists for PDF to Word and HEIC to JPG, but strong established sites own those queries.
- India exam-photo and Aadhaar/PAN PDF compressor space: many existing sites (for example ExamToolkit, FormPhotoFix, SignatureResize, ExamPhotoResize, PhotoKB, SarkariDoc). Some are feature-rich, with face-aware crop and templates for 500+ exams. Enter with less-covered destinations.
- GST: the portal offers GSTR-1 as JSON only, which creates demand for JSON-to-Excel tools. Free tools exist (GSTZen, Finexo, Conversiontools). Finexo runs in the browser. Bank statement to Excel or Tally has paid competitors (for example Parsify, AI Accountant, Suvit).
- Tax calculators: ClearTax, Groww, fincalculator.in and CalcGuru already exist.
- Frontend CSS tools (clamp generators and similar) are very crowded.

**Developer extensions**
- Select-a-table-to-export extensions already exist (HTML Table Exporter, Table Copy, Table Capture). Developer toolbox extensions already exist (DevKit, Dev Toolkit, Base64Coder). Smart-paste detection exists (Spoold, DevPrism).
- Gaps we found (analysis, not measured demand): masking sensitive data before copying, turning a selection into code (types, schemas, mock data, INSERT statements), and short multi-step workflows. We only read listings, not the extensions themselves. **Install two or three and test before committing to the extension.**

**Chrome Web Store policy**
- An extension must have a single narrow purpose. No bundles of unrelated features and no broad multi-purpose toolbars.
- Multiple extensions with the same user experience are "repetitive content", even if the code differs. Converters split across many extensions that lead to one multi-format converter are given as an example.
- An extension whose only purpose is to launch a website is not allowed.
- Excess permissions unrelated to the purpose are treated as a violation.

## 6. Rules and sources

Kept in `docs/rules-and-sources.md`. Columns: rule, value, source, effectiveFrom, lastChecked, reviewedBy. Nothing is filled in yet.

## 7. Legal and launch checklist

- [ ] Privacy policy
- [ ] Terms
- [ ] About
- [ ] Contact
- [ ] Disclaimer for CA, tax, visa and pricing tools
- [ ] Legal pages reviewed by a lawyer or CA
- [ ] Extension privacy policy URL and permission justifications
- [ ] Sitemap, canonical tags, titles and descriptions
- [ ] Lighthouse scores recorded
- [ ] Mobile and four-browser test done
- [ ] Analytics confirmed to capture no tool input
- [ ] Backup and rollback copy
- [ ] Search Console set up
- [ ] AdSense application submitted

## 8. Ideas parking lot

Not in scope yet. Add ideas here instead of building them.

- Heavy conversions through an outside API or WebAssembly (after traffic proves demand)
- Pro tier
- Portfolio auditor for frontend job seekers
- Extension ideas for other professions (only if a distinct on-page job exists)
- Guide articles for tools that already rank

## 9. Session log

Copy this block for each session.

```
### YYYY-MM-DD
Milestone / tool:
Done:
Decisions:
New dependencies (name, size, license):
Tests run and result:
Problems / open questions:
Next:
Suggested commit message:
```

### 2026-10-02
Milestone / tool: Milestone 1 / Task 1.4: JSON PII Masker
Done: Built core logic, UI in Astro, and tests for JSON PII masker.
Decisions: Regex based pattern matching running entirely in the browser. Fully isolated client-side script.
New dependencies (name, size, license): None.
Tests run and result: vitest tests passed (8/8).
Problems / open questions: None.
Next: Next tool in PRD.
Suggested commit message: Feat: Implement JSON PII masker


### 2026-10-02 (review and fixes)
Milestone / tool: Milestone 1 / Task 1.4: JSON PII Masker
Done:
- Fixed broken production build (wrong relative import path on the tool page; CI was red).
- Fixed related-tool links (page passed `path`, layout read `url`); unbuilt tools now show "(coming soon)" instead of a dead link.
- Removed the leftover "Tool area (placeholder)" text; privacy badge now uses the DESIGN.md wording.
- Masker leaks fixed: Indian mobile numbers, lowercase PAN, key variants (`accessToken`, `user-password`, `API_KEY`), values nested under a sensitive key, phone/Aadhaar stored as JSON numbers.
- `replacementCount` now counts every masked value, not every string touched.
- Added `mobile` and `apikey` to the default key list. Large-input (>5 MB) warning in the UI.
Decisions:
- Key matching ignores case and separators and matches by whole words. This over-masks keys like `file_name` or `test_name` (contain the word "name"); chosen on purpose, since over-masking is safer than leaking.
- Phone/Aadhaar-like numbers are masked and become strings (type changes, structure stays).
- Bearer tokens and `sk-...` style keys inside free text are left to the Log and secret scrubber (Milestone 2). They are masked when under a sensitive key such as `authorization`.
New dependencies (name, size, license): None.
Tests run and result: vitest 16/16 pass; `npm run build` passes. Built page checked in headless Chromium at 360px: masking works, zero network requests when masking, no horizontal scroll. Only console error is the browser's automatic `/favicon.ico` 404 (no favicon yet).
Problems / open questions: see open questions 13–16.
Next: tool spec in `docs/tools/json-pii-masker.md`, cross-browser check, then task 1.5.
Suggested commit message: Fix build and harden JSON PII masker against leaks

### 2026-10-02 (repo layout and tool spec)
Milestone / tool: Milestone 1 / Task 1.4: JSON PII Masker
Done: Renamed `Docs/` → `docs/` and `Design.md` → `DESIGN.md`; moved AGENTS.md and CLAUDE.md to the root, SKILL.md to `.claude/skills/idoconverter-design/`, footer-art.png to `website/public/`. Wrote `docs/tools/json-pii-masker.md` with 5 samples, stored as fixtures and run in the tests.
Decisions: Spec samples live as `*.input.json` / `*.expected.json` (+ optional `*.options.json`) fixtures, per TECHNICAL_SPEC section 10.
New dependencies (name, size, license): `@types/node` ^20 (dev only, ~2.4 MB on disk, not shipped to the browser, MIT). Why: type-check the tests, which use `fs` and `path`.
Tests run and result: vitest 22/22 pass; `tsc --noEmit` clean; `npm run build` passes.
Problems / open questions: none new.
Next: Edge/Firefox/Safari check of the masker page, fill its search phrase in the tracker, then task 1.5 (test deploy).
Suggested commit message: Align repo layout with docs and add JSON PII masker tool spec

### 2026-10-02 (Definition of Done check, prompt 04)
Milestone / tool: Milestone 1 / Task 1.4: JSON PII Masker
Done: Merged `main` (adds `prompts/`). Checked the masker against PRD section 5.
Definition of Done:
1. Works on every tool-spec sample: PASS (5 samples run as fixtures).
2. No network request carries input: PASS (headless Chromium, zero requests while masking). Chrome DevTools MCP not available in the cloud session; recheck locally.
3. Empty, invalid, very large input give clear messages: PASS (tests; >5 MB note in UI).
4. 360 px and Chrome/Edge/Firefox/Safari: PARTIAL (360 px PASS in Chromium; Edge, Firefox, Safari not tested).
5. Standard template (title, tool, how-to, privacy line, FAQ, related tools): PASS.
6. Keyboard usable and readable contrast: PARTIAL (keyboard PASS: every control reachable by Tab, masking works with Enter. Contrast FAIL: muted text 4.32:1, see open question 17. Other pairs 4.79–18.88:1).
7. No console errors, unit tests pass: PASS (22/22; only the browser's own `/favicon.ico` 404).
8. CA/tax/visa/pricing rules: N/A.
Decisions: none.
New dependencies (name, size, license): None.
Tests run and result: vitest 22/22 pass; build passes.
Problems / open questions: open question 17 (muted text colour).
Next: answer question 17, test Edge/Firefox/Safari, fill the search phrase, then prompt 05 / task 1.5.
Suggested commit message: Record Definition of Done check for JSON PII masker

### 2026-10-02 (prompt 05: consistent pseudonymizer)
Milestone / tool: Milestone 2 / Task 2.1: Consistent pseudonymizer
Done: Shared PII detection moved to `core/shared/pii.ts` (masker and pseudonymizer use the same key matching and patterns). Built `core/developers/pseudonymizer.ts`, page `/developers/consistent-pseudonymizer`, spec `docs/tools/consistent-pseudonymizer.md`, fixtures and 12 tests. Shared tool UI styles, `website/src/data/tools.ts` and `website/src/scripts/tool-ui.ts` added so tool pages stay consistent. Muted text and new error colour tokens meet AA.
Decisions: Empty seed on the page = random seed per run (a fixed seed would let anyone recompute fakes from guessed values). Mapping only on request, downloaded locally. Fake emails use the reserved `example.com` domain.
New dependencies (name, size, license): None.
Tests run and result: vitest 34/34 pass; build passes.
Definition of Done: 1 PASS (spec samples in tests) · 2 PASS (zero requests while running, headless Chromium) · 3 PASS · 4 PARTIAL (360 px and 1280 px PASS in Chromium; Edge/Firefox/Safari untested) · 5 PASS · 6 PASS (keyboard reachable native controls; text uses AA tokens) · 7 PASS · 8 N/A.
Problems / open questions: none.
Next: prompt 06 (log and secret scrubber).
Suggested commit message: Add consistent pseudonymizer

### 2026-10-02 (prompt 06: log and secret scrubber)
Milestone / tool: Milestone 2 / Task 2.2: Log and secret scrubber
Done: `core/developers/secret-scrubber.ts`, page `/developers/log-secret-scrubber` with the required review warning and a findings list, spec `docs/tools/log-secret-scrubber.md`, realistic leak fixture and 11 tests.
Decisions: Spans are found on the original text and overlaps resolved by detector priority, so line numbers stay correct and nothing is double-redacted. Only the password part of a connection string is redacted. Findings show type, count and line numbers, never the secret. Placeholders (`***`, `${VAR}`) are not counted.
New dependencies (name, size, license): None.
Tests run and result: vitest 45/45 pass; build passes.
Definition of Done: 1 PASS · 2 PASS (zero requests while scrubbing) · 3 PASS (empty, 20,000-line log) · 4 PARTIAL (360/1280 px PASS in Chromium; other browsers untested) · 5 PASS · 6 PASS · 7 PASS · 8 N/A.
Problems / open questions: none.
Next: prompt 07 (link the three privacy tools, Milestone 2 wrap-up).
Suggested commit message: Add log and secret scrubber

### 2026-10-02 (prompt 07: link privacy tools, Milestone 2 wrap-up)
Milestone / tool: Milestone 2 / Task 2.3
Done: The three privacy tools link to each other (related tools come from `website/src/data/tools.ts`); `/developers/` lists all three with the same card. Home page badges now count live tools from the same list (were hardcoded "4 tools", "2 tools"…); Frontend badge corrected to "Planned Phase 3". Fixed a home page bug that made it scroll sideways at every width: the "How it works" section was missing its closing tag, and the pricing card scroller and hero code panels had no `min-width: 0`.
Network check: masker, pseudonymizer and scrubber pages each run with zero network requests after load (headless Chromium, 360 px and 1280 px). No tool sends input anywhere.
Tests run and result: vitest 45/45 pass (4 files); build passes.
Milestone 2: COMPLETE, except the manual Edge/Firefox/Safari check (DoD item 4) and search phrases, which need a person.
Next: prompt 08 (SQL output to JSON).
Suggested commit message: Link privacy tools and fix home page overflow

### 2026-10-02 (prompt 08: SQL output to JSON)
Milestone / tool: Milestone 3 / Task 3.1: SQL console output to JSON
Done: `core/developers/sql-output-to-json.ts` (psql aligned and expanded, mysql grid and vertical, Empty set, TSV, multiple result sets, prompts and footers skipped), page `/developers/sql-output-to-json`, spec, 5 hand-written fixtures, 15 tests.
Decisions: Types inferred per column, not per cell. Leading-zero values, unsafe integers and >15-digit decimals stay strings. psql empty cells default to null (psql's NULL display), with an option to keep "". Multiple result sets → array of arrays.
New dependencies (name, size, license): None.
Tests run and result: vitest 60/60 pass; build passes.
Definition of Done: 1 PASS · 2 PASS (zero requests) · 3 PASS (empty, no-table message, 10,000 rows) · 4 PARTIAL (Chromium only) · 5 PASS · 6 PASS · 7 PASS · 8 N/A.
Next: prompt 09 (JSON to TypeScript and Zod).
Suggested commit message: Add SQL output to JSON

### 2026-10-02 (prompt 09: JSON to TypeScript and Zod)
Milestone / tool: Milestone 3 / Task 3.2: JSON to TypeScript and Zod
Done: `core/developers/json-to-ts-zod.ts` (type inference, array-item merging with optional keys, unions, nullable, empty arrays, naming), page `/developers/json-to-typescript-zod` with separate TypeScript and Zod outputs, spec, fixtures, 12 tests.
Decisions: No Zod dependency on the site; the schema is generated as text. Tests type-check the generated TypeScript with the existing `typescript` package and assert the input JSON fits it. Generated Zod was checked once against real Zod 3 installed in a scratch folder, not in the project.
New dependencies (name, size, license): None.
Tests run and result: vitest 72/72 pass; build passes.
Definition of Done: 1 PASS · 2 PASS (zero requests) · 3 PASS · 4 PARTIAL (Chromium only) · 5 PASS · 6 PASS · 7 PASS · 8 N/A.
Next: prompt 10 (JSON repair).
Suggested commit message: Add JSON to TypeScript and Zod

### 2026-10-02 (prompt 10: JSON repair, Milestone 3 wrap-up)
Milestone / tool: Milestone 3 / Task 3.3: JSON repair
Done: `core/developers/json-repair.ts` (tolerant parser that records each fix with a line number), page `/developers/json-repair` with a grouped change list, spec, 15 fixtures (one per repair case plus 3 unrepairable), 23 tests.
Decisions: Valid input is only formatted and marked "already valid". Unfixable input returns a line/column reason rather than a guessed structure. Truncated output is closed and dangling keys dropped; lost data is not invented.
New dependencies (name, size, license): None.
Tests run and result: vitest 95/95 pass across all 6 developer tools; build passes.
Definition of Done (JSON repair): 1 PASS · 2 PASS · 3 PASS · 4 PARTIAL (Chromium only) · 5 PASS · 6 PASS · 7 PASS · 8 N/A.
All six developer tools: zero network requests while running, no horizontal scroll at 360 px and 1280 px, no console errors (headless Chromium). `/developers/` lists all six; home badge shows 6 tools.
Milestone 3: COMPLETE (manual Edge/Firefox/Safari check and search phrases still pending for all six).
Next: prompt 11 (extension build).
Suggested commit message: Add JSON repair and complete developer tools
