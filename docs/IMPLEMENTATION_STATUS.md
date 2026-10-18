# Implementation status

_Last updated: 18 October 2026 (0.6.0)_

**Verdict: ready for controlled testing** (a small group of known sellers using a deployed build). **Not ready for public launch** until the blockers below are done.

## Owner decisions recorded (18 October 2026)
- Domain: **idoconverter.com**, without www (the www host should 301 to it). Matches the `NEXT_PUBLIC_SITE_URL` default.
- Support contact: "will add later". Set `NEXT_PUBLIC_SUPPORT_EMAIL` (and optionally `NEXT_PUBLIC_WHATSAPP_NUMBER`) before launch; the privacy page shows it automatically.
- Real-device testing and legal review: the owner asked Claude to do them. Done as far as possible without devices or a lawyer: emulated phone/tablet/desktop testing, and a self-review of privacy and terms against the DPDP Act structure. **Neither replaces the real thing** (B1, B3 stay open).
- Flipkart/Meesho rules: researched; no official public source exists (seller logins). Presets stay "Unverified"; Meesho minimum raised to 1000 px.
- Scope: the owner asked for "all the other things the prompts describe". Built everything that needs no outside service: watermark tool, templates and editor, brand kit, saved settings, multi-marketplace export, tools/about/pricing pages. **Accounts, payments and AI wait** for keys and a budget (owner's choice).

## Status by area
| Area | Routes / code | State |
|---|---|---|
| Product photos: presets, white background, centring, report, ZIP, per-photo download, remove, **several marketplaces in one run** | `/product-photos`, `components/tool/Workbench.tsx`, `lib/image/productPlan.ts` | Implemented, tested on real output; Flipkart/Meesho rules **unverified** |
| Image converter: format, quality, crop/pad to ratio, background, resize, rotate, flip, rename | `/tools/image-converter`, `components/tool/batch/BatchWorkbench.tsx` | Implemented, tested on real output |
| **Watermark tool**: text or logo, 9 positions or tiled, opacity, size, margin, format | `/tools/watermark`, `lib/image/watermark.ts` | Implemented, tested on real output pixels |
| **Templates**: 8 original editable templates in 4 sizes, editor with text/size/colours/photo/logo, undo/redo, draft, PNG/JPG | `/templates`, `/templates/[id]`, `lib/templates/*` | Implemented, tested (export pixels match edits) |
| **Brand kit** and **saved settings** (browser only) | `/brand-kit`, `components/tool/SavedSettings.tsx`, `lib/brandKit.ts`, `lib/storage.ts` | Implemented, tested |
| **Pages**: tools directory, about, pricing (free during early access) | `/tools`, `/about`, `/pricing` | Implemented, tested (SEO, axe, 360/768/1024 px) |
| Early access, batch statistics, health | `/api/*`, MySQL | Implemented, tested (21 DB tests) |
| Security: nonce CSP (scripts and styles), HSTS, content-sniffed uploads, origin checks, rate limits | `middleware.ts`, `lib/csp.ts`, `next.config.mjs` | Implemented, tested |
| Contact page | — | **Blocked** on the owner's support email (B2) |
| Interactive (drag) crop, carousels, free-form template layout, resizing one design to other sizes | — | Not implemented (ROADMAP phase 2/5 follow-ups) |
| Accounts, payments, AI background removal/generation | — | **Not started by owner decision**: needs an auth library (new dependency), Razorpay keys, an SMTP mailbox and a paid AI provider |
| Real devices, Safari/Firefox, screen readers | — | Not verified (no hardware here); emulated Chromium testing and scripted keyboard audit pass |

Evidence: TEST_RESULTS.md (0.6.0 run: 86 unit, 21 DB, 101 e2e passing + 1 phone-only test skipped on desktop).

## Blockers before public launch
| # | Item | Owner action |
|---|---|---|
| B1 | Real-device testing (Android + iPhone, Safari) | Run RELEASE_CHECKLIST manual section |
| B2 | Contact / support channel | Set `NEXT_PUBLIC_SUPPORT_EMAIL` (and WhatsApp if wanted) |
| B3 | Legal review of privacy and terms | A lawyer must review; Claude's self-review is not legal advice (LEGAL_READINESS.md) |
| B4 | Hostinger deploy + DB migration for idoconverter.com | DEPLOYMENT_GUIDE.md; ask Claude to prepare, owner approves the deploy |
| B5 | Verify client IP header on Hostinger | ENVIRONMENT_CONFIGURATION.md check |

## Next recommended work (in order)
1. Owner blockers B1–B5.
2. After deploying: confirm CSP and HSTS headers arrive on Hostinger; watch CPU now that pages render per request (K13).
3. Verify Flipkart/Meesho rules in the logged-in seller panels, then write the two guide pages.
4. Real screen-reader pass (NVDA + VoiceOver).
5. Template follow-ups if sellers use them: carousels, more templates, adapting one design to another size.
6. Phase 3 (accounts + payments) once pricing is decided and Razorpay/SMTP credentials exist; Phase 4 (AI background removal) once a provider and budget are chosen.
