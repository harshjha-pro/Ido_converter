# idoconverter: Notes and Progress Log

The AI assistant reads this at the start of every session and updates it at the end. Keep entries short and dated.

**Last updated:** 2026-10-02

---

## 1. Current status

| Item | Status |
|---|---|
| Current milestone | Milestone 6: Launch prep (Milestones 1–5 built; manual browser checks and visa review pending) |
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
| 5 | Which countries come first for the visa photo sizer? | | Team asked Claude to choose (2026-10-02): India, USA, UK. |
| 6 | Who reviews the legal pages? | | |
| 7 | Confirm the ₹89 yearly Basic price — is it correct, or should it be closer to ₹29×12=₹348 minus a normal discount? | | |
| 8 | Is ₹89 the yearly price for Basic, or a separate 4th tier? Team said "4 tiers: 29, 89, 129, 429" but also "89 if paid yearly" | | |
| 9 | Feature list per paid tier | | |
| 10 | Payment gateway choice for India | | Placeholder by Claude (team asked): Razorpay. Team to confirm and add keys in backend/config/config.php. |
| 11 | Data retention period and deletion process for stored history | | |
| 13 | Docs live in `Docs/` but every doc refers to `docs/`, and AGENTS.md/CLAUDE.md expect to sit at the repo root. Rename `Docs/` → `docs/` and move AGENTS.md/CLAUDE.md to the root? (Renames need approval per AGENTS.md.) | | Yes, done 2026-10-02. `Design.md` also renamed to `DESIGN.md` to match the references. |
| 14 | `public/footer-art.png` is outside Astro's configured `website/public/`, so it is not served. Move it, or delete it if unused? | | Moved to `website/public/` 2026-10-02. |
| 15 | `tsc --noEmit` fails on the tests because `@types/node` is missing (it is not in CI). Add `@types/node` as a dev dependency (MIT, types only)? | | Yes, added 2026-10-02. |
| 18 | Volumetric weight calculator ships with no default divisor (rule 4). Do you want a default? If yes, which courier and service, with a rate-card link for `rules-and-sources.md`? | | |
| 19 | Return-loss calculator (prompt 15): confirm the proposed formula. | | Confirmed by the team 2026-10-02. |
| 20 | Visa photo presets need a named reviewer: open each official source in docs/rules-and-sources.md, confirm the values, and fill `reviewedBy`. The tool goes live automatically once all five are filled. | | |
| 21 | Confirm the real domain (with TLD). Canonical links, sitemap.xml and robots.txt use `https://idoconverter.com` from `astro.config.mjs`; change it there or build with `SITE_URL=...`. | | |
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
| JSON PII masker | Developers | mask PII in JSON online | maskjson.com, maskpayload.com (small single-purpose tools), GitHub/PyPI libraries | Low–medium (checked 2026-10-02) | 1 | Built, DoD partly verified |
| Consistent pseudonymizer | Developers | pseudonymize JSON online | No direct online tool; boltai anonymizer, PyPI libraries, vendor blogs | Low (checked 2026-10-02) | 1 | Built, DoD partly verified |
| Log and secret scrubber | Developers | redact API keys from logs | Many client-side log sanitizers (redacted.to, LogScrub, devtoolsdaily, digitalcoding) | Medium–high (checked 2026-10-02) | 1 | Built, DoD partly verified |
| SQL console output to JSON | Developers | psql output to JSON | Only PostgreSQL docs/mailing lists and Neon docs; no online converter | Low (checked 2026-10-02) | 1 | Built, DoD partly verified |
| JSON to TypeScript and Zod | Developers | JSON to TypeScript and Zod | transform.tools, jsonic.io, jsonbeautify and several other generators (for 'json to zod') | High (checked 2026-10-02) | 1 | Built, DoD partly verified |
| JSON repair | Developers | fix broken JSON from AI | Many: mangiucugna json_repair, jsonic, jsonbeam, devwithtools and others | High (checked 2026-10-02) | 1 | Built, DoD partly verified |
| Visa and passport photo sizer | Exam and form | visa and passport photo resizer | Very crowded: photogov, imresizer, 123passportphoto, readytosubmit and many more | High (checked 2026-10-02) | 1 | Built, unlisted until reviewedBy filled |
| Notice period buyout calculator | Job seekers | notice period buyout calculator | HR glossaries (Keka, greytHR, Plum), Hyring and ContractShield calculators | Medium (checked 2026-10-02) | 1 | Built, DoD partly verified |
| Volumetric weight calculator | Online sellers | volumetric weight calculator | Many Indian logistics sites (Shipmozo, BigShip, SellerMitra, Shipybox) | High (checked 2026-10-02) | 1 | Built, DoD partly verified |
| Return-loss calculator | Online sellers | return loss calculator for online sellers | RTO/return calculators from marginpanda, toolbaz, refundorreturn, hillteck | Medium (checked 2026-10-02) | 1 | Built, DoD partly verified |
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

Kept in `docs/rules-and-sources.md` (created 2026-10-02). Columns: rule, value, source, effectiveFrom, lastChecked, reviewedBy. Only TODO rows so far: volumetric divisor default and visa photo specs.

## 7. Legal and launch checklist

- [x] Privacy policy (draft)
- [x] Terms (draft)
- [x] About
- [x] Contact (PHP mail form)
- [x] Disclaimer for CA, tax, visa and pricing tools (draft)
- [ ] Legal pages reviewed by a lawyer or CA
- [x] Extension privacy policy URL (`/privacy#extension`) and permission justifications
- [x] Sitemap, canonical tags, titles and descriptions (domain to confirm: open question 21)
- [x] Lighthouse scores recorded (2026-10-02, see session log)
- [ ] Mobile and four-browser test done
- [ ] Analytics confirmed to capture no tool input
- [x] Backup and rollback copy (process in docs/DEPLOY.md)
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

### 2026-10-02 (prompt 11: extension build)
Milestone / tool: Milestone 4 / Extension 1: JSON Privacy Masker
Done: `extension/json-privacy-masker/` (Manifest V3): right-click menu on selected text with three modes (mask, pseudonymize, scrub secrets) plus a popup for pasted text, all calling the shared `core/` code. Popup styled with the site tokens (system fonts). Original shield icon at 16/32/48/128 px. `npm run build:extension` builds `dist/` with the project's own `tsc` and fails if network-capable code is found. Load-unpacked steps in `extension/json-privacy-masker/README.md`.
Permissions: `contextMenus` only. `activeTab` turned out unnecessary (the click passes the selected text) so it is not requested. No storage, scripting, clipboardWrite or host permissions. CSP `connect-src 'none'`.
Decisions: Right-click result kept in service-worker memory only, handed to the popup once, then cleared. Popup opens automatically where Chrome allows `action.openPopup()`, otherwise a "1" badge. Hand-written Chrome typings instead of `@types/chrome` (no new dependency). Not submitted to any store.
New dependencies (name, size, license): None.
Tests run and result: vitest 99/99 pass (4 new for extension modes). Loaded unpacked in headless Chromium: service worker starts, all three modes work in the popup, invalid JSON points to "Scrub secrets", zero non-extension network requests, no console errors.
Not verified here: the right-click menu itself (cannot be clicked in headless automation). Needs a manual check.
Problems / open questions: Firefox needs `background.scripts`; handle in task 4.5.
Next: prompt 12 needs the team to test the extension first. Then prompts 13–14.
Suggested commit message: Add JSON Privacy Masker extension

### 2026-10-02 (prompt 13: notice period buyout calculator)
Milestone / tool: Milestone 5 / Task 5.1: Notice period buyout calculator
Done: `core/jobseekers/notice-period-buyout.ts`, `/jobseekers/` profession page, tool page `/jobseekers/notice-period-buyout-calculator` with the formula and an assumption note on the page, spec, fixture with 6 cases, 16 tests. Shared `ProfessionLayout.astro` now used by `/developers/` and `/jobseekers/`; tool cards are whole-card links with an outlined "Open tool" (the page previously had six solid primary buttons, against the one-primary-CTA rule). Tool area padding reduced on phones.
Formula (assumption): buyout = (monthly salary ÷ day basis) × max(0, notice days − days served). Day basis default 30, editable 1–31. Salary = whatever the employer uses (basic/gross); leave adjustment and taxes not included.
New dependencies (name, size, license): None.
Tests run and result: vitest 115/115 pass; build passes. Browser: ₹1,20,000 for 60,000 / 90 / 30; full notice → ₹0; empty salary → clear error; no requests carrying input (only the site's own font file for the ₹ glyph); no horizontal scroll at 360 px.
Definition of Done: 1 PASS · 2 PASS · 3 PASS · 4 PARTIAL (Chromium only) · 5 PARTIAL (no related tools yet: only job seekers tool) · 6 PASS (form fields labelled, Enter submits) · 7 PASS · 8 N/A (not a CA/tax/visa/pricing tool; formula and assumption shown anyway).
Next: prompt 14 (volumetric weight calculator).
Suggested commit message: Add notice period buyout calculator and job seekers page

### 2026-10-02 (prompt 14: volumetric weight calculator)
Milestone / tool: Milestone 5 / Task 5.2: Volumetric weight calculator
Done: `core/sellers/volumetric-weight.ts`, `/sellers/` profession page, tool page `/sellers/volumetric-weight-calculator` (cm/kg or in/lb, optional actual weight, higher weight named, formula on page), spec, 5-case fixture, 16 tests. Created `docs/rules-and-sources.md` (Milestone 0 task 0.5) with TODO rows.
Decisions: No default divisor (AGENTS.md rule 4: courier divisors need a source). The field is required and labelled "check your courier's divisor". See open question 18.
New dependencies (name, size, license): None.
Tests run and result: vitest 131/131 pass; build passes. Browser: 40×30×20 cm ÷ 5000 = 4.8 kg vs 2 kg actual → volumetric higher; inch labels switch to in/lb; missing divisor gives a clear error; zero network requests; no horizontal scroll at 360 px.
Definition of Done: 1 PASS · 2 PASS · 3 PASS · 4 PARTIAL (Chromium only) · 5 PARTIAL (no related seller tool yet) · 6 PASS · 7 PASS · 8 PARTIAL: courier divisor has no sourced default by design; no rule value is hard-coded.
Next: STOP for team input. Prompt 12 needs the extension tested; prompt 15 needs the formula confirmed; prompt 16 needs countries and official specs.
Suggested commit message: Add volumetric weight calculator and sellers page

### 2026-10-02 (prompt 12: extension store prep)
Milestone / tool: Milestone 4 / tasks 4.1, 4.3, 4.4
Done: `extension/json-privacy-masker/store/` with privacy policy (collects nothing), listing (single purpose statement verbatim from PRD section 7, short and detailed description, privacy-practices answers), permission justification (`contextMenus` only), screenshot list and a submission checklist. No extension code changed.
Team instructions (2026-10-02): Claude to self-check the extension; return-loss formula approved; Claude picks visa photo countries; contact email myselfhkjha@gmail.com; Claude decides the remaining open items; payment/backend files to be built now, API keys added later by the team.
Still manual: right-click menu test by a person, Chrome Web Store developer account and fee, zip and upload, Edge/Firefox.
Next: prompt 15 (return-loss calculator).
Suggested commit message: Prepare extension store listing documents

### 2026-10-02 (prompt 15: return-loss calculator)
Milestone / tool: Milestone 5 / Task 5.3: Return-loss calculator
Done: `core/sellers/return-loss.ts` with the team-approved formula, page `/sellers/return-loss-calculator` (results list, formulas in a details block, estimate note), spec, 5-case fixture (expected values worked by hand), 13 tests incl. a check that expected profit is 0 at the break-even rate.
New dependencies (name, size, license): None.
Tests run and result: vitest 144/144 pass; build passes. Browser: ₹292.50 expected profit for the sample; return rate 150% → clear error; zero network requests; no horizontal scroll at 360 px.
Definition of Done: 1 PASS · 2 PASS · 3 PASS · 4 PARTIAL (Chromium only) · 5 PASS (related: volumetric weight) · 6 PASS · 7 PASS · 8 N/A (no rule values; estimate note shown).
Next: prompt 16 (visa photo sizer).
Suggested commit message: Add return-loss calculator

### 2026-10-02 (prompt 16: visa and passport photo sizer)
Milestone / tool: Milestone 5 / Task 5.4: Visa and passport photo sizer
Done: Presets as data (`core/forms/visa-photo-presets.json`, 5 presets for India, USA, UK with official source, lastChecked, empty reviewedBy), pure crop and file-size logic (`core/forms/visa-photo-sizer.ts`), `/forms/` profession page, tool page with canvas crop/resize/compress and download, disclaimer, source and date per preset. `docs/rules-and-sources.md` filled. Spec and 20 tests.
Decisions: Countries chosen by Claude (team request). Official pages could not be opened from the build environment, so values were taken from search results on the official domains only; third-party figures (India 630×810 px/250 KB) not used. Tool is listed only when every preset has `reviewedBy` (computed in `tools.ts`). Print outputs use 300 DPI (labelled as our choice).
New dependencies (name, size, license): None.
Tests run and result: vitest 164/164 pass; build passes. Browser: 3000×4000 test photo → US visa 600×600 (86 KB ≤ 240 KB), UK digital 900×1125 (324 KB, ≥ 50 KB), India print 413×531; downloads work; zero network requests (image stays as a local blob); no horizontal scroll at 360 px; pending-review banner shown; `/forms/` shows "coming soon".
Definition of Done: 1 PASS · 2 PASS · 3 PASS (unsupported image message; large photo) · 4 PARTIAL (Chromium only) · 5 PARTIAL (no related tool yet) · 6 PASS (sliders keyboard-operable) · 7 PASS · 8 PARTIAL: sources and dates recorded and shown, disclaimer shown; **reviewedBy empty, so not published** (open question 20).
Next: prompt 17 (Milestone 5 wrap-up).
Suggested commit message: Add visa and passport photo sizer (unlisted pending review)

### 2026-10-02 (prompt 17: Milestone 5 wrap-up)
Milestone / tool: Milestone 5 wrap-up
Check: all four Milestone 5 tools exist with core logic, fixtures, tests and pages: notice period buyout (/jobseekers), volumetric weight and return-loss (/sellers), visa photo sizer (/forms, unlisted until reviewed). Profession pages are linked from the home page cards, all using the same card and the shared `ProfessionLayout`. Home badges: Developers 6 tools, Online sellers 2, Job seekers 1, Exam & form "Coming soon" (visa tool pending review).
Tests run and result: `npx vitest run`: 12 files, 164 tests, all pass. Every page loads with no console errors, no requests after load and no horizontal scroll at 360 px and 1280 px.
Milestone 5: COMPLETE, except the visa preset review (open question 20) and manual cross-browser checks.
Next: prompt 18 (legal pages).
Suggested commit message: Wrap up Milestone 5

### 2026-10-02 (prompt 18: legal pages)
Milestone / tool: Milestone 6 / Task 6.1: Legal pages
Done: `/privacy` (tool input never sent; hosting access logs; contact form emails only; no cookies/analytics; extension section at `#extension`), `/terms`, `/disclaimer` (visa/CA/tax/pricing not professional advice; pattern-based tools), `/about`, `/contact` with `website/public/contact.php`. Privacy, terms and disclaimer show a **Draft, not yet reviewed by a lawyer or CA** banner (`LegalLayout.astro`). Header: removed fake dropdown arrows and a search button that did nothing; "Professionals" now links to the home page professions section (was a 404). Footer: replaced a fake newsletter form (it discarded the email) with a link to the contact page.
Contact form: PHP emails name, email and message to myselfhkjha@gmail.com, stores nothing, never receives tool input. Spam/abuse guards: honeypot field, minimum 3 s on page, length limits, `FILTER_VALIDATE_EMAIL`, CR/LF stripped from header fields (header injection), POST only. Tested with PHP 8.3 built-in server and a captured sendmail: valid message delivered with Reply-To; too-fast, invalid and honeypot submissions rejected; an injected `Bcc:` stays inside the body text.
Decisions: No newsletter (not in PRD; parking-lot idea). Governing law "India" in terms marked for the legal reviewer.
Hosting note: the contact form needs PHP `mail()`, which Hostinger shared hosting provides. On Cloudflare Pages it would need a different form handler.
Legal review: still required before launch (open question 6).
Next: prompt 19 (SEO basics).
Suggested commit message: Add legal pages and contact form

### 2026-10-02 (prompt 19: SEO basics)
Milestone / tool: Milestone 6 / Task 6.2
Done: Search phrases chosen (team asked Claude to decide) and checked with web search; tracker filled with phrase, who ranks and crowding. Every page has a `<title>` and meta description (tool titles and descriptions live in `website/src/data/tools.ts`, written for the phrase), a canonical link, Open Graph tags and a favicon (fixes the old favicon 404). `sitemap.xml` and `robots.txt` are generated from one page list (`website/src/data/pages.ts`); there is also an HTML `/sitemap` page (footer link was a 404). Unlisted pages (visa tool pending review, `/forms/` with no live tool) are `noindex` and left out of the sitemap. Tool pages now pass only a `slug` to `ToolLayout`.
Decisions: Phrases favour less crowded angles where the head term is crowded ("fix broken JSON from AI", "JSON to TypeScript and Zod"). Canonicals use a trailing slash to match how directory-style pages are served.
Open: real domain (open question 21).
Tests run and result: vitest 164/164; build passes; pages load with no console errors (favicon present).
Next: prompt 20 (testing and performance).
Suggested commit message: Add SEO basics: titles, descriptions, canonicals, sitemap

### 2026-10-02 (prompt 20: testing and performance)
Milestone / tool: Milestone 6 / Tasks 6.3, 6.4
Lighthouse 12 (headless Chromium; mobile = simulated slow 4G phone, desktop preset), after fixes:

| Page | Mobile Perf / A11y / Best Pr. / SEO | Desktop Perf / A11y / Best Pr. / SEO | Mobile FCP / LCP / CLS |
|---|---|---|---|
| Home `/` | 97 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 2.1 s / 2.1 s / 0.053 |
| `/developers/` | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.5 s / 1.5 s / 0.02 |
| `/developers/json-pii-masker/` | 99 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.6 s / 1.7 s / 0.018 |
| `/sellers/return-loss-calculator/` | 98 / 100 / 100 / 100 | 100 / 100 / 100 / 100 | 1.9 s / 2.0 s / 0.032 |

All other pages: accessibility 100 and SEO 100, except `/forms/` and the visa tool (SEO 66 because they are deliberately `noindex` until the visa presets are reviewed). Below 90 before fixes: accessibility 86–95. Remaining minor item: render-blocking CSS (~0.7–1.1 s estimated on slow mobile); scores are still 97–100, so left as is.

Fixed: colour contrast (home "Planned" badges 3.01:1 → dark text; pricing "not included" rows 2.11:1 → muted colour with strike-through; footer "Coming soon" links 2.9:1 (opacity removed); footer privacy note 4.24:1 → #A7C5B8, 6.97:1); heading order (home h4 → h3; footer column titles h3 → h2; empty profession page heading); masker page labels (fieldset/legend, label for inputs). Header had **no navigation at all below 900 px** → links now drop to a stacked row under the logo (no JS); header fits at 360 px. Removed dead footer social icons (all `href="#"`) and the **fabricated testimonials section** (invented quotes and names for a site with no users yet, plus non-working carousel arrows): fake reviews would mislead visitors. Added a 404 page.
360 px and 1280 px: every page loads with no console errors, no requests after load, no horizontal scroll.
Security: `website/public/.htaccess` adds HTTPS redirect, CSP `default-src 'self'; connect-src 'none'` and other security headers, caching. Astro set to never inline scripts so the CSP needs no exceptions. Tested every tool, both downloads and the contact page with the CSP applied: all work, zero violations, and a deliberate `fetch()` to another site is blocked by the browser.
New dependencies (name, size, license): None (Lighthouse run from a scratch folder, not added to the project).
Manual checks still needed (only Chromium is available here): Firefox, Safari (macOS and iOS) and Edge — open each tool, run it, check layout at phone width, check the visa photo download and the extension in Edge.
Next: prompt 21 (build and deploy instructions).
Suggested commit message: Fix accessibility, mobile nav and add security headers

### 2026-10-02 (prompt 21: build and deploy)
Done: `npm run build` completes with no errors; `dist/` contains every page, `404.html`, `contact.php`, `.htaccess`, `sitemap.xml`, `robots.txt`, `favicon.svg` and hashed `_astro/` assets. Copy-paste deployment steps for Hostinger (File Manager and SSH/rsync), SSL, email, post-deploy checks, backup and rollback in `docs/DEPLOY.md`; Cloudflare Pages differences noted. Nothing was deployed by Claude.
Before deploying: confirm the domain (open question 21), and ideally get the legal pages reviewed (question 6).
Next: Phase 4 gate check (prompt 22).
Suggested commit message: Add deployment guide

### 2026-10-02 (prompt 22: Phase 4 gate check)
Gate check against NOTES.md section 2:
1. Final tier count and prices confirmed? **No** (Q7, Q8 open). 2. ₹89/year confirmed? **No** (Q7). 3. Feature list per tier? **No** (Q9; PRD has a draft). 4. Payment gateway chosen? **No** (Q10). 5. Retention and deletion decided? **No** (Q11). 6. Who reviews legal/storage wording? **No** (Q6).
Team instruction (2026-10-02, chat): build the payment and backend files now; the team adds API keys and settings later; Claude decides the rest. So Phase 4 code is built with **placeholders, not confirmed decisions**, and must not take real payments until questions 6–11 are answered:
- Tiers and prices: the team's numbers as given (Basic ₹29/month or ₹89/year, Plus ₹129, Premium ₹429), all in `backend/config/plans.php`, marked UNCONFIRMED.
- Features: PRD section 10 draft table.
- Gateway: Razorpay (common for India; PRD's suggestion). One-time payments per period (not auto-renew) to keep it simple; renewal = pay again.
- Retention: saved history kept until the user deletes it or 30 days after the subscription ends; account deletion removes everything at once; payment records kept for accounting but unlinked from the person.
- Saving history is manual and opt-in in the account area; the free tools are not changed and never call the backend.
- Separate app in `backend/`, intended for its own subdomain (e.g. account.YOUR-DOMAIN).

### 2026-10-02 (prompt 23: database schema)
Done: `backend/schema.sql` (MySQL 8 / MariaDB) with users (hashed password only, role user/admin), subscriptions (one row per user, ends_at), payments (kept, unlinked on account deletion), tool_history (commented as the first and only server-side storage of user data, paid opt-in only), login_attempts (email/IP stored as SHA-256 hashes), admin_audit_log, webhook_events (idempotency). Foreign keys cascade on user deletion. Applied successfully to MariaDB 10.11 in the build container. `TECHNICAL_SPEC.md` section 13 and `PRD.md` section 10 updated.
Next: prompt 24 (auth backend).
Suggested commit message: Add Phase 4 gate notes, plans config and database schema

### 2026-10-02 (prompt 24: auth backend)
Milestone / tool: Phase 4 / accounts
Done: `backend/` PHP 8 app, separate from the static site (own document root `backend/public/`, `src/` and `config/` outside the web root). Register (email validation, password 10–72 bytes, `password_hash(PASSWORD_DEFAULT)`), login (`password_verify`, constant-time path for unknown emails via a real dummy hash, `session_regenerate_id(true)`, rehash when needed), logout (POST + CSRF, cookie and session destroyed). Sessions: cookie `ido_account`, httponly, secure (except local http tests), SameSite=Lax, strict mode. CSRF token on every POST. Brute force: 5 failures per email+IP and 20 per IP in 15 minutes, stored as SHA-256 hashes only. Generic error page; details only to the server log. CSP and no-store on every account page. Open-redirect guard on `?next=`. Admin checks read the role from the database each request.
Where user input reaches SQL (all through `q()` = PDO prepared statements with bound parameters, `ATTR_EMULATE_PREPARES=false`): `register_user` (SELECT by email, INSERT user), `login_is_throttled` (COUNT by hashes), `attempt_login` (SELECT by email, INSERT/DELETE login_attempts, UPDATE hash, UPDATE last_login_at), `current_user` and `verify_password_for` (by session id), `save_history`/`list_history`/`get_history_entry`/`delete_history_entry`/`delete_all_history` (all scoped by user_id), `delete_account` (transaction), `subscription_for`/`activate_subscription`/`purge_expired_history`. A grep finds no SQL built by string concatenation or interpolation (28 statements, all parameterised).
Not done (noted for security review): email verification and password reset (would need outgoing email set up on the account subdomain); registration reveals whether an email already has an account.
Tests: `php backend/tests/run.php` against MariaDB 10.11: 11 auth tests pass.

### 2026-10-02 (prompt 25: user panel)
Done: `/dashboard.php` (plan and status, save-a-result form for paid users only, saved results table with view/delete, delete all with confirmation tick, delete account with password), `/history-view.php` (owner-scoped, 404 for others), `/history-save.php`, `/history-delete.php`, `/account-delete.php`. Account area has a dark banner saying data saved here is stored on our server and linking back to the free tools, so it is visually separate. Retention: `purge_expired_history()` runs on dashboard visits and from `backend/cron/cleanup.php` (daily cron), deleting history 30 days after a plan ends.
Can a user fully delete their own data? **Yes**: single entries, all entries and the whole account are hard `DELETE`s (verified in tests and in a browser: users, subscriptions and tool_history rows all gone). Payment rows stay for accounting with `user_id` set to NULL, holding no email.
Tests: 20/20 backend tests pass (incl. cross-user access, plan limit, oversize, retention timing, renewal stacking). Browser run on the PHP server + MariaDB: register → dashboard → logout → bad login → login → save → view (HTML shown escaped) → forged POST without CSRF refused (400) → delete → wrong-password account deletion refused → account deleted with all rows gone; no horizontal scroll at 360 px.
Next: prompt 26 (admin panel).
Suggested commit message: Add account backend: auth and user panel

### 2026-10-02 (prompt 26: admin panel)
Done: `/admin/` (gated by `users.role = 'admin'`, read from the database on every request): totals, saved results per tool (**aggregate counts only, no content view at all**, so no content-access logging is needed), user list with email search (LIKE wildcards escaped) and pagination (LIMIT/OFFSET bound as integers), per-user actions grant/extend, cancel at period end, cancel now (refund), all CSRF-protected and written to `admin_audit_log` (shown on the page). `backend/bin/make-admin.php` grants or revokes admin from the server command line (no web route can make an admin).
Security check, tested over HTTP against the running app (not assumed): anonymous GET `/admin/`, `/admin/index.php`, `/admin` and POST `/admin/subscription.php` → 404; files outside the web root → 404; logged-in non-admin GET `/admin/` → 403; non-admin POST trying to give themselves Premium **with a valid CSRF token** → 403 and no subscription created; admin → 200 and the change works and is audited; after revoking admin, the next request → 403.
Tests: 25/25 backend tests pass (5 admin tests).
Next: prompt 27 (payment gateway).
Suggested commit message: Add admin panel

### 2026-10-02 (prompt 27: payment gateway)
Gate: gateway not formally chosen and no API keys yet; the team asked for the files to be built now and will add keys later. Built for **Razorpay** (placeholder choice). Nothing can be bought until real keys are in `backend/config/config.php` (`/plans.php` shows "Payments are not set up yet" and disables the buttons).
Done: `src/razorpay.php` (order creation, checkout signature check, webhook signature check, idempotent row-locked `complete_payment`, failure handling, checkout callback that also confirms with Razorpay's API), `/plans.php`, `/checkout.php` (Razorpay script allowed by CSP on this page only; no inline script), `/assets/checkout.js`, `/payment-verify.php`, `/webhook-razorpay.php` (no session, signature only). Keys: only in the git-ignored `backend/config/config.php`; where to get each one is in `backend/README.md`.
Tests: 10 payment tests with a fake Razorpay transport and signatures computed from test secrets (no network, no money): server-side amount; unavailable plans refused; placeholder keys refused; valid/tampered/wrong-key signatures; callback requires signature + API `captured` + same order + same amount + same user; API outage leaves it pending for the webhook; webhook activates once, ignores replays and `order.paid` duplicates; bad or tampered webhook signatures → 400 with no change; `payment.failed` never downgrades a paid order; payment for a deleted account not applied. HTTP run against the PHP server: plan buttons show the configured prices; checkout with Razorpay unreachable shows a friendly error; webhook GET 405, bad signature 400, good signature activates, replay ignored, no session cookie; a forged browser callback did not activate anything. 35/35 backend tests pass.
**Security assumptions to double-check (please review each):**
1. HMAC-SHA256 of `order_id|payment_id` with the key secret is Razorpay's checkout signature scheme, and HMAC-SHA256 of the raw body with the webhook secret is the webhook scheme (as in Razorpay's docs; confirm against the current docs before going live).
2. Payments are expected to be **auto-captured** (Razorpay setting). If manual capture is used, `authorized` payments stay pending until captured, and the webhook `payment.captured` activates them.
3. Amounts are in paise and the currency is INR; `config/plans.php` prices are rupees × 100.
4. The webhook URL is reachable only over HTTPS and Razorpay's IPs are not allow-listed; authenticity rests on the signature alone.
5. `REMOTE_ADDR` is the real client IP (no proxy in front). If Cloudflare or another proxy is added, login throttling must read the proxy's trusted header instead.
6. One-time payments per period, no auto-renewal; refunds are done in the Razorpay dashboard and then "Cancel now" in the admin panel (not automated).
7. A payment that arrives after the account was deleted is recorded at Razorpay but not applied here; it needs a manual refund.
8. Razorpay Checkout loads Razorpay's script and iframe on `/checkout.php` only; no other account page and no tool page loads third-party code.
Next: prompt 28 (security review).
Suggested commit message: Add Razorpay payments with server-side verification
