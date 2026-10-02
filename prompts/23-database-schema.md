Read AGENTS.md and docs/, including the now-confirmed answers from
Prompt 22. Design the database schema only — no application code yet.

Plan first, wait for my OK. In the plan, confirm you're using MySQL
(matches Hostinger shared hosting, per docs/TECHNICAL_SPEC.md section
2a) unless I've told you otherwise.

Design tables for: users (id, email, hashed password — never plaintext,
created_at), subscriptions (user_id, tier, status, started_at,
renewed_at, payment_reference), tool_history (id, user_id, tool_name,
saved_at, and the actual saved data/result — note in a comment that
this is the first point where user data is stored server-side, breaking
the free-tool "nothing leaves your browser" promise, by design and only
for paid users who opted in), and an admin flag or role field on users.

Write this as a single schema.sql file with comments explaining each
table and foreign key. Do not write PHP yet.

Update docs/TECHNICAL_SPEC.md section 13 with the finalized schema
reference and docs/NOTES.md with what was decided. Stop for my review.
