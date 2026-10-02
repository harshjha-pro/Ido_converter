# idoconverter: Implementation Plan

**Version:** 0.1 (draft) | **Date:** 2026-09-28
Read the plan before approving it. It is cheapest to change here, before any code exists.

**How to use this plan:** work through milestones in order. Each milestone has tasks and an **exit check**. Do not start the next milestone until the exit check passes. Dates are left blank on purpose. Add them once you know who is building and how much time they have.

---

## Milestone 0: Ready to build

| # | Task |
|---|---|
| 0.1 | Put the five documents in `docs/` (PRD, TECHNICAL_SPEC, IMPLEMENTATION_PLAN, NOTES) and `AGENTS.md` at the project root |
| 0.2 | Answer the open questions in `PRD.md` section 10 (who builds, CA availability, hosting path) |
| 0.3 | Confirm the stack in `TECHNICAL_SPEC.md` section 2 |
| 0.4 | Create the private Git repository |
| 0.5 | Create `docs/rules-and-sources.md` (empty table with columns: rule, value, source, effectiveFrom, lastChecked, reviewedBy) |
| 0.6 | **Validate Phase 1 tools:** for each, google the exact phrase and record who ranks and how strong they are in the tool tracker in `NOTES.md` |
| 0.7 | Write short tool specs in `docs/tools/` for the first 3 tools only (inputs, outputs, edge cases, 3 to 5 samples) |

**Exit check:** the documents are in the repo, the stack is confirmed, and the tracker has a row for every Phase 1 tool. If validation shows a tool is dominated by strong sites, mark it and decide whether to keep or drop it.

## Milestone 1: Skeleton and first tool

| # | Task |
|---|---|
| 1.1 | Ask the AI for a **skeleton only**: folders, empty files, function signatures, no real logic. Review the structure. |
| 1.2 | Set up the site: home page, `/developers/` page, tool page template, header and footer |
| 1.3 | Set up tests and fixtures folders |
| 1.4 | Build **JSON PII masker** end to end: `core` logic, tests with a leak test, page, FAQ |
| 1.5 | Deploy a test build to the real host (or a Cloudflare Pages preview). Confirm HTTPS. |
| 1.6 | Fill in the real commands in `AGENTS.md` |

**Exit check:** the JSON PII masker meets the Definition of Done (PRD section 5). The Network tab shows no request carrying input. The deployed page loads correctly on a phone.

## Milestone 2: Developer privacy tools

| # | Task |
|---|---|
| 2.1 | Consistent pseudonymizer (spec, tests, page) |
| 2.2 | Log and secret scrubber (spec, tests with a leak test, page). Include the "review before sharing" warning. |
| 2.3 | Link the three tools to each other as related tools |

**Exit check:** all three tools pass the Definition of Done. Their leak tests include emails, phones, tokens, JWTs and passwords.

## Milestone 3: Data-to-code tools

| # | Task |
|---|---|
| 3.1 | SQL console output to JSON (psql, mysql and tab-separated samples) |
| 3.2 | JSON to TypeScript and Zod |
| 3.3 | JSON repair, including truncated and AI-generated output |

**Exit check:** all three pass the Definition of Done. The developers section has 6 tools.

## Milestone 4: Extension 1 (JSON Privacy Masker)

| # | Task |
|---|---|
| 4.1 | Write the single purpose statement and the permission list with one-line reasons |
| 4.2 | Build the extension using the same `core` code: context menu plus popup or side panel |
| 4.3 | Write and publish the privacy policy page on the site |
| 4.4 | Prepare the store listing: description, screenshots, single purpose field, permission justifications |
| 4.5 | Test on Chrome, Edge and Firefox. Confirm no network requests and no extra permissions. |
| 4.6 | Submit to the Chrome Web Store first, then Edge and Firefox |

**Exit check:** the extension is submitted with a clear single purpose and minimal permissions. Expect the review to take a few days. Fix and resubmit if asked.

## Milestone 5: Low-crowding tools from other professions

| # | Task |
|---|---|
| 5.1 | Notice period buyout calculator |
| 5.2 | Volumetric weight calculator |
| 5.3 | Return-loss calculator (write and check the formula first) |
| 5.4 | Visa and passport photo sizer for 2 or 3 countries, each with an official source recorded in `rules-and-sources.md` |
| 5.5 | Add the profession pages and link them from the home page |

**Exit check:** each tool meets the Definition of Done. Every rule, divisor and country spec has a source and date.

## Milestone 6: Launch preparation

| # | Task |
|---|---|
| 6.1 | Finish the legal pages: privacy, terms, about, contact, disclaimer. Have them reviewed. |
| 6.2 | Generate sitemap.xml, canonical tags, titles and descriptions for every page |
| 6.3 | Run Lighthouse on every page type and record scores in `NOTES.md` |
| 6.4 | Test on real phones and on all four browsers |
| 6.5 | Set up privacy-friendly analytics with no tool input captured |
| 6.6 | Set up backups and a rollback copy |
| 6.7 | Submit the site to Google Search Console |
| 6.8 | Apply for AdSense once there is enough content and the legal pages are live |

**Exit check:** the launch checklist is complete and the site is live with about 10 tools and one extension.

---

## Phase 2: CA and accountant tools

Start only when a qualified CA is available for review. **[OPEN]**

| # | Task |
|---|---|
| P2.1 | Interview the CA. Ask which small, repeated tasks waste the most time. Adjust the tool list to match. |
| P2.2 | Fill `rules-and-sources.md` with every rule, from official notifications or circulars |
| P2.3 | Build in this order: GSTR-2B JSON to Excel (multi-month), bank statement CSV cleaner, GST calculators, TDS lookup, due-date calendar |
| P2.4 | The CA reviews each tool against sample data. Record `reviewedBy` and the date. |
| P2.5 | Add the disclaimer, sources and "last checked" date on every page |
| P2.6 | Set a yearly update reminder for each financial-year rule |
| P2.7 | Decide with the CA whether a real on-page task exists that justifies a second extension |

## Phase 3: High-crowding entry pages

Build these to add search entry points and trust, not as the main reason to visit.

| # | Task |
|---|---|
| P3.1 | Developers: JSON formatter and validator, JWT decoder, JSON diff, JSONPath tester, JSON/YAML/TOML, flatten and unflatten |
| P3.2 | Frontend: px/rem/em, clamp generator, color converter with contrast check, CSS to Tailwind |
| P3.3 | Job seekers: CTC to in-hand, hike comparison, resume keyword matcher, ATS preview |
| P3.4 | Exam and form: photo and signature resizer, PDF compress to target size, images to one PDF, HEIC to JPG |
| P3.5 | Sellers: GST price and margin, profit calculator with fees and returns, marketplace image checker |
| P3.6 | Review what users actually use. Consider an extension only for tools that work on a page the user is already viewing. |

## Phase 4: Accounts, storage and paid plans

**Do not start until Phase 1 to 3 are live and the free tools have real usage.** See `docs/PRD.md` section 10 for tiers and open questions, and `docs/TECHNICAL_SPEC.md` section 14 for the architecture.

| # | Task |
|---|---|
| P4.1 | Confirm tier count, prices and the yearly-price anomaly with the team |
| P4.2 | Write the feature list per tier (currently a draft table in the PRD) |
| P4.3 | Decide and write the storage/retention promise; update the privacy policy |
| P4.4 | Research a payment gateway for India (fees, shared-hosting fit) |
| P4.5 | Set up Laravel and a database, kept separate from the static tool site |
| P4.6 | Build accounts, login, and the billing flow |
| P4.7 | Build the "save this result" and history/dashboard feature, opt-in and paid-only |
| P4.8 | Security review: passwords, sessions, payment handling, stored user data |
| P4.9 | Test that the free static tools still work with zero dependency on the new backend |

## Later ideas (not committed)

- Heavy conversions (video, audio, large PDF) through an outside API or WebAssembly, only after traffic proves demand
- A Pro tier
- Guide articles for tools that already rank
- Tailwind v3 to v4 helper, portfolio auditor (both unvalidated)

## Rules for changing this plan

- Adding a tool: it needs a tracker row, a validated search phrase and a tool spec.
- Changing a published URL: not allowed without a redirect and approval.
- Every milestone ends with an update to `docs/NOTES.md`.
