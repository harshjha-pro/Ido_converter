-- schema_checks.sql — read-only. Every row should show status = 'ok'.
-- Run after each migration: npm run db:verify (or paste into phpMyAdmin).
SELECT 'server version' AS check_name, VERSION() AS detail,
       IF(VERSION() LIKE '%MariaDB%',
          IF(CAST(SUBSTRING_INDEX(VERSION(), '.', 1) AS UNSIGNED) * 100 + CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(VERSION(), '.', 2), '.', -1) AS UNSIGNED) >= 1006, 'ok', 'FAIL: need MariaDB 10.6+'),
          IF(CAST(SUBSTRING_INDEX(VERSION(), '.', 1) AS UNSIGNED) >= 8, 'ok', 'FAIL: need MySQL 8.0.16+')) AS status
UNION ALL
SELECT CONCAT('table ', t.name), COALESCE(i.ENGINE, 'missing'),
       IF(i.ENGINE = 'InnoDB' AND i.TABLE_COLLATION LIKE 'utf8mb4%', 'ok', 'FAIL')
FROM (SELECT 'early_access_leads' AS name UNION ALL SELECT 'batch_events' UNION ALL SELECT 'rate_limits' UNION ALL SELECT 'schema_migrations') t
LEFT JOIN information_schema.TABLES i ON i.TABLE_SCHEMA = DATABASE() AND i.TABLE_NAME = t.name
UNION ALL
SELECT CONCAT('index ', x.tbl, '.', x.idx), IF(COUNT(s.INDEX_NAME) > 0, 'present', 'missing'), IF(COUNT(s.INDEX_NAME) > 0, 'ok', 'FAIL')
FROM (SELECT 'early_access_leads' AS tbl, 'uq_leads_contact' AS idx UNION ALL SELECT 'early_access_leads', 'ix_leads_created'
      UNION ALL SELECT 'batch_events', 'ix_batch_created' UNION ALL SELECT 'batch_events', 'ix_batch_preset_created'
      UNION ALL SELECT 'rate_limits', 'PRIMARY' UNION ALL SELECT 'rate_limits', 'ix_rate_window') x
LEFT JOIN information_schema.STATISTICS s ON s.TABLE_SCHEMA = DATABASE() AND s.TABLE_NAME = x.tbl AND s.INDEX_NAME = x.idx
GROUP BY x.tbl, x.idx
UNION ALL
SELECT 'check constraints', CAST(COUNT(*) AS CHAR), IF(COUNT(*) >= 12, 'ok', 'FAIL: expected 12')
FROM information_schema.TABLE_CONSTRAINTS
WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_TYPE = 'CHECK'
  AND TABLE_NAME IN ('early_access_leads', 'batch_events', 'rate_limits')
UNION ALL
SELECT 'migration 0001 recorded', CAST(COALESCE(MAX(applied_at), 'not recorded') AS CHAR), IF(COUNT(*) = 1, 'ok', 'FAIL')
FROM schema_migrations WHERE version = '0001_initial_schema';
