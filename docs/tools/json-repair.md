# Tool spec: JSON Repair

**URL:** `/developers/json-repair` | **Core:** `core/developers/json-repair.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Purpose

Fix broken JSON from AI output or hand edits and show exactly what changed. If a fix would require guessing the structure, refuse and say where and why.

## What it fixes (each fix is listed with its line number)

| Problem | Fix |
|---|---|
| Markdown code fence, chat text before/after | Extracts the JSON |
| Trailing comma, extra comma | Removed |
| Missing comma between values or members | Added |
| Single quotes, curly quotes | Converted to `"` (inner `"` and `\'` handled) |
| Unquoted keys | Quoted |
| `//`, `/* */`, `#` comments | Removed |
| `True`, `False`, `None` | `true`, `false`, `null` |
| `undefined`, `NaN`, `Infinity`, `-Infinity` | `null` |
| `=` instead of `:` | Replaced |
| Raw line break in a string | Escaped |
| Invalid escape (`"C:\Users"`, `"\d+"`) | Backslash kept as a literal character |
| `+1`, `.5`, `3.`, `0x1F` | Normalized |
| Duplicate key | Last value kept, reported |
| Several top-level values (NDJSON) | Wrapped in an array |
| Truncated output | Open strings, arrays and objects closed; a key with no value dropped; `tr`/`fal`/`nu` at the very end completed |

## When it refuses

Double colon, mismatched brackets (`[1, 2}`), bare words as values (`"status": active`), HTML or other non-JSON text, nesting too deep for the browser. The message is `Can't repair: <reason> at line L, column C (near "…")`.

## Output

Pretty-printed JSON. `meta.changes` = `{ line, message }[]`; `meta.alreadyValid` is true when the input parsed as-is (then it is only formatted). The page groups repeated changes on the same line.

## Edge cases

Empty → `Input is empty`. Unicode keys and values work. A 20,000-object broken array (unquoted keys, Python literals, trailing commas) is repaired.

## Samples (fixtures in `tests/fixtures/json-repair/`, one per case)

`trailing-commas`, `single-quotes`, `unquoted-keys`, `comments`, `code-fence`, `python-literals`, `truncated`, `missing-commas`, `curly-quotes`, `string-issues`, `numbers`, `concatenated`, and unrepairable `unrepairable-colon`, `unrepairable-html`, `unrepairable-mismatch`.
