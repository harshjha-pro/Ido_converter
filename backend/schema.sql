-- idoconverter accounts, subscriptions and saved history (Phase 4). MySQL 8 / MariaDB 10.4+, utf8mb4.
-- Apply once in hPanel → Databases → phpMyAdmin → Import, or: mysql -u USER -p DBNAME < schema.sql
--
-- Kept completely separate from the free static tools: those never read from or write to this database.

SET NAMES utf8mb4;

-- People with an account. Passwords are stored ONLY as password_hash() output, never plaintext.
CREATE TABLE users (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email          VARCHAR(254)    NOT NULL,
  password_hash  VARCHAR(255)    NOT NULL,             -- password_hash(PASSWORD_DEFAULT): bcrypt/argon2 string
  role           ENUM('user', 'admin') NOT NULL DEFAULT 'user',  -- admin panel access is checked against this, not just "logged in"
  created_at     DATETIME        NOT NULL,
  last_login_at  DATETIME        NULL,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One current subscription per user (renewals update the same row).
CREATE TABLE subscriptions (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id            BIGINT UNSIGNED NOT NULL,
  tier               VARCHAR(20)     NOT NULL,          -- key in config/plans.php: basic | plus | premium
  billing_period     ENUM('monthly', 'yearly') NOT NULL,
  status             ENUM('active', 'cancelled', 'expired') NOT NULL,
  started_at         DATETIME        NOT NULL,
  renewed_at         DATETIME        NULL,
  ends_at            DATETIME        NOT NULL,          -- access continues until this time
  payment_reference  VARCHAR(100)    NULL,              -- latest Razorpay payment id, verified server-side
  updated_at         DATETIME        NOT NULL,
  UNIQUE KEY uq_subscriptions_user (user_id),
  -- Deleting a user deletes their subscription.
  CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every checkout attempt. Kept for accounting even after the account is deleted, but then
-- unlinked from the person (user_id set to NULL) so it no longer identifies them.
CREATE TABLE payments (
  id                   BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id              BIGINT UNSIGNED NULL,
  razorpay_order_id    VARCHAR(64)     NOT NULL,
  razorpay_payment_id  VARCHAR(64)     NULL,
  tier                 VARCHAR(20)     NOT NULL,
  billing_period       ENUM('monthly', 'yearly') NOT NULL,
  amount_paise         INT UNSIGNED    NOT NULL,        -- amount charged, in paise (₹1 = 100)
  currency             CHAR(3)         NOT NULL DEFAULT 'INR',
  status               ENUM('created', 'paid', 'failed') NOT NULL DEFAULT 'created',
  created_at           DATETIME        NOT NULL,
  updated_at           DATETIME        NOT NULL,
  UNIQUE KEY uq_payments_order (razorpay_order_id),
  UNIQUE KEY uq_payments_payment (razorpay_payment_id),
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved tool results.
-- !! This is the FIRST and ONLY place user data is stored server-side. It deliberately breaks the
-- !! free tools' "nothing leaves your browser" promise, and exists only for paid users who choose
-- !! to save a result themselves. The free tools never write here. Users can delete entries or
-- !! their whole account at any time; entries are also removed 30 days after a subscription ends.
CREATE TABLE tool_history (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  tool_name  VARCHAR(80)     NOT NULL,
  title      VARCHAR(200)    NOT NULL DEFAULT '',
  data       MEDIUMTEXT      NOT NULL,                  -- the saved result exactly as the user pasted it
  saved_at   DATETIME        NOT NULL,
  KEY ix_tool_history_user (user_id, saved_at),
  CONSTRAINT fk_tool_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Failed logins, for brute-force throttling. Email and IP are stored only as SHA-256 hashes.
CREATE TABLE login_attempts (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  key_hash      CHAR(64)        NOT NULL,               -- sha256(lower(email) + '|' + ip)
  ip_hash       CHAR(64)        NOT NULL,               -- sha256(ip), for per-IP limits
  attempted_at  DATETIME        NOT NULL,
  KEY ix_login_attempts_key (key_hash, attempted_at),
  KEY ix_login_attempts_ip (ip_hash, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- What admins did (subscription changes, account views). Admin link survives as NULL if the admin is deleted.
CREATE TABLE admin_audit_log (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_user_id   BIGINT UNSIGNED NULL,
  action          VARCHAR(50)     NOT NULL,
  target_user_id  BIGINT UNSIGNED NULL,
  details         VARCHAR(500)    NOT NULL DEFAULT '',
  created_at      DATETIME        NOT NULL,
  KEY ix_admin_audit_created (created_at),
  CONSTRAINT fk_admin_audit_admin FOREIGN KEY (admin_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Razorpay webhook event ids already processed, so a retried webhook is applied only once.
CREATE TABLE webhook_events (
  event_id     VARCHAR(100) NOT NULL PRIMARY KEY,
  event_type   VARCHAR(60)  NOT NULL,
  received_at  DATETIME     NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
