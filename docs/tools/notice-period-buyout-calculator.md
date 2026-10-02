# Tool spec: Notice Period Buyout Calculator

**URL:** `/jobseekers/notice-period-buyout-calculator` | **Core:** `core/jobseekers/notice-period-buyout.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Formula (ASSUMPTION: employer practice varies)

```
daily rate     = monthly salary ÷ day basis
remaining days = max(0, notice days − days served)
buyout         = daily rate × remaining days   (rounded to paise)
```

- **Monthly salary**: whatever figure the employer uses for recovery (often basic, sometimes gross or CTC ÷ 12). The page tells the user to check their offer letter.
- **Day basis**: default 30, editable (26 working days and calendar days are common alternatives). Must be 1–31.
- Leave adjustment, deductions and taxes are **not** included. The page says the result is an estimate.

This is not a CA/tax tool and contains no statutory rate, so `rules-and-sources.md` is not involved. The formula is shown on the page.

## Inputs and validation

| Field | Rule | Error |
|---|---|---|
| Monthly salary | number ≥ 0 | `Monthly salary must be 0 or more` / `must be a number` |
| Notice days | number > 0 | `Notice period must be more than 0` |
| Days served | number ≥ 0 | `Days served must be 0 or more` |
| Day basis | 0 < n ≤ 31 | `Day basis must be more than 0` / `should be the number of days in a month` |

`run(input)` takes a JSON object with these fields (ToolResult contract); the page calls `calculate()` directly.

## Samples (fixture `tests/fixtures/notice-period-buyout/cases.json`)

| Case | Salary | Notice | Served | Basis | Buyout |
|---|---|---|---|---|---|
| Normal | 60,000 | 90 | 30 | 30 | ₹1,20,000 |
| Zero served | 45,000 | 60 | 0 | 30 | ₹90,000 |
| Full notice served | 80,000 | 30 | 30 | 30 | ₹0 |
| Served more than notice | 80,000 | 30 | 45 | 30 | ₹0 |
| 26-day basis | 52,000 | 30 | 10 | 26 | ₹40,000 |
| Paise rounding | 33,333 | 45 | 7 | 30 | ₹42,221.80 |
