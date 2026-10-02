Read AGENTS.md and docs/, including schema.sql from Prompt 23.

Plan first, wait for my OK.

Build the authentication backend in PHP (per AGENTS.md — this is the
first PHP beyond the contact form, now justified by Phase 4):
- Registration: validate email, hash passwords with password_hash()
  (never roll your own hashing), store in the users table via prepared
  statements only (never string-concatenated SQL — flag if you're
  tempted to and ask instead).
- Login: verify with password_verify(), start a secure session
  (httponly, secure, samesite cookies).
- Logout: destroy the session properly.
- Basic rate limiting or at least a note on where it's needed, to avoid
  brute-force login attempts.
- Keep this entirely separate from the static tool site — a bug here
  must never be able to break the free tools (per docs/TECHNICAL_SPEC.md
  section 13).

Do NOT build the dashboard, admin panel, or payment flow yet — only
register/login/logout.

When finished: list every place user input reaches SQL and confirm it's
parameterized, not concatenated. Update docs/NOTES.md. Stop for my
review — this code touches real credentials, review it carefully
yourself too before trusting it.
