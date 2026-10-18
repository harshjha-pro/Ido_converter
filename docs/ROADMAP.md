# Roadmap

Each phase starts only when the previous phase's exit criteria are met. Dates are deliberately absent: phases are gated on evidence, not the calendar.

| Phase | Contents | Dependencies | Exit criteria |
|---|---|---|---|
| **0. Launch for validation** (now) | Current MVP on Hostinger; WhatsApp service; outreach | Owner: domain, WhatsApp number, legal review, real-device test | Deployed; health green; first 15–20 interviews |
| **1. Validation (14 days)** | Interviews, done-for-you orders, pre-payments | Phase 0 | See VALIDATION_PLAN.md thresholds (e.g. ≥ 3 paid, ≥ 6 batches with own photos) |
| **2. Repeat-use features** | ~~Local saved workflows~~ and ~~multi-marketplace export~~ (built in 0.6.0, ahead of validation at the owner's request); interactive crop still open | Phase 1 "proceed" | Repeat batches per week rise |
| **3. Accounts + payments** | Auth library, Razorpay subscriptions with GST invoices, cloud-saved workflows | Phase 2 + pricing evidence | First paying subscribers |
| **4. Background removal (AI)** | Provider proxy, credit ledger, consent per upload | Phase 3 (needs accounts for credits) | Cost per removal < 1/3 of price; "not white" failure rate falls |
| **5. Templates (narrow)** | First version built in 0.6.0 (8 templates, constrained editor). Next: carousels, more templates, one design → other sizes, cloud-saved designs (needs phase 3) | Phase 3 | Template usage among paying users |

Not planned: AI watermark removal (rights and abuse risk), scheduling and publishing, a general Canva-style editor, video.

## AI integration requirements (Phase 4, for later)
- **Provider:** chosen on per-image cost, quality on Indian product types, data retention terms, and an India-friendly API. Use a provider-adapter interface so it can be swapped.
- **Disclosure:** images leave the device only after explicit, per-session consent naming the provider.
- **Server-side keys:** quotas enforced against a credit ledger with an idempotency key; refund on failure.
- **Timeouts and fallback:** 30 s timeout, one retry for 5xx only, a global daily spend cap with a kill switch, and a clear fallback message.
