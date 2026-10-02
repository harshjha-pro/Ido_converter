# CLAUDE.md

This project's rules live in AGENTS.md (vendor-neutral, also read by other
coding agents). This file just imports it so Claude Code picks it up
automatically, plus a short always-loaded project summary.

@AGENTS.md
@docs/CONTEXT.md

## Claude Code specifics for this project

- Use Plan Mode (Shift+Tab to cycle modes, or /plan) for every prompt that
  says "write a plan and wait for my OK" in its instructions. This is the
  native equivalent of that instruction — use it instead of just hoping the
  text prompt is followed.
- The fuller docs (docs/PRD.md, docs/TECHNICAL_SPEC.md, docs/DESIGN.md,
  docs/IMPLEMENTATION_PLAN.md, docs/NOTES.md) are NOT auto-imported here on
  purpose, to keep every session's starting context small. Read them with
  the Read tool when the task needs them, as AGENTS.md's "Start of every
  session" section already instructs.
- A project skill exists at .claude/skills/idoconverter-design/SKILL.md.
  Claude Code should discover and apply it automatically for any UI or
  styling work — it does not need to be manually read like the docs above.
- Chrome DevTools MCP is configured for this project (see setup notes in
  docs/NOTES.md). Use it to verify the "no tool sends user input anywhere"
  rule by checking actual network requests, not by inspecting code only —
  and to test pages at 360px and run performance checks.
