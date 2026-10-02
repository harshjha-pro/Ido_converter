# Tool spec: Return-Loss Calculator

**URL:** `/sellers/return-loss-calculator` | **Core:** `core/sellers/return-loss.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*
**Formula status:** confirmed by the team on 2026-10-02.

## Inputs (per order; percentages 0–100)

Selling price (P, > 0), product cost (C), shipping cost (S), marketplace fee (F), return shipping (Sr), restock/repack cost (R), non-refundable fees on return (N), resellable share of returns (k %), return rate (r %).

## Formulas

```
profit per kept order    = P − C − S − F
loss per returned order  = S + Sr + R + N + C × (1 − k)
expected profit / order  = (1 − r) × kept − r × loss
profit per 100 orders    = expected × 100
margin without returns   = kept ÷ P
margin after returns     = expected ÷ ((1 − r) × P)        (n/a when r = 100%)
break-even return rate   = kept ÷ (kept + loss)            (0 when kept ≤ 0: loses money even with no returns)
```

All money results rounded to 2 decimals; ratios to 4. No marketplace fee or refund rule is built in; every number is entered by the user, so `rules-and-sources.md` is not involved. The page says it is an estimate, not financial advice.

## Samples (fixture `tests/fixtures/return-loss/cases.json`)

| Case | Kept profit | Loss/return | Expected/order | Margin after | Break-even |
|---|---|---|---|---|---|
| ₹1000 item, 15% returns, 80% resellable | ₹390 | ₹260 | ₹292.50 | 34.41% | 60% |
| Zero returns | ₹200 | ₹110 | ₹200 | 40% | — |
| 100% returns | ₹200 | ₹230 | −₹230 | n/a | — |
| Nothing resellable, 10% returns | ₹380 | ₹380 | ₹304 | — | 50% |
| Loss-making without returns | −₹50 | — | — | — | 0 (none) |
