# Tool spec: JSON to TypeScript and Zod

**URL:** `/developers/json-to-typescript-zod` | **Core:** `core/developers/json-to-ts-zod.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Purpose

Paste JSON, get TypeScript interfaces and a matching Zod schema. No dependency is added to the site; the Zod code is generated as text and imports `z` from `"zod"` in the user's own project.

## Input and options

JSON text (object, array or primitive). `rootName` (default `Root`, converted to PascalCase).

## Rules

1. **Array items merge into one type.** Objects merge field by field; a key missing from any item becomes optional (`?:` / `.optional()`).
2. **Mixed types** become a union (`string | number`, `z.union([...])`). `null` makes a type nullable (`string | null`, `.nullable()`); `null` alone stays `null`.
3. **Empty arrays** become `unknown[]` / `z.array(z.unknown())`, unless another item gives the type (`[[], [1]]` → `number[][]`).
4. **Names**: nested objects take the PascalCase key (`address` → `Address`); array items take the singular (`orders` → `Order`, `categories` → `Category`, `status` → `StatusItem`). Clashes get `2`, `3`. A top-level array becomes `type Root = RootItem[]`.
5. Keys that are not valid identifiers are quoted (`"first-name"`, Unicode keys).
6. TypeScript lists the root first. Zod declares children before parents (required at runtime) and exports `z.infer` types.

## Edge cases

Empty → `Input is empty`. Invalid → `Invalid JSON: …`. Top-level primitives, `{}` (empty interface), Unicode keys and a 5,000-item array work.

## Verification

Tests compile the generated TypeScript with the TypeScript compiler and check the original JSON is assignable to `Root`. The generated Zod was also run once against real Zod 3 (installed outside the project): the samples validate and wrong inputs are rejected.

## Samples (fixtures in `tests/fixtures/json-to-ts-zod/`)

`nested.json` (nested objects, arrays of objects with optional and nullable keys, empty array, empty object, quoted key), `mixed-array.json` (top-level array, union with null, optional mixed array).
