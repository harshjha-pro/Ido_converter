# Implementation status

_Last updated: 18 October 2026_

**Verdict: ready for controlled testing** (a small group of known sellers using a deployed build). **Not ready for public launch** until the blockers below are done.

## Complete (implemented and tested)
Product-photo tool (incl. per-photo download, remove after processing), converter (format, quality, crop/pad to aspect ratio, background colour, resize, rotate, flip, renaming, per-file and ZIP download), content-sniffed uploads, early access, batch statistics, health check, SEO foundation plus `/product-photos` explainer content, accessibility (automated), error and empty states, Content-Security-Policy with nonces for scripts and styles, HSTS, docs. Evidence: TEST_RESULTS.md (0.5.0 run: 59 unit, 21 DB, 66 e2e, all passing).

## Status by area (0.5.0)
| Area | State |
|---|---|
| Approved MVP routes (`/`, `/product-photos`, `/tools/image-converter`, `/photo-guide`, `/privacy`, `/terms`, 404) | Implemented, tested (e2e SEO + axe + 360 px) |
| Core image workflow (upload, convert, crop/pad, resize, rotate/flip, compress, rename, downloads, limits, stop, remove) | Implemented, tested on real output files |
| Product-photo workflow (presets, white background, centring, report, ZIP) | Implemented, tested; Flipkart/Meesho rules **unverified** |
| Interactive (drag) crop | Not implemented: aspect-ratio crop covers the common case; drag crop stays on ROADMAP phase 2 |
| Pricing, about, contact pages | Not implemented: not in the route inventory; pricing undecided (MONETIZATION.md), contact blocked on B2 |
| Accounts, payments, AI, templates | Not implemented by design (PRD "Won't", ROADMAP) |
| Real devices, Safari/Firefox, screen readers | Not verified (blocked on hardware) |

## Blockers before public launch
| # | Item | Owner action |
|---|---|---|
| B1 | Real-device testing (Android + iPhone) | Run RELEASE_CHECKLIST manual section |
| B2 | Contact / support channel | Provide a WhatsApp number and/or support email |
| B3 | Legal review of privacy and terms | Engage a lawyer (LEGAL_READINESS.md) |
| B4 | Real domain + Hostinger deploy + DB migration | DEPLOYMENT_GUIDE.md; set `NEXT_PUBLIC_SITE_URL` |
| B5 | Verify client IP header on Hostinger | ENVIRONMENT_CONFIGURATION.md check |

## Next recommended work (in order)
1. Owner blockers B1–B5 above (they gate launch, not code).
2. Verify Flipkart and Meesho rules; then write the two guide pages (SEO_STRATEGY content plan).
3. After deploying: confirm CSP and HSTS headers arrive on Hostinger and watch CPU now that pages render per request (K13).
4. Screen-reader pass (NVDA + VoiceOver) and fixes.
5. Interactive drag crop and local saved settings (`localStorage`), if validation shows repeat use.
6. Optional: extract the result tile from `Workbench.tsx` (now ~410 lines) when a third tool reuses it.

## Deliberately not started
Accounts, payments, AI features, templates and editor: gated on validation (ROADMAP.md).
