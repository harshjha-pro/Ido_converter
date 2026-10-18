-- ROLLBACK for 0001_initial_schema.sql — DESTRUCTIVE.
-- Deletes every early-access lead and batch statistic. Never run against production without:
--   1. explicit approval from the owner, and
--   2. a fresh backup (phpMyAdmin → Export, or mysqldump), verified to open.
-- Not run automatically by any script.
DROP TABLE IF EXISTS rate_limits;
DROP TABLE IF EXISTS batch_events;
DROP TABLE IF EXISTS early_access_leads;
DELETE FROM schema_migrations WHERE version = '0001_initial_schema';
