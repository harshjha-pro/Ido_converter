# Tool spec: Volumetric Weight Calculator

**URL:** `/sellers/volumetric-weight-calculator` | **Core:** `core/sellers/volumetric-weight.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Formula

```
volumetric weight = (length × width × height) ÷ divisor   (rounded to 3 decimals)
```

- **Divisor:** entered by the user, labelled "check your courier's divisor". **No default**: divisors differ by courier and service, and AGENTS.md rule 4 forbids unsourced values. `docs/rules-and-sources.md` has a `TODO(needs source)` row; a default can be added only with a courier rate-card source.
- **Units:** cm → weights in kg; inches → weights in lb (how courier divisors are normally quoted). Labels on the page switch with the unit.
- **Actual weight** (optional) is compared; the page names the higher one and says the higher is *usually* charged, varying by courier. No rounding-up rules or surcharges are applied.

## Validation

Dimensions and divisor must be numbers > 0; actual weight ≥ 0 or empty; unit `cm` or `in`. Missing divisor → `Enter your courier's divisor (check their rate card)`.

## Samples (fixture `tests/fixtures/volumetric-weight/cases.json`)

| Box | Unit | Divisor | Actual | Volumetric | Higher |
|---|---|---|---|---|---|
| 40 × 30 × 20 | cm | 5000 | 2 kg | 4.8 kg | volumetric |
| 20 × 15 × 10 | cm | 4000 | 3.2 kg | 0.75 kg | actual |
| 16 × 12 × 8 | in | 139 | — | 11.05 lb | — |
| 10 × 10 × 10 | cm | 1000 | 1 kg | 1 kg | equal |
| 32.5 × 22.2 × 11.4 | cm | 5000 | — | 1.645 kg | — |

(Divisors in the samples are test inputs only, not recommended defaults.)
