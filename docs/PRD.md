# idoconverter: Product Requirements Document (PRD)

**Version:** 0.1 (draft) | **Date:** 2026-09-28 | **Owner:** idoconverter team

> Tags used in this file: **[DECIDED]** means agreed in planning. **[TO VALIDATE]** means we still need to check it (Google results, a domain expert, or a real user). **[OPEN]** means a question the team must answer.

---

## 1. What we are building

A multi-tool website at **idoconverter** with small, focused tools for six professions. Every tool runs **in the visitor's browser**. Files and pasted data are never uploaded to our server.

One browser extension will ship first (a JSON privacy tool for developers). More extensions follow only if a profession has a narrow job that works on the page the person is already looking at.

**Promise to users:** *"Made to fit your task. Runs in your browser. Your data never leaves your device."*

## 2. Why this exists (research summary)

- "Converter" is a crowded label. Users' complaints about existing converters are mostly about **privacy, limits and friction**, not format support.
- We have no VPS. Our shared hosting is limited and already busy, so the server must do almost nothing. Browser-side tools fit this constraint.
- Tool pages hold up better than articles against AI answers, because AI can explain a conversion but cannot hand over a working tool.
- Basic tools (JSON formatter, JWT decoder, clamp generator, px-to-rem, HEIC to JPG, photo and signature resizers) are already covered by many strong sites. We use them as **entry pages**, and lead with the less crowded tools. **[TO VALIDATE per tool]**

## 3. Audience (the six professions) [DECIDED]

| # | Profession | Their problem in one line |
|---|---|---|
| 1 | Developers | Need to transform, clean and safely share data (JSON, SQL output, logs) |
| 2 | CAs and accountants (India) | Need to convert GST and bank data into usable Excel and Tally-ready formats, and run quick calculations |
| 3 | Frontend developers | Need quick CSS, color and unit conversions |
| 4 | Job seekers | Need resume, offer and salary help |
| 5 | Exam and form applicants (India) | Need photos and documents that meet portal size rules |
| 6 | Online sellers | Need cost, weight and image-rule checks |

## 4. Goals and non-goals

**Goals**
- Launch a working site with the Phase 1 tools (section 6) and legal pages.
- Ship one extension that passes Chrome Web Store review.
- Rank tools on specific search phrases where page one is weak.
- Earn from ads and affiliate links without harming trust.

**Non-goals for Phase 1 to 3** (revisit in Phase 4, see section 11)
- User accounts, logins or a database
- Server-side conversion (video, audio, heavy PDF work). Revisit only after traffic proves demand, and only via an outside API or WebAssembly.
- User accounts, logins, saved files or any cloud storage.
- More than one extension before the first is live and reviewed.
- Paid plans, billing or storage (planned for Phase 4, not built yet)
- Any tool that tells users what to file, pay or claim as professional advice.

## 5. Definition of Done for every tool

A tool is finished only when all of these are true:

1. It works on every sample in its tool spec (`docs/tools/<tool>.md`), including the edge cases.
2. **No network request carries user input.** Verify in the browser DevTools Network tab.
3. Empty, invalid and very large input each give a clear message, not a crash.
4. It works at 360 px width and on current Chrome, Edge, Firefox and Safari.
5. The page has the standard template: title, tool, short how-to, FAQ, related tools.
6. It is keyboard usable and has readable color contrast.
7. There are no console errors, and unit tests for the core logic pass.
8. For CA, tax, visa and pricing tools: every rule is in `docs/rules-and-sources.md` with source, effective date and reviewer, and the page shows a "not professional advice" note.

## 6. Feature list by profession

**Crowding** is our estimate from research and is not measured. **[TO VALIDATE]** it by checking the top 10 Google results for the exact phrase before building.

### Phase 1: build first (about 10 tools)

| Tool | Profession | Behavior | Crowding |
|---|---|---|---|
| JSON PII masker | Developers | Paste JSON. Mask values by key name and by pattern. Keep structure. Output valid JSON. | Low |
| Consistent pseudonymizer | Developers | Replace values with fake ones. The same input always gets the same fake within a run, so relationships survive. | Low |
| Log and secret scrubber | Developers | Paste logs. Detect and replace API keys, tokens, JWTs, passwords and private key blocks. List what was found. | Medium |
| SQL console output to JSON | Developers | Paste the text grid printed by psql or mysql. Get typed JSON. | Low to medium |
| JSON to TypeScript and Zod | Developers | Paste JSON. Get interfaces and a Zod schema. | Medium |
| JSON repair | Developers | Fix broken JSON from AI output or hand edits. Show what changed. | Low to medium |
| Visa and passport photo sizer | Exam and form | Crop and resize a photo to a country's spec, in the browser. | Medium |
| Notice period buyout calculator | Job seekers | Estimate buyout cost from salary and days. | Low |
| Volumetric weight calculator | Online sellers | L x W x H divided by a divisor the user can change. | Medium |
| Return-loss calculator | Online sellers | Show loss per returned order and margin after returns. | Low (unverified) |

#### Phase 1 behavior details

**JSON PII masker**
- Input: JSON text. Options: key list (defaults such as `email`, `phone`, `name`, `password`, `token`, `secret`, `authorization`, `aadhaar`, `pan`), pattern detection (email, phone, JWT, 12-digit Aadhaar-like number, PAN-like pattern), and mask style (full, partial, placeholder).
- Must handle nested objects, arrays, `null`, numbers and booleans. Output is valid JSON. Show a count of what was masked.
- Test samples: nested emails, arrays of users, `null` values, key names in mixed case, and invalid JSON input.

**Consistent pseudonymizer**
- Same input gives the same fake within a run. Works across different keys. Optional seed value.
- No mapping is stored or sent anywhere. The mapping is only exportable if the user asks for it.

**Log and secret scrubber**
- Pattern-based, so it can miss things. The page must say so and tell users to review the output before sharing.
- Replace with `[REDACTED:type]` and show a findings list.

**SQL console output to JSON**
- Parse psql aligned output, mysql grid output and tab-separated text. Ignore row-count footers.
- Convert `NULL` to `null`, and detect numbers and booleans. Support several result sets in one paste.

**JSON to TypeScript and Zod**
- Mark keys optional when they are missing in some array items. Handle unions, nested names and empty arrays.

**JSON repair**
- Handle trailing commas, single quotes, unquoted keys, comments, code fences, Python `True`/`None`, and truncated output.
- Show a change list. If it cannot repair the input, say why.

**Visa and passport photo sizer**
- Presets per country. Each preset must have an official source link and a "last checked" date in `docs/rules-and-sources.md`.

**Notice period buyout, volumetric weight, return-loss calculators**
- The formulas are written in each tool spec and marked "assumption" where practice differs by employer or carrier. Divisors and percentages are editable.

### Phase 2: CA and accountant tools (needs a CA reviewer first) [OPEN]

| Tool | Crowding |
|---|---|
| Merge several months of GSTR-2B JSON into one Excel | High |
| Bank statement CSV cleaner with column mapping for Tally import | Medium |
| GST inclusive and exclusive calculator | High |
| GST late fee and interest calculator | Medium |
| TDS rate and threshold lookup | Medium |
| Compliance due-date calendar by state and entity | Medium |

Do not publish any of these until a qualified CA has checked the rules and sample outputs. These need an update process every financial year.

### Phase 3: high-crowding entry pages

| Profession | Tools |
|---|---|
| Frontend developers | CSS to Tailwind, clamp generator, color converter (with OKLCH and contrast check), px/rem/em converter, Tailwind v3 to v4 helper (unvalidated) |
| Job seekers | Resume vs job description keyword matcher, ATS plain-text preview, CTC to in-hand salary, salary hike and offer comparison |
| Exam and form | Photo and signature resizer to exact KB, PDF compress to target size, images to one PDF under a limit, name-and-date strip on photo, HEIC to JPG |
| Online sellers | Marketplace image size and background checker, profit calculator with fees, GST and returns, price with GST and margin calculator |
| Developers | JSON formatter and validator, JWT decoder, JSON diff, JSONPath tester, JSON/YAML/TOML, flatten and unflatten |

Exam and form applicants (India) is very crowded. Prefer less-covered destinations first, such as visas and application uploads.

## 7. Browser extension [DECIDED for the first one]

**Extension 1: JSON Privacy Masker**
- **Single purpose (one sentence):** *Select JSON or text on a web page, mask sensitive values locally, and copy the safe version.*
- Includes: the JSON PII masker, the pseudonymizer and the log scrubber, which all serve the same purpose.
- Works through a right-click menu and a popup or side panel.
- Does not open our website as its only function. It must be useful on its own.

**Rules from Chrome Web Store policy (checked in research):**
- One narrow, easy-to-explain purpose. No bundles of unrelated features and no broad "toolbox".
- No multiple extensions with the same user experience, even if the code differs.
- Request only permissions the purpose needs. No access to all sites.
- Provide a privacy policy and a clear single purpose field.

Other professions get an extension only if the work happens on a page they are already viewing, and only with a distinct job. Ideas (unvalidated): frontend developers, select an element and copy its styles as Tailwind; job seekers, compare a job post with a resume; online sellers, check listing image and title rules; CAs, only if a CA confirms a repeated on-page task.

## 8. Monetization

- Google AdSense on tool and guide pages (needs privacy policy, terms, about, contact).
- Affiliate links (for example VPN, PDF software, cloud storage), with clear disclosure.
- Extensions do not show ads. They send people to the site, and a Pro tier may come later.
- No analytics that read tool inputs. Use privacy-friendly page-level analytics only.

## 9. Risks

| Risk | Mitigation |
|---|---|
| Crowded search results | Validate each phrase first. Prefer specific, rule- or version-based queries. |
| Wrong tax, visa or fee rules cause harm | Reviewer sign-off, sources sheet, disclaimers, an update date on each page |
| Chrome rejects or removes an extension | Stay narrow, few permissions, no repetitive extensions |
| Pattern-based scrubbing misses secrets | Clear warning, findings list, tests with realistic samples |
| Scope creep across six professions | Phased plan. A second profession starts only after the first shows traction. |
| Shared hosting limits | Static files only. Keep Cloudflare Pages as a free fallback host. |
| Search traffic drops from AI summaries | Focus on working tools, not articles. Write guides that support tools. |

## 10. Pricing and accounts (planned, Phase 4) [DRAFT, NOT CONFIRMED]

This is a real scope change, not an add-on. Sections 4 and 6 say the tools need no account and no server. A paid plan with storage and history needs both. **Do not start this until Phase 1 to 3 tools are live and the free site has some traffic.** Building accounts before the free tools prove themselves risks a lot of work with nothing using it yet.

### 11.1 Tiers (numbers confirmed by the team; features not yet listed)

| Tier | Monthly price | Yearly price | What it unlocks |
|---|---|---|---|
| Free | ₹0 | — | All tools, no storage, no history |
| Basic | ₹29 | ₹89 **[CHECK THIS NUMBER]** | *[TO FILL IN]* |
| Plus | ₹89 or ₹129 **[CLARIFY: is ₹89 monthly reused here, or is this a 4th distinct tier?]** | — | *[TO FILL IN]* |
| Premium | ₹429 | — | Storage and previous-data history are confirmed to be included in **all** paid plans, not premium-only |

**[OPEN] Flag on the ₹89 yearly price:** normal yearly pricing is cheaper than 12 months of the monthly price, not close to it. ₹29 × 12 = ₹348, so ₹89 for a year is a 74% discount. Confirm this is intended before it goes live, since it will look wrong next to the ₹89, ₹129 and ₹429 monthly-looking numbers.

**[OPEN] Tier count:** the team said 4 tiers (₹29, ₹89, ₹129, ₹429), but ₹89 appears twice, once as "Basic paid yearly" and once as a separate tier. Confirm whether this is 3 paid tiers (Basic, Plus, Premium) with a yearly option on Basic, or 4 fully separate tiers.

**[OPEN] Feature list per tier.** Not yet provided. Suggested draft, to edit:

| Feature | Free | Basic | Plus | Premium |
|---|---|---|---|---|
| All tools | Yes | Yes | Yes | Yes |
| Saved history of past conversions | No | Yes | Yes | Yes |
| Cloud storage for files/results | No | Small limit | Larger limit | Largest limit |
| Ads | Shown | Removed | Removed | Removed |
| Batch processing (multiple files at once) | No | No | Yes | Yes |
| Priority support | No | No | No | Yes |

### 11.2 What this changes technically (see TECHNICAL_SPEC.md section 14)

- Storing "previous data" means files or results **leave the browser and reach a server**, which conflicts with the current privacy promise ("your data never leaves your browser"). This needs a clear, separate promise for paid plans: what is stored, for how long, and how it's protected. **[OPEN]** decide this before building.
- Needs: user accounts and login, a database, a payment gateway, and a dashboard to view/download past results.
- PHP alone (contact-form-only) is no longer enough. Laravel or a similar framework becomes worth using here specifically, since accounts, billing and storage are exactly what a framework is for.

### 11.3 Before building this phase

1. Confirm the tier numbers and features above.
2. Decide the storage promise and write it into the privacy policy.
3. Pick a payment gateway (commonly Razorpay or similar for India; not yet researched).
4. Decide data retention: how long results are kept, and how a user deletes their data.
5. Check India's data protection rules (DPDP Act) for what a storage feature requires. **[OPEN, needs its own research]**

## 11. Open questions [OPEN]

1. Who builds this, and how comfortable are they with coding? This decides the stack.
2. Is a CA available for review and for real-world task input?
3. Does the site keep the name "idoconverter" as the brand, or use it as a sub-brand?
4. Which hosting path is used at launch: the current Hostinger plan or Cloudflare Pages?
5. Which countries come first for the visa photo sizer?
