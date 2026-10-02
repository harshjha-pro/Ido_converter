# Tool spec: GST Calculator (inclusive and exclusive)

**URL:** `/ca/gst-calculator` | **Core:** `core/ca/gst-calculator.ts` + `core/ca/gst-rates.json` | **Phase:** 2
**Search phrase:** GST calculator new rates 2025 inclusive exclusive
**Publishing:** unlisted until a CA fills `reviewedBy` in `core/ca/review.json` (and in `gst-rates.json`).

## Rates (data, AGENTS.md rule 4)

From 22 September 2025 (GST Council, 56th meeting; PIB and GST Council press releases): Nil, 5% (merit), 18% (standard), 40% (de-merit), special 3% (gold, silver, jewellery), 1.5% (cut and polished diamonds), 0.25% (rough diamonds). Tobacco items moved on a separate notified date. A **custom rate** field is offered because the correct rate depends on HSN/SAC classification, which the tool does not decide.

## Formulas

- Exclusive: GST = amount × rate ÷ 100; total = amount + GST.
- Inclusive: taxable value = amount × 100 ÷ (100 + rate); GST = amount − taxable value.
- Intra-state: CGST = SGST/UTGST = GST ÷ 2, odd paisa to CGST so the halves always add up. Inter-state: IGST = GST.
- All values rounded to paise. Cess is not included.

## Validation

Amount ≥ 0; rate 0–100; mode exclusive/inclusive; supply intra/inter.

## Samples (`tests/fixtures/gst-calculator/cases.json`)

₹1,000 + 18% intra → ₹90 + ₹90 = ₹1,180 · ₹1,180 incl. 18% inter → ₹1,000 + ₹180 IGST · ₹101 + 3% → ₹3.03 split ₹1.52/₹1.51 · ₹1,400 incl. 40% → ₹1,000 + ₹400 · ₹1,00,250 incl. 0.25% → ₹1,00,000 + ₹250 · Nil rate. A sweep test checks CGST + SGST = GST and taxable + GST = total for every rate.
