<?php

declare(strict_types=1);

const PASSWORD_MIN = 10;
// A real hash of a random throwaway value, so password_verify() takes the usual time for unknown emails.
const DUMMY_PASSWORD_HASH = '$2y$10$uyv2LGoEpMj9WF3VeQLGouuXE/lMqHUsKPWUpDF0atrRYPgQvNy8q';
const PASSWORD_MAX_BYTES = 72;   // bcrypt ignores bytes beyond 72, so longer passwords are refused, not silently cut

function normalize_email(string $email): string
{
    return strtolower(trim($email));
}

/** @return array{ok: bool, error?: string, user_id?: int} */
function register_user(string $email, string $password): array
{
    $email = normalize_email($email);
    if (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return ['ok' => false, 'error' => 'Enter a valid email address.'];
    }
    if (mb_strlen($password) < PASSWORD_MIN) {
        return ['ok' => false, 'error' => 'Use a password of at least ' . PASSWORD_MIN . ' characters.'];
    }
    if (strlen($password) > PASSWORD_MAX_BYTES) {
        return ['ok' => false, 'error' => 'Use a password of at most ' . PASSWORD_MAX_BYTES . ' bytes.'];
    }
    $exists = q('SELECT id FROM users WHERE email = ?', [$email])->fetch();
    if ($exists) {
        return ['ok' => false, 'error' => 'An account with this email already exists. Log in instead.'];
    }
    q('INSERT INTO users (email, password_hash, role, created_at) VALUES (?, ?, ?, ?)',
        [$email, password_hash($password, PASSWORD_DEFAULT), 'user', now()]);
    return ['ok' => true, 'user_id' => (int)db()->lastInsertId()];
}

function login_throttle_keys(string $email, string $ip): array
{
    return [hash('sha256', normalize_email($email) . '|' . $ip), hash('sha256', $ip)];
}

function login_is_throttled(string $email, string $ip): bool
{
    [$key, $ipHash] = login_throttle_keys($email, $ip);
    $since = now(time() - 60 * (int)(config('login_window_minutes') ?? 15));
    $max = (int)(config('login_max_attempts') ?? 5);
    $byKey = (int)q('SELECT COUNT(*) FROM login_attempts WHERE key_hash = ? AND attempted_at >= ?', [$key, $since])->fetchColumn();
    // A looser per-IP limit stops one address from trying many different accounts.
    $byIp = (int)q('SELECT COUNT(*) FROM login_attempts WHERE ip_hash = ? AND attempted_at >= ?', [$ipHash, $since])->fetchColumn();
    return $byKey >= $max || $byIp >= $max * 4;
}

/** @return array{ok: bool, error?: string, user?: array} */
function attempt_login(string $email, string $password, string $ip): array
{
    $generic = 'Email or password is incorrect.';
    if (login_is_throttled($email, $ip)) {
        return ['ok' => false, 'error' => 'Too many failed attempts. Wait ' . (int)(config('login_window_minutes') ?? 15) . ' minutes and try again.'];
    }
    $user = q('SELECT * FROM users WHERE email = ?', [normalize_email($email)])->fetch();
    // Verify against a dummy hash when the account does not exist, so response time does not reveal which emails are registered.
    $hash = $user['password_hash'] ?? DUMMY_PASSWORD_HASH;
    $valid = password_verify($password, $hash) && $user;
    [$key, $ipHash] = login_throttle_keys($email, $ip);
    if (!$valid) {
        q('INSERT INTO login_attempts (key_hash, ip_hash, attempted_at) VALUES (?, ?, ?)', [$key, $ipHash, now()]);
        return ['ok' => false, 'error' => $generic];
    }
    q('DELETE FROM login_attempts WHERE key_hash = ?', [$key]);
    if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
        q('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash($password, PASSWORD_DEFAULT), $user['id']]);
    }
    q('UPDATE users SET last_login_at = ? WHERE id = ?', [now(), $user['id']]);
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);   // new session id at login: defeats session fixation
    }
    $_SESSION['user_id'] = (int)$user['id'];
    $_SESSION['last_seen'] = time();
    $_SESSION['csrf'] = bin2hex(random_bytes(32));
    return ['ok' => true, 'user' => $user];
}

function logout(): void
{
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => $p['samesite']]);
        session_destroy();
    }
}

const SESSION_IDLE_SECONDS = 7200;   // log out after 2 hours without activity (shared or forgotten computers)

function current_user(): ?array
{
    $id = $_SESSION['user_id'] ?? null;
    if (!$id) return null;
    $lastSeen = (int)($_SESSION['last_seen'] ?? time());
    if (time() - $lastSeen > SESSION_IDLE_SECONDS) {
        logout();
        return null;
    }
    $_SESSION['last_seen'] = time();
    $user = q('SELECT id, email, role, created_at, last_login_at FROM users WHERE id = ?', [$id])->fetch();
    if (!$user) {
        unset($_SESSION['user_id']);   // account was deleted
        return null;
    }
    return $user;
}

function require_login(): array
{
    $user = current_user();
    if (!$user) {
        redirect('/login.php?next=' . rawurlencode((string)($_SERVER['REQUEST_URI'] ?? '/dashboard.php')));
    }
    return $user;
}

/** Admin pages check the role in the database on every request, not just "logged in". */
function require_admin(): array
{
    $user = current_user();
    if (!$user || $user['role'] !== 'admin') {
        http_response_code($user ? 403 : 404);   // anonymous visitors get a plain 404: do not advertise the admin area
        exit($user ? 'Forbidden' : 'Not found');
    }
    return $user;
}

/** Re-check the password before destructive actions such as deleting the account. */
function verify_password_for(int $userId, string $password): bool
{
    $hash = q('SELECT password_hash FROM users WHERE id = ?', [$userId])->fetchColumn();
    return is_string($hash) && password_verify($password, $hash);
}
