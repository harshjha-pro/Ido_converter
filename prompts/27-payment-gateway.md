Read AGENTS.md and docs/. Only run this if docs/NOTES.md confirms a
payment gateway has been chosen AND the team has real API keys for it
(sandbox/test keys are fine to start). If neither is true, STOP and
tell me what's missing instead of guessing a gateway or using fake keys.

Plan first, wait for my OK.

Integrate the chosen gateway's checkout flow for the confirmed tiers
and prices from docs/PRD.md section 10:
- Never hardcode API keys in committed code — use environment variables
  or a gitignored config file, and tell me exactly where to put the
  real keys.
- On successful payment, update the subscriptions table (from
  schema.sql) via a verified webhook/callback, not by trusting the
  frontend alone (a user's browser saying "payment succeeded" is not
  proof — verify server-side with the gateway).
- Test with sandbox/test transactions only. Do not process a real
  payment during this build.
- Add basic handling for failed/cancelled payments.

This is the highest-risk prompt in the whole project — it touches real
money. When finished, list every security assumption you made and ask
me to double check each one. Update docs/NOTES.md. Stop for my review.
