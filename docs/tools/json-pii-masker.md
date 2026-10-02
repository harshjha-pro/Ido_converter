# Tool spec: JSON PII Masker

**URL:** `/developers/json-pii-masker` | **Core:** `core/developers/json-pii-masker.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4) after checking Google*

## Purpose

Paste JSON, mask personal and secret values by key name and by pattern, and get valid JSON back with the same structure. Everything runs in the browser.

## Input

- JSON text (any valid JSON: object, array or a single value).
- Options:

| Option | Default | Meaning |
|---|---|---|
| `keysToMask` | `email, phone, mobile, name, password, token, secret, authorization, apikey, aadhaar, pan` | Values under these keys are always masked |
| `maskEmail` | on | Email addresses anywhere in string values |
| `maskPhone` | on | Indian mobiles (`+91 98765 43210`, `098765-43210`, `9876543210`) and NANP-style numbers (`+1-800-555-0199`) |
| `maskJWT` | on | Strings shaped like `eyJ….….…` |
| `maskAadhaar` | on | 12 digits, optionally grouped 4-4-4 with spaces or hyphens |
| `maskPAN` | on | 5 letters, 4 digits, 1 letter, any case |
| `maskStyle` | `placeholder` | `placeholder` → `[REDACTED]`; `full` → `*` for every character (at least 3); `partial` → keep first and last character (emails keep the domain) |

## Output

- Pretty-printed JSON (2-space indent) with the same keys, nesting and array lengths.
- `meta.replacementCount`: the number of values or pattern matches masked.

## Rules

1. **Key matching** ignores case and separators and matches by whole words. `accessToken`, `user-password`, `API_KEY` and `Contact.Phone` match `token`, `password`, `apikey` and `phone`. `company` does not match `pan`, and `filename` does not match `name`.
2. Keys that *contain* a sensitive word are masked: `file_name` and `display_name` match `name`. This over-masks on purpose, because leaking is worse than masking too much.
3. **Everything under a matched key is masked**, including nested objects and arrays. `null` stays `null`.
4. Outside matched keys, string values are scanned with the enabled patterns. Only the matched part is replaced.
5. Numbers outside matched keys stay numbers unless they match a pattern (for example a phone or Aadhaar number stored as a number). Those become masked strings.
6. Booleans are masked only under a matched key.

## Edge cases

| Case | Behavior |
|---|---|
| Empty or whitespace-only input | `ok: false`, `Input is empty` |
| Invalid JSON | `ok: false`, `Invalid JSON: <parser message>` |
| Top-level string, `null`, `[]` | Handled; output is valid JSON |
| Over 5 MB of text | Processed; the page shows a "may be slow" note |
| Unicode / Indian scripts | Masked like any other text (`"राहुल शर्मा"` under `name` → `[REDACTED]`) |

## Known limits (shown on the page as "review the output before sharing")

- Pattern detection can miss secrets or over-mask (for example a 10-digit order ID that starts with 6–9 looks like a mobile number).
- API keys and Bearer tokens in free text are not detected unless they sit under a sensitive key. That is the job of the Log and secret scrubber (Milestone 2).
- Names in free text are not detected; only names under a matched key are masked.

## Samples

Each sample is a fixture in `tests/fixtures/json-pii-masker/samples/` (`*.input.json`, `*.expected.json`, optional `*.options.json`) and runs in the unit tests.

| # | Fixture | Shows |
|---|---|---|
| 1 | `01-nested-indian-user` | Mixed-case key (`Name`), nested object, Indian mobile inside free text |
| 2 | `02-array-with-nulls` | Array of users, `null` value under a matched key stays `null`, booleans untouched |
| 3 | `03-key-variants-and-nesting` | `accessToken` variant, whole object under `Authorization` masked, plain number kept |
| 4 | `04-partial-style` | Partial style: email keeps domain, lowercase PAN and Aadhaar in free text |
| 5 | `05-full-style-numbers` | Full style, phone stored as a number masked, other number kept |

Sample 1, input:

```json
{"user":{"Name":"Asha Verma","email":"asha@example.in","profile":{"bio":"Call +91 98765 43210"}}}
```

Output (default options), `replacementCount: 3`:

```json
{"user":{"Name":"[REDACTED]","email":"[REDACTED]","profile":{"bio":"Call [REDACTED]"}}}
```

Invalid input `{ name: "x", }` → `Invalid JSON: Expected property name or '}' in JSON at position 2 (line 1 column 3)`.
