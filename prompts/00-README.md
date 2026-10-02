# Prompt folder: how to use this

Run these ONE AT A TIME, in order, in Claude Code (or Antigravity). Review
each result before sending the next file's prompt — that's where a wrong
turn is cheapest to catch, and it's why these are separate files instead of
one giant prompt.

- `01`–`10`: Milestone 1–3 — skeleton, design system, the 9 real Phase 1
  tools (developers + 3 calculators). Some of this may already be built —
  check docs/NOTES.md section 1 ("Current status") before starting.
- `11`–`12`: the browser extension.
- `13`–`17`: Milestone 5 — remaining Phase 1 tools and profession pages.
- `18`–`21`: Milestone 6 — launch prep (legal, SEO, testing, build/deploy).
- `22`–`28`: **Phase 4 — database, backend, admin panel, user panel.**
  NOT started. Several business decisions are still open (see
  docs/NOTES.md open questions 4–8, 11, 12 — pricing numbers, payment
  gateway, data retention, "motion" scope). Each Phase 4 prompt has its own
  gate at the top telling the AI to stop and ask if that prompt's
  prerequisite isn't answered yet. Don't skip those gates.

Every prompt already tells the AI to read AGENTS.md and docs/ first, so
you don't need to paste any extra context — just paste the prompt file's
contents as your message.
