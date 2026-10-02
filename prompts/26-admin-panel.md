Read AGENTS.md and docs/. Build the admin panel only, after Prompts 24
and 25 are working and reviewed.

Plan first, wait for my OK.

Build a login-protected admin view (gated by the admin/role field from
the schema, not just "any logged in user"): list of users with their
tier and signup date, basic usage counts (which tools are used most —
aggregate counts only, never raw tool_history content unless strictly
needed for support, and if so, log that access), and a way to manually
adjust or cancel a subscription (for support/refund cases).

Security check before finishing: confirm a non-admin user cannot reach
any admin route by guessing the URL — test this yourself and report
the result, don't just assume the check works.

Update docs/NOTES.md. Stop for my review.
