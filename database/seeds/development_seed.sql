-- development_seed.sql — FAKE data for local development only.
-- Contacts use reserved test domains/number ranges. Never run on production.
-- scripts/db-seed.mjs refuses to run unless the database name ends in _dev or _test.
INSERT INTO early_access_leads
  (contact_type, contact_value, role, sells_amazon, sells_flipkart, sells_meesho, sells_other, monthly_photos, note, source, consent_version, consent_at, created_at, updated_at)
VALUES
  ('email', 'seller.one@example.com', 'seller', 1, 1, 0, 0, '50_200', 'Kurtas, mostly phone photos', 'home', '2026-10-18', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('phone', '+919000000001', 'cataloguer', 1, 1, 1, 0, 'over_1000', NULL, 'tool', '2026-10-18', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3)),
  ('email', 'agency@example.org', 'agency', 0, 0, 1, 1, '200_1000', NULL, 'guide', '2026-10-18', UTC_TIMESTAMP(3), UTC_TIMESTAMP(3), UTC_TIMESTAMP(3))
ON DUPLICATE KEY UPDATE updated_at = UTC_TIMESTAMP(3);

INSERT INTO batch_events
  (created_at, preset_key, photo_count, processed_count, pass_count, check_count, fail_count, duration_ms, output_size, device_class, used_worker, cancelled, used_samples)
VALUES
  (UTC_TIMESTAMP(3), 'amazon',   40, 40, 31, 6, 3, 21000, 1600, 'desktop', 1, 0, 0),
  (UTC_TIMESTAMP(3), 'meesho',   12, 12,  9, 2, 1,  9800, 1200, 'mobile',  1, 0, 0),
  (UTC_TIMESTAMP(3), 'flipkart',  4,  4,  1, 2, 1,  1300, 1500, 'desktop', 1, 0, 1),
  (UTC_TIMESTAMP(3), 'amazon',  100, 37, 30, 5, 2, 30000, 1600, 'tablet',  1, 1, 0);
