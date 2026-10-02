# AGENTS.md: rules for building idoconverter

This file tells the AI assistant **how** to work on this project. The **what** is in `docs/PRD.md`. This file is vendor-neutral — Claude Code reads it via `CLAUDE.md`'s `@AGENTS.md` import; other tools (Antigravity, Cursor, etc.) read it directly.

## Project in one paragraph

idoconverter is a static multi-tool website (plus one browser extension) with small tools for six professions: developers, CAs and accountants, frontend developers, job seekers, exam and form applicants (India), and online sellers. Every tool runs in the visitor's browser. Frontend is Astro with TypeScript. Hosting is Hostinger shared hosting, so there is no server-side processing of tool input.

## Start of every session

1. Read `docs/CONTEXT.md` first for fast orientation, then `docs/PRD.md`, `docs/TECHNICAL_SPEC.md`, `docs/DESIGN.md`, `docs/IMPLEMENTATION_PLAN.md` and `docs/NOTES.md` as relevant to the task.
2. Say which milestone and which tool you are working on.
3. **Plan before coding.** Write the plan in a few lines and wait for approval on anything large.
4. Work on **one tool at a time**. Do not start the next tool until the current one meets the Definition of Done (PRD section 5).

## End of every session

- Update `docs/NOTES.md`: what was done, decisions made, what is next, open questions.
- Update `docs/CONTEXT.md` section 11 ("Current status") if it changed.
- Suggest a commit message. Commit small and often.

## Non-negotiable rules

1. **Privacy.** No tool may send user input, files or results to any server, ours or third-party. No `fetch`, XHR, beacons or analytics calls that include input. Never log input.
2. **Minimal backend.** Tools never use a backend. PHP is allowed only for non-tool pages (the contact form, later a small cron script) and must never receive tool input. No Laravel, database or logins unless the PRD adds them.
3. **No new dependency without asking.** Name it, say why, and note its size and license in `docs/NOTES.md`. Prefer small or no dependencies. Self-host libraries. No third-party CDNs on tool pages.
4. **Do not invent rules.** For tax, GST, TDS, visa specs, courier divisors or fees: use only values listed in `docs/rules-and-sources.md` with a source. If a value is missing, leave a `TODO(needs source)` and ask. Never guess a rate or a rule.
5. **CA, tax, visa and pricing tools** must show a "not professional advice" note, a source and a "last checked" date. They are not published without a filled `reviewedBy` field.
6. **Extensions.** Only build extensions listed in the PRD. One narrow purpose each. No new extension without approval. Request the minimum permissions, never "all sites". No remote code.
7. **Do not add features that are not in the PRD.** Suggest them in `docs/NOTES.md` instead.

## Code conventions

- TypeScript with `strict` on. Small functions with clear names.
- Tool logic lives in `core/<profession>/<tool>.ts` and follows the `run(input, options) => ToolResult` contract in `docs/TECHNICAL_SPEC.md`. It must not touch the DOM, `window`, storage or the network.
- UI lives in `website/` and calls `core/`. The extension calls the same `core/` code. Do not copy logic between them.
- Errors are returned as `{ ok: false, error }` with a clear message. Do not throw to the UI.
- Rules and rates are data (JSON files with `source`, `effectiveFrom`, `lastChecked`, `reviewedBy`), not hard-coded numbers.
- Comments explain **why**, not what.
- UI and visual work follows the design skill (`.claude/skills/idoconverter-design/SKILL.md` for Claude Code; `docs/DESIGN.md` is the full source for any other tool).

## Tests

- Every tool in `core/` has fixtures in `tests/fixtures/<tool>/` and unit tests.
- Cover: normal input, empty input, invalid input, very large input, Unicode and Indian names.
- Masking and scrubbing tools also need a **leak test** with realistic secrets and personal data that must not appear in the output.
- Run the tests before saying a tool is done.
- Where a Chrome DevTools MCP (or equivalent) is available, use it to actually verify the Network tab shows no outbound requests from a tool page, rather than relying only on code review.

## Site rules

- URL pattern: `/<profession>/<tool-name>`, lowercase with hyphens. Do not change a published URL.
- Each tool page uses the standard template: H1, tool, how-to, privacy line, FAQ, related tools (see `docs/TECHNICAL_SPEC.md`).
- Each tool page targets **one search phrase**, recorded in the tool tracker in `docs/NOTES.md`.
- Mobile first. Must work at 360 px width.

## Commands

```
install:  npm install
dev:      npm run dev
build:    npm run build
test:     npm run test
```

## When to stop and ask

- A requirement is unclear or two documents disagree.
- A tax, legal, visa or pricing detail is missing.
- A tool would need a server, a paid API or a new permission.
- You are about to delete or rename files, or change a published URL.
- You are about to add or change an MCP server configuration.

## Style of communication

Keep explanations short and plain. Say what you changed and what to check. If something is uncertain, say so instead of guessing.
