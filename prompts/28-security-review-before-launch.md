Read AGENTS.md and docs/. This is the final gate before Phase 4 goes
live with real users and real payments. Do not skip this even if
everything "seems to work."

Go through this checklist and report pass/fail honestly for each,
fixing what you can without a new dependency (ask first if one's
needed):

[ ] All SQL uses prepared statements, no string concatenation anywhere
[ ] Passwords are hashed with password_hash(), never stored plain
[ ] Sessions use httponly, secure, samesite cookies
[ ] Admin routes are unreachable by non-admin users (re-test this)
[ ] Payment confirmation is verified server-side via the gateway, not
    trusted from the frontend
[ ] API keys and DB credentials are not committed to the repo (check
    git history too, not just current files)
[ ] A user can fully delete their own account and data
[ ] The free static tools still work with zero dependency on this
    backend — confirm by testing a tool with the backend turned off
[ ] HTTPS is enforced on every page that touches login or payment
[ ] Error messages shown to users don't leak stack traces or internals

Report the full results as a table. For anything that fails, explain
the real-world risk in plain language, not just "this is insecure."

I will also get this reviewed by someone with real security experience
before taking real payments — this checklist is a first pass, not a
substitute for that.

Update docs/NOTES.md with the results. Stop.
