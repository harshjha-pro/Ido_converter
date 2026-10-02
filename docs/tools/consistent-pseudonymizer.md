# Tool spec: Consistent Pseudonymizer

**URL:** `/developers/consistent-pseudonymizer` | **Core:** `core/developers/pseudonymizer.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Purpose

Replace personal values in JSON with realistic fakes. The same real value always gets the same fake within a run, across keys and records, so joins and relationships survive.

## Input and options

| Option | Default | Meaning |
|---|---|---|
| `keysToReplace` | same default key list as the JSON PII masker | Values under these keys are replaced (key matching shared with the masker: case- and separator-insensitive, whole words) |
| `patterns` | all on | Emails, phones (Indian and NANP), JWTs, Aadhaar, PAN detected inside any string |
| `seed` | `''` | Same seed + same input → same output. **The page sends a random seed per run when the field is empty**, so fakes cannot be recomputed from guessed values |
| `includeMapping` | off | Return `meta.mapping` (`kind`, `original`, `fake`). The page only offers it as a local download when the user ticks the box |

## Fake formats

| Kind | Fake |
|---|---|
| Email | `user.<6 chars>@example.com` (reserved domain); case-insensitive identity |
| Phone / Aadhaar | Same length and separators; keeps `+CC`; Indian mobiles keep a 6–9 first digit |
| PAN | `AAAAA9999A` shape |
| JWT | `eyJ…` three-part string |
| Name | First name, or first + last if the original had several words (Indian and international lists). Middle initial, then a number, are added only when needed for uniqueness |
| Secret keys (password, token, secret, authorization, apikey) | `secret_<12 chars>` |
| Integers under a sensitive key | Integer with the same digit count (stays a number) |
| Other strings under a sensitive key | `value_<8 chars>` |

## Rules

1. Two different originals never share a fake (collision check; a counter suffix is the last resort).
2. Booleans and `null` are never changed. Numbers outside sensitive keys stay unless they match a pattern.
3. The mapping is never stored or sent; it exists only in the page until the tab closes, and only if requested.

## Edge cases

Empty → `Input is empty`. Invalid JSON → `Invalid JSON: …`. 5,000 records with unique names/emails stay unique. Unicode and Indian-script names are replaced; non-sensitive Unicode text is kept.

## Samples (fixtures in `tests/fixtures/pseudonymizer/`)

1. `normal.json`: the same customer in two orders (one email in capitals) and in a support ticket's free text → identical fakes everywhere; ids, totals, booleans, `null` kept.
2. `leak.json`: names, emails, numeric mobile, Aadhaar, PAN, password, API key and a JWT in free text → none survive.
3. `{ "mobile": 9123456780 }` with seed → a different 10-digit number, still a number.
