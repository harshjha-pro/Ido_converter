# Open questions (business rules — need your answer)

"Blocks" = the earliest phase that cannot finish without an answer. Where I give a
proposal, I will build that unless you say otherwise.

## Needed before Phase 1 starts / before the data model freezes

| # | Question | Proposal | Blocks |
|---|---|---|---|
| Q-01 | **Where should this app live?** This session is in the `idoconverter` repository, a different product whose rules forbid unrelated features. | Create a new repository (e.g. `qepex-work-tracker`). The plan docs are parked in `qepex-work-tracker/` on this branch only so they are not lost; they move as-is | Phase 1 |
| Q-02 | **How many compliance types?** Product Spec says 29 including MSME Form 1 and state Professional Tax; Rules Spec's 29 exclude them. For PT: which states (where clients and the firm employ people), and their due rules? For QRMP GSTR-3B: confirm the 22nd/24th state grouping is to be seeded as data | Seed 31 types; PT seeded only for states you name, as "Unverified" | Phase 1 (schema), Phase 2 (seed) |
| Q-03 | **DPT-3**: drop it for LLPs (Companies Act form)? For companies, add a `dpt3_applicable` flag rather than always generating it? | Yes to both | Phase 1 |
| Q-04 | **DIR-3 KYC for a director on several client companies** — one obligation per director (shown under each company) or one per company-director pair? | One per director (DIN), visible from each linked company | Phase 1 |
| Q-05 | **Flag switched off mid-year**: is the cut-over test the period start date (my reading of scenario 7 + the tax-audit edge case), so an In-Progress task for a period starting after the off date still goes to Not Applicable? | Yes, period start date decides; work entries on it are kept | Phase 2 |
| Q-06 | **Staff/Article client visibility**: see a client only through an engagement/task they are assigned to, or every client of their client team? | Assigned only (stricter); team view for Seniors? Tell me if Seniors should see the whole team | Phase 1 |
| Q-07 | **Portal 2FA**: the spec makes OTP mandatory for portal users; the brief makes TOTP optional. Mandatory TOTP for portal users? | Optional per brief, with a firm setting to make it mandatory | Phase 4 |

## Needed during Phase 2

| # | Question | Proposal |
|---|---|---|
| Q-08 | **Income-tax Act, 2025** (from 1 Apr 2026): seed old (1961 Act) names — AY, Form 16, 24Q/26Q, 3CD, s.143(2) — or the new "tax year" names/numbers, or both (new with old in brackets)? | Labels are data; I'd seed both forms of the label until you choose |
| Q-10 | AGM ceiling for provisional dates: 6 months from FY end, and 9 months from first FY end for a company's first AGM — confirm as defaults? | Yes, both as editable rules |
| Q-11 | **Closure tasks for Discontinued clients** (GSTR-10, final TDS return, ROC strike-off STK-2, LLP Form 24): which ones, and their due rules? | Create as `MANUAL` due-date types until rules are given |
| Q-12 | Weekly lock: week = Monday–Saturday, lock Sunday 16:00 IST, working Saturdays all year? | Yes, as settings |
| Q-13 | Notice response default when the notice gives no date: received + N days — what N? Alert schedule 7/3/1 confirmed | N = 15, setting |
| Q-14 | Review level per engagement type (spec gives examples): GST/TDS → Senior or Manager; ITR non-audit → Manager; ITR audit, audit reports, certificates → Partner; ROC → Manager prepares, Partner approves before DSC signing. EQR threshold: by fee, by entity type (listed/public interest), or both? | As listed; EQR threshold = fee ≥ setting OR entity flagged "public interest" |

## Needed during Phase 3

| # | Question | Proposal |
|---|---|---|
| Q-09 | **Payroll**: (a) firm's state(s) for PT; (b) default tax regime; (c) PF on full basic or capped wage; adopted Labour Code wage definition; (d) LWF needed? (e) ICAI/ICSI stipend minimums and CPE hours to seed; (f) is the bank-transfer file a generic Excel or a specific bank's format? | Every value configurable, seeded "Unverified"; generic Excel bank file |
| Q-18 | **Invoices**: firm GSTIN/state, SAC codes per service line, invoice number format (GST allows ≤16 characters, unique per FY), GST rate on fees, whether reimbursements are billed as pure agent (no GST) | Prefix per FY, e.g. `QI/26-27/0001`; reimbursements as pure-agent lines |
| Q-19 | Retention periods per record type (audit files, working papers, payroll, portal uploads) | Seed "TODO verify" with purge disabled until set |
| Q-20 | Leave policy: categories (staff/article/partner), quotas, accrual, carry-forward, encashment; articleship leave entitlement rule | Configurable; seed placeholders marked Unverified |
| Q-21 | Conveyance rate per km / per visit for client-site claims | Setting, default blank (claim amount typed) |
| Q-22 | Cost rate per designation: who sets it and is it monthly cost ÷ standard hours? | Partner/HR set ₹/hour per designation, effective-dated |
| Q-23 | Engagement letter acceptance: is a logged-in portal click enough, or must the client also upload a signed copy for audit appointments? | Click (with timestamp, IP) for all; signed copy optional |

## Needed during Phase 4–5

| # | Question | Proposal |
|---|---|---|
| Q-15 | P4-09 external penetration test is not in the brief's replacement table. OK to treat it as out of scope for this build (you arrange it before go-live)? | Yes; I deliver a security checklist + automated authz tests |
| Q-16 | AI "ask-the-data" (§13.10) has no code-only replacement in the brief. Omit? | Omit; saved filters on dashboards instead |
| Q-17 | Spec lets Articles see billing "if granted"; brief says never. Never? | Never (brief is stricter) |
| Q-24 | Capacity forecast: hours per task type come from past actuals — what standard working hours/day for available capacity? | 8 h × working days, setting (used only in Partner analytics, never shown to staff) |
| Q-25 | Weekly summary audience: every Manager for their team + every Partner for the firm? | Yes |

## Decisions from Product Spec §16.1 that are yours (not answerable by me)

1. Start daily use after Phase 2, or single go-live after Phase 5.
2. Build payroll in-house (this plan) vs integrate — the brief says build; confirmed unless you say otherwise.
3. Hosting budget — not applicable (local).
4. Accounting software — Excel/CSV export column layout: Tally, Zoho, or generic?
5. Who holds the HR / Payroll Admin role (must differ from Practice Admin).
6. Verification of all statutory values (every seeded value ships "Unverified").
7. Change control: new ideas after the Phase 1 freeze go to `docs/backlog.md`.
