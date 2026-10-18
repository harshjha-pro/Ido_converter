-- 0001_initial_schema.sql
-- Engine: MySQL 8.0.16+ or MariaDB 10.6+ (InnoDB, utf8mb4). Syntax kept to the subset both support.
-- Creates: early_access_leads, batch_events, rate_limits.
-- Safe to review in phpMyAdmin; applied by scripts/db-migrate.mjs, which records it in schema_migrations.
-- Note: MySQL/MariaDB DDL commits implicitly, so this file is not transactional. Each CREATE is
-- IF NOT EXISTS so a partly applied run can be re-run safely.

-- People who asked for early access. Personal data: see docs/DATA_RETENTION.md.
CREATE TABLE IF NOT EXISTS early_access_leads (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  contact_type    ENUM('email','phone') NOT NULL,
  contact_value   VARCHAR(254) NOT NULL,
  role            ENUM('seller','cataloguer','agency','other') NOT NULL,
  sells_amazon    TINYINT(1) NOT NULL DEFAULT 0,
  sells_flipkart  TINYINT(1) NOT NULL DEFAULT 0,
  sells_meesho    TINYINT(1) NOT NULL DEFAULT 0,
  sells_other     TINYINT(1) NOT NULL DEFAULT 0,
  monthly_photos  ENUM('under_50','50_200','200_1000','over_1000') NOT NULL,
  note            VARCHAR(500) NULL,
  source          ENUM('home','tool','guide') NOT NULL,
  consent_version VARCHAR(16) NOT NULL,
  consent_at      DATETIME(3) NOT NULL,
  submissions     SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_leads_contact (contact_type, contact_value),
  KEY ix_leads_created (created_at),
  CONSTRAINT ck_leads_contact_len CHECK (CHAR_LENGTH(contact_value) BETWEEN 5 AND 254),
  CONSTRAINT ck_leads_flags CHECK (sells_amazon IN (0,1) AND sells_flipkart IN (0,1) AND sells_meesho IN (0,1) AND sells_other IN (0,1)),
  CONSTRAINT ck_leads_any_market CHECK (sells_amazon + sells_flipkart + sells_meesho + sells_other >= 1),
  CONSTRAINT ck_leads_submissions CHECK (submissions >= 1),
  CONSTRAINT ck_leads_times CHECK (updated_at >= created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Anonymous summary of one processed batch. No file names, images, IPs or identifiers.
CREATE TABLE IF NOT EXISTS batch_events (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_at      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  preset_key      ENUM('amazon','flipkart','meesho','custom') NOT NULL,
  photo_count     SMALLINT UNSIGNED NOT NULL,
  processed_count SMALLINT UNSIGNED NOT NULL,
  pass_count      SMALLINT UNSIGNED NOT NULL,
  check_count     SMALLINT UNSIGNED NOT NULL,
  fail_count      SMALLINT UNSIGNED NOT NULL,
  duration_ms     INT UNSIGNED NOT NULL,
  output_size     SMALLINT UNSIGNED NOT NULL,
  device_class    ENUM('mobile','tablet','desktop') NOT NULL,
  used_worker     TINYINT(1) NOT NULL,
  cancelled       TINYINT(1) NOT NULL,
  used_samples    TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY ix_batch_created (created_at),
  KEY ix_batch_preset_created (preset_key, created_at),
  CONSTRAINT ck_batch_photos CHECK (photo_count BETWEEN 1 AND 100),
  CONSTRAINT ck_batch_processed CHECK (processed_count <= photo_count),
  CONSTRAINT ck_batch_sum CHECK (pass_count + check_count + fail_count = processed_count),
  CONSTRAINT ck_batch_duration CHECK (duration_ms <= 3600000),
  CONSTRAINT ck_batch_size CHECK (output_size BETWEEN 500 AND 5000),
  CONSTRAINT ck_batch_flags CHECK (used_worker IN (0,1) AND cancelled IN (0,1) AND used_samples IN (0,1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fixed-window request counters. key_hash is HMAC-SHA256(client IP, server secret): never the IP itself.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  key_hash     CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  window_start DATETIME NOT NULL,
  hits         INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket, key_hash, window_start),
  KEY ix_rate_window (window_start),
  CONSTRAINT ck_rate_hash CHECK (CHAR_LENGTH(key_hash) = 64)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
