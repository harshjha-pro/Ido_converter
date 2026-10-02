# Tool spec: GST Late Fee and Interest Calculator (GSTR-3B)

**URL:** `/ca/gst-late-fee-interest-calculator` | **Core:** `core/ca/gst-late-fee.ts` + `core/ca/gst-late-fee-rules.json` | **Phase:** 2
**Search phrase:** GSTR-3B late fee and interest calculator
**Publishing:** unlisted until a CA fills `reviewedBy` in `core/ca/review.json` and the rules file.

## Rules (data, with sources)

| Rule | Value | Source |
|---|---|---|
| Late fee per day per Act | ₹25 with liability, ₹10 nil (CGST and SGST/UTGST each) | GST portal GSTR-3B FAQ |
| Late fee cap per Act per return (tax periods from June 2021) | Nil ₹250; AATO ≤ ₹1.5 cr ₹1,000; ₹1.5–5 cr ₹2,500; > ₹5 cr ₹5,000 | Notification 19/2021-CT dated 01.06.2021; PIB 43rd GST Council |
| Interest | 18% a year, days/365, on tax paid in cash for the current period (Section 50(1) proviso) | CGST Act s.50; GST portal advisory |
| Cash ledger benefit | From the January 2026 tax period, interest base reduced by the lowest electronic cash ledger balance from due date to payment | GST portal advisory on interest enhancements |

Tax periods before June 2021 are refused (different rules, not recorded).

## Inputs

Tax period (YYYY-MM), due date, filing/payment date, nil return, AATO band, tax paid in cash, optional minimum cash ledger balance. The **due date is entered by the user**: due dates differ for monthly and QRMP filers and by state, and are often extended by notification.

## Calculation

days late = filing date − due date (0 if on time). Late fee per Act = min(days × per-day, cap); total = 2 × per Act. Interest = max(0, cash − min ECL balance [Jan 2026+]) × 18% × days ÷ 365, rounded to paise. Each step is explained on the page.

## Not covered

IGST-only nuance, GSTR-1/GSTR-9 late fees, interest on earlier periods' tax paid now (gross liability), interest on wrongly availed ITC, waivers/amnesty notifications.

## Samples (`tests/fixtures/gst-late-fee/cases.json`)

10 days late (₹500 fee, ₹493.15 interest on ₹1,00,000) · 100 days (cap ₹1,000/Act) · nil return capped at ₹250/Act · 1.5–5 cr and > 5 cr caps · on time · Jan 2026 period with ₹40,000 minimum ECL (₹295.89) · Dec 2025 period where ECL does not apply.
