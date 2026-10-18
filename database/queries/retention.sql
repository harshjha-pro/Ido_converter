-- retention.sql — applies docs/DATA_RETENTION.md. Deletes data: review counts first, back up, then run.
-- Run monthly (paste into phpMyAdmin, or schedule with hPanel Cron Jobs if your plan allows the mysql client).

-- 1. Preview what would be removed
SELECT 'leads older than 12 months' AS what, COUNT(*) AS rows_affected
  FROM early_access_leads WHERE updated_at < UTC_TIMESTAMP(3) - INTERVAL 12 MONTH
UNION ALL
SELECT 'batch events older than 24 months', COUNT(*)
  FROM batch_events WHERE created_at < UTC_TIMESTAMP(3) - INTERVAL 24 MONTH
UNION ALL
SELECT 'rate-limit windows older than 1 day', COUNT(*)
  FROM rate_limits WHERE window_start < UTC_TIMESTAMP() - INTERVAL 1 DAY;

-- 2. Delete (uncomment after reviewing step 1)
-- DELETE FROM early_access_leads WHERE updated_at < UTC_TIMESTAMP(3) - INTERVAL 12 MONTH;
-- DELETE FROM batch_events WHERE created_at < UTC_TIMESTAMP(3) - INTERVAL 24 MONTH;
-- DELETE FROM rate_limits WHERE window_start < UTC_TIMESTAMP() - INTERVAL 1 DAY;
