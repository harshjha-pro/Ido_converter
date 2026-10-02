# idoconverter: Project Context

**Version:** 0.1 | **Date:** 2026-09-30
**Purpose of this file:** a single, readable summary of what we're building, why, and the plan — for anyone (human or AI) who needs to get oriented fast. For full detail, see the linked documents. This file should stay short; detail belongs in the other docs, not here.

**Related documents:** `PRD.md` (full requirements) · `TECHNICAL_SPEC.md` (architecture) · `DESIGN.md` (visual system) · `IMPLEMENTATION_PLAN.md` (milestones and tasks) · `AGENTS.md` (AI build rules) · `NOTES.md` (running log, tool tracker, open questions)

---

## 1. What we are making

**idoconverter** is a multi-tool website, plus a browser extension, offering small, focused, browser-based tools for six professions. Every tool runs entirely in the visitor's browser — nothing is uploaded to a server. That privacy promise is the product's main selling point, not just a technical detail.

**One-line pitch:** *Tools made to fit your task. Runs in your browser. Your data never leaves your device.*

**Domain:** idoconverter (already owned)
**Hosting:** Hostinger shared hosting (no VPS, plan is already busy)
**AI build tool:** Google Antigravity (reads `AGENTS.md` as its rules file)

## 2. Why this idea, and why this shape

- The original idea was a generic file converter, but a shared hosting plan can't run heavy server-side conversion (video, audio, large PDF processing) without hitting process/RAM/CPU limits.
- Research into existing converters found the main user complaints are about **privacy, daily limits, watermarks and sign-up friction** — not missing formats. That's the gap we build into: tools that need no upload, no account, no limit.
- "Converter" as a general category is crowded. Going **profession-specific** (a developer's actual daily tasks, a seller's actual calculations) is less crowded than generic formatters, JWT decoders, or unit converters.
- Tool pages hold up better than blog articles against AI-generated search summaries, because an AI answer can explain a conversion but can't hand over a working tool.

## 3. The six professions (long-term scope)

| # | Profession | Status |
|---|---|---|
| 1 | Developers | **Building now** — Phase 1 |
| 2 | Online sellers | **Building now** — Phase 1 |
| 3 | Job seekers | **Building now** — Phase 1 |
| 4 | Exam and form applicants (India) | **Building now** — Phase 1 |
| 5 | CAs and accountants | Phase 2 — waits for a CA reviewer, tax rules are high-stakes |
| 6 | Frontend developers | Phase 3 — very crowded space, used as SEO entry pages later |

## 4. How it's built

| Layer | Choice |
|---|---|
| Frontend | Astro (static output) with TypeScript |
| Tool logic | Pure TypeScript functions in `core/`, shared by the website AND the extension — written once, used in both places |
| Tests | Vitest, with fixtures per tool, including "leak tests" for anything that touches sensitive data |
| Backend | Static files only for tools. PHP is allowed **only** for non-tool pages like the contact form — it must never receive tool input. No Laravel, no database, no accounts, until Phase 4 (see section 8) |
| Hosting | Hostinger shared hosting; Cloudflare Pages is the fallback if PHP/SSH turns out to be too limited |
| Design | Astro + TypeScript UI, following `DESIGN.md` — a cream/forest-green palette inspired by a SaaS landing page reference, applied only to colors, type pairing and layout structure (no copied illustrations or photos) |

**The core architecture rule:** every tool is a pure function — `run(input, options) → result` — with no DOM access, no network calls, and no logging of input. The website calls it from a page. The extension calls the exact same function from a popup or context menu. This is what lets one extension exist per profession's narrow job without duplicating logic.

## 5. The extension strategy

Chrome Web Store policy requires a **single, narrow purpose** per extension — no broad toolbox, and no splitting one feature across multiple near-identical extensions. Because of this:

- **One extension to start:** *JSON Privacy Masker* — select JSON or text on a page, mask sensitive values locally, copy the result. Built from the same `core/developers/` code as the website.
- Other professions get an extension only if a real, repeated task happens **on a page the user is already looking at** (not just upload-and-download). Most profession tools don't need one.

## 6. What's in Phase 1 (building right now)

Ten tools across the four active professions, each browser-only, no accounts:

**Developers:** JSON PII masker, consistent pseudonymizer, log/secret scrubber, SQL console output → JSON, JSON → TypeScript/Zod, JSON repair
**Job seekers:** notice period buyout calculator
**Online sellers:** volumetric weight calculator, return-loss calculator
**Exam and form applicants:** visa/passport photo sizer (2–3 countries to start)

Full behavior details, edge cases and Definition of Done for each are in `PRD.md` section 6 and 5.

### 6a. Every tool across every phase (full list)

This is the complete tool list, not just what's being built right now. "Status" is tracked in detail in `NOTES.md` section 4 (the tool tracker) — this table is a quick-reference snapshot and can go slightly stale; the tracker is the source of truth.

| Tool | Profession | Phase |
|---|---|---|
| JSON PII masker | Developers | 1 |
| Consistent pseudonymizer | Developers | 1 |
| Log and secret scrubber | Developers | 1 |
| SQL console output to JSON | Developers | 1 |
| JSON to TypeScript and Zod | Developers | 1 |
| JSON repair | Developers | 1 |
| Visa and passport photo sizer | Exam and form | 1 |
| Notice period buyout calculator | Job seekers | 1 |
| Volumetric weight calculator | Online sellers | 1 |
| Return-loss calculator | Online sellers | 1 |
| GSTR-2B JSON to Excel (multi-month) | CAs | 2 |
| Bank statement CSV cleaner (Tally mapping) | CAs | 2 |
| GST inclusive and exclusive calculator | CAs | 2 |
| GST late fee and interest calculator | CAs | 2 |
| TDS rate and threshold lookup | CAs | 2 |
| Compliance due-date calendar | CAs | 2 |
| JSON formatter and validator, JWT decoder | Developers | 3 |
| Clamp generator, px/rem/em, color converter | Frontend | 3 |
| CSS to Tailwind | Frontend | 3 |
| Tailwind v3 to v4 helper | Frontend | 3 (needs validation) |
| CTC to in-hand, hike comparison | Job seekers | 3 |
| Resume keyword matcher, ATS preview | Job seekers | 3 |
| Photo and signature resizer, PDF compress, HEIC to JPG | Exam and form | 3 |
| Marketplace image checker, profit calculator, GST price and margin | Sellers | 3 |

**Browser extension:** JSON Privacy Masker (wraps the three Phase 1 developer privacy tools). Other extensions only if a profession gets a real on-page (not upload/download) job — none confirmed yet.


## 7. The roadmap, in order

1. **Milestone 1:** Project skeleton (Astro/TS/Vitest, folder structure), then the visual design system applied to navbar, footer, home page, profession page and the tool page template.
2. **Milestone 2:** The three developer privacy tools (masker, pseudonymizer, scrubber).
3. **Milestone 3:** The three developer data-to-code tools (SQL→JSON, JSON→TS/Zod, JSON repair).
4. **Milestone 4:** Build and test the JSON Privacy Masker browser extension (not submitted to any store yet).
5. **Milestone 5:** The remaining Phase 1 tools — notice period buyout, volumetric weight, return-loss, visa photo sizer — and their profession pages.
6. **Milestone 6:** Launch prep — legal pages (drafts, need real legal/CA review), SEO basics (sitemap, titles, descriptions), performance and cross-browser testing, and the production build/deploy instructions.

After Milestone 6, the site is live with about 10 tools and one extension.

**Then, not yet started:**
- **Phase 2:** CA and accountant tools (GST, TDS, bank statement cleanup) — waits for a CA to review every rule and output before anything publishes.
- **Phase 3:** The high-crowding "entry page" tools (JSON formatter, JWT decoder, clamp generator, px/rem converter, HEIC to JPG, etc.) — built for search traffic and trust, not as the main reason to visit.
- **Phase 4:** Paid subscription plans (Free / Basic / Plus / Premium) with saved history and storage. This is a real architecture change — it needs accounts, a database and a payment gateway, which breaks the "static site, nothing leaves the browser" model. **Not started.** Several numbers are still unconfirmed (see section 8).

Full task-by-task detail is in `IMPLEMENTATION_PLAN.md`.

## 8. Pricing plan (planned, Phase 4 — not built yet)

All tools stay **free** in Phases 1–3. Paid plans are a later addition, for storage and saved history on top of the free tools. Numbers below are what the team has confirmed so far, but two are still unresolved — see the flags.

| Tier | Price | What it adds |
|---|---|---|
| Free | ₹0 | All tools, no storage, no history |
| Basic | ₹29/month, or ₹89/year **[unconfirmed, see flag below]** | *feature list not yet written* |
| Plus | ₹129 *(period unconfirmed)* | *feature list not yet written* |
| Premium | ₹429 *(period unconfirmed)* | *feature list not yet written* |

Storage and previous-conversion history are meant to be included across **all** paid tiers, not premium-only — what changes between tiers (storage limit, batch processing, ad removal, etc.) hasn't been decided.

**Two flags before this is buildable:**
- The ₹89/year figure looks unusually steep as a discount (₹29 × 12 = ₹348, so ₹89/year would be a ~74% cut). Needs a yes/no confirmation that it's intended, not a typo.
- It's unclear whether this is **3 tiers** (Basic with a monthly/yearly choice, Plus, Premium) or **4 fully separate tiers** where ₹89 stands alone. This changes the pricing page layout, so it needs deciding before any UI is built.

**Why this is Phase 4 and not sooner:** storing user history means data leaving the browser, which breaks the "nothing leaves your device" promise that Phases 1–3 are built around. It also needs accounts, a database and a payment gateway — a real architecture change, not a small add-on. Building it before the free tools have traction risks a lot of work with no one using it yet.

Full detail: `PRD.md` section 10, `TECHNICAL_SPEC.md` section 13.

## 9. MCP servers configured for this project

| MCP | Status | Why |
|---|---|---|
| Chrome DevTools MCP | **Added** | Verifies the "no tool sends input anywhere" rule by reading real network requests, not just code review. Also used for 360px testing and Lighthouse checks in Milestone 6. |
| Motion MCP (mcp.motion.dev) | **Not added — flagged, see open question 11** | Real, official, free MCP for the Motion/Framer Motion animation library. But it's built for React (`motion/react`), and this project is static Astro with no React. Adding it means adding React as a dependency to an intentionally lightweight tool site, which needs explicit approval under AGENTS.md rule 3, not just the MCP install. |
| A UI/component-generation MCP (e.g. 21st.dev Magic) | **Not added — not recommended by default** | Generates pre-styled components that won't match the locked color/type tokens in `DESIGN.md`, and tool pages are meant to stay plain (input box, output box), not component-heavy. Could be useful for idea-browsing only, never for final code, without restyling to our tokens. |

Any new MCP follows the same rule as any new dependency (AGENTS.md rule 3 / "When to stop and ask"): propose it, say why, get a yes, before it's added.

## 10. Open questions that still need answers

| # | Question |
|---|---|
| 1 | Is a CA available to review Phase 2 tools? |
| 2 | Which countries come first for the visa photo sizer? |
| 3 | PHP version, SSH access and Composer availability on the Hostinger plan (check hPanel) |
| 4 | Pricing: confirm the ₹89/year figure (see section 8) |
| 5 | Pricing: 3 tiers or 4 (see section 8) |
| 6 | Pricing: feature list per paid tier — not yet provided |
| 7 | Payment gateway choice for India (not yet researched) |
| 8 | Data retention period and deletion process, once storage exists |
| 9 | Who reviews the legal pages before launch (lawyer/CA)? |
| 10 | Font pairing for the design system — proposed but not yet approved/installed |
| 11 | What exactly is the "motion" need — a few subtle CSS transitions, or real animated marketing-style sections (which would mean adding React just for that)? See section 9. |

Full list, with more detail, is in `NOTES.md` section 2. Pricing-specific questions are also summarized above in section 8.

## 11. The non-negotiable rules (apply to every session, every tool)

1. **No tool ever sends user input anywhere.** No fetch, no analytics on input, no logging.
2. **No invented rules.** Tax, GST, TDS, visa specs, courier divisors — only from a source recorded in `docs/rules-and-sources.md`, with an effective date and a reviewer. If a value is missing, it's a `TODO`, not a guess.
3. **No new dependency without asking first** — including fonts, libraries, and CDNs.
4. **One tool at a time**, built to the Definition of Done before starting the next.
5. **Plan before coding**, and wait for approval on anything non-trivial.
6. **CA, tax, visa and pricing tools** always carry a "not professional advice" disclaimer, a source, and a "last checked" date.

Full rules: `AGENTS.md`.

## 12. Current status

*(Update this section as the project moves — treat it as the fastest way to see where things stand.)*

- Milestone: 1 (skeleton built, design system being applied)
- Professions with any live pages: Developers (partial — one tool card, no real logic yet)
- Tools with working logic: none yet (JSON PII masker is next)
- Extension: not started
- Legal pages: not started
- Live/deployed: no

For the detailed, dated log, see `NOTES.md` section 9 (session log) and section 1 (current status table).
