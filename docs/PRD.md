# Product requirements: Idoconverter

_Status: approved MVP scope, 18 October 2026. This document also covers vision, personas, journeys, MVP scope and user stories (see DOCUMENTATION_INDEX)._

## 1. Vision and positioning

**Idoconverter turns raw product photos into Amazon-, Flipkart- and Meesho-ready images in one pass — checked, renamed and sorted — right in the browser.**

- **Problem:** small Indian sellers and the cataloguers who list for them prepare photos by hand, for several marketplaces with different rules. That causes rework and listing problems.
- **Wedge:** India-marketplace-specific checks with stated sources, one-pass export, local processing, and a done-for-you service for photos the tool can't fix.
- **Not:** a Canva or Photoshop replacement, a generic file converter, or an AI image generator.

Evidence and risks are in the business evaluation from earlier in the project. In short: crowded market, weak differentiation, distribution is the main risk. So the MVP is a validation vehicle.

## 2. Personas

| Persona | Needs | Current alternatives | Success looks like |
|---|---|---|---|
| **Cataloguer Kavya**: lists products for 10–30 sellers | Fast, consistent output for several marketplaces; correct file names; client photos kept private | Photoshop actions, Photoroom, manual work | A 50-photo client batch done in minutes, with a report she can send |
| **Seller Sameer**: 40 SKUs on Meesho and Flipkart, shoots on his phone | Photos that aren't rejected; no learning curve; Hindi-friendly | Phone apps, asking a friend, free converters | Uploads pass the first time |
| **One-off visitor**: needs to convert or resize a few images | Quick format and size change | iLoveIMG, TinyPNG, Squoosh | Gets files in under a minute, may return |

## 3. Key journeys

1. **Marketplace batch** (Kavya, Sameer): homepage or `/product-photos` → drop photos → pick preset → review Pass/Check/Fail → fix or reshoot → Download ZIP + report.
2. **Quick conversion** (visitor): `/tools/image-converter` → drop → format, size, quality → Convert → per-file download or ZIP.
3. **Can't fix it myself:** a failed photo → "Send to us on WhatsApp" → done-for-you service. Shown only when configured.
4. **Interested user:** after a batch or on the homepage → early-access form → confirmation.

## 4. MVP scope (MoSCoW)

| Priority | Feature | Status |
|---|---|---|
| Must | Multi-file upload with clear limits (100 files, 30 MB, 40 MP; JPG/PNG/WebP) | Implemented |
| Must | Product-photo pipeline: white background, centring, fill, square size, compression to a limit | Implemented |
| Must | Marketplace presets with source and verification labels | Implemented (Flipkart and Meesho unverified) |
| Must | Per-file status, reasons and fixes; before/after sizes | Implemented |
| Must | Bulk renaming, organised ZIP, CSV report | Implemented |
| Must | Converter: JPG/PNG/WebP, resize (longest/width/height), quality, rotate, flip | Implemented |
| Should | Converter: crop or pad to an aspect ratio, background colour, exact sizes | Implemented (0.5.0) |
| Must | Mobile-usable workflow; accessible controls | Implemented (emulated; real devices pending) |
| Should | Early-access sign-ups and anonymous usage statistics | Implemented |
| Should | Photo-shooting guide | Implemented |
| Should | Done-for-you WhatsApp offer | Implemented; hidden until configured |
| Could | Interactive (drag) crop | Not started (post-MVP); centred aspect-ratio crop shipped |
| Could | Saved workflows (local) | Not started |
| Won't (MVP) | Accounts, payments, AI background removal or generation, templates and editor, watermark removal, scheduling | Deferred (ROADMAP.md) |

Why so narrow: validate repeat use and willingness to pay before adding cost or complexity. AI watermark removal is excluded because of abuse and rights risks.

## 5. User stories and acceptance criteria

| ID | Story | Acceptance criteria | Tests |
|---|---|---|---|
| US1 | As a seller, I drop up to 100 photos and pick a marketplace | Only JPG/PNG/WebP accepted; others are named as skipped; more than 100 explained; previews load | e2e converter "rejects unsupported", product-photo journeys |
| US2 | As a seller, I get square, pure-white, centred photos at the preset size | Output corners are RGB 255; fill within ±1% of target; size equals preset | Python stress run; e2e journeys; engine checks |
| US3 | As a seller, I see which photos need attention and why | Every non-pass result has a plain-language reason and a fix; failures are left out of the ZIP and say so | e2e, axe on results |
| US4 | As a cataloguer, I download correctly named files | `{name}`/`{n}` patterns; unsafe characters replaced; collisions get -2, -3 | Unit `outputName` |
| US5 | As a visitor, I convert formats and sizes in bulk | Real WebP/PNG/JPG bytes; exact dimensions; rotate and flip; one bad file doesn't stop the batch | e2e converter (4 tests) |
| US6 | As a visitor, I'm told when output is worse or different | Notes when browsers can't write WebP, when transparency becomes white, or when output is larger | Engine code, e2e JPG test |
| US7 | As a user, I can stop a batch and keep finished results | Stop ends after the current file; results stay downloadable | Python e2e (stop at 3/100) |
| US8 | As an interested user, I join early access | Same validation in browser and server; duplicate contacts update; clear success and error states | Component, integration, e2e |
| US9 | As a privacy-minded user, I know what leaves my device | Images never uploaded; statistics are counts only; GPC respected; privacy page matches the code | Code review; e2e checks API payloads |

## 6. Success metrics (validation phase)

Source: `batch_events` and `early_access_leads` (`database/queries/validation_metrics.sql`).
- **Activation:** visitors who complete a real (non-sample) batch.
- **Repeat use:** batches per week; share of weeks with at least 2 batches. Repeat users can't be identified (no IDs, by design), so use interviews.
- **Quality:** pass rate per preset, and the share of photos failing on "not white" (sizes the background-removal opportunity).
- **Demand:** early-access sign-ups by role and volume, and paid pilots (VALIDATION_PLAN.md).
