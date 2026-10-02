Read AGENTS.md and docs/ again. Milestone 3, task 3.2: JSON to
TypeScript and Zod, nothing else.

Plan first, wait for my OK.

Build per docs/PRD.md section 6: paste JSON, output a TypeScript
interface AND a Zod schema. If an array's items have inconsistent keys,
mark missing keys optional rather than failing. Handle nested objects,
arrays of objects, empty arrays, mixed types across array items. Logic
in core/developers/json-to-ts-zod.ts.

Tests: fixtures covering nested objects, optional fields, empty arrays,
mixed types in an array. Run npx vitest run, paste output.

Connect to its tool page, add to listing. Check PRD section 5, update
docs/NOTES.md, stop.
