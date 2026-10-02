# idoconverter: Notes and Progress Log

The AI assistant reads this at the start of every session and updates it at the end. Keep entries short and dated.

**Last updated:** 2026-09-28

---

## 1. Current status

| Item | Status |
|---|---|
| Current milestone | Milestone 0: Ready to build |
| Current tool | none yet |
| Blockers | Open questions below |
| Next step | Answer open questions, then validate Phase 1 tools in the tracker |

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
| 2026-09-30 | Motion MCP and a UI/component-generation MCP NOT added | Motion MCP is React-only (motion/react), and this project has no React — adding it means adding React as a new dependency. A component-generation MCP would produce styling that doesn't match the locked DESIGN.md tokens. Both need the team to clarify scope first — see open question 11. |

## 4. Tool tracker

Fill the search phrase and "who ranks" columns during Milestone 0 by googling the exact phrase. Crowding below is an estimate from earlier research, not measured.

| Tool | Profession | Search phrase | Who ranks now | Crowding (est.) | Phase | Status |
|---|---|---|---|---|---|---|
| JSON PII masker | Developers | | | Low | 1 | Not started |
| Consistent pseudonymizer | Developers | | | Low | 1 | Not started |
| Log and secret scrubber | Developers | | | Medium | 1 | Not started |
| SQL console output to JSON | Developers | | | Low to medium | 1 | Not started |
| JSON to TypeScript and Zod | Developers | | | Medium | 1 | Not started |
| JSON repair | Developers | | | Low to medium | 1 | Not started |
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

