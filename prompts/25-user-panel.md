Read AGENTS.md and docs/. Build the user panel (dashboard) only, after
auth from Prompt 24 is working and reviewed.

Plan first, wait for my OK.

Build: a login-protected dashboard page showing the user's current
tier, their saved tool_history entries (per the confirmed storage
promise and retention period from docs/NOTES.md), and a way to delete
their own saved history and their account (per the data retention open
question being answered in Prompt 22).

Reuse the existing design tokens for styling. Keep this panel visually
separate from the free tool pages so it's clear to users when they're
in an account area vs. a free, no-account tool.

Confirm: can a user fully delete their own data from here, not just
hide it? That's required before this goes live with real users.

Update docs/NOTES.md. Stop for my review.
