<?php
// Loaded first by every page. Sets safe defaults before anything else runs.

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('log_errors', '1');

const BACKEND_ROOT = __DIR__ . '/..';

function config(?string $key = null): mixed
{
    static $config = null;
    if ($config === null) {
        $path = getenv('IDO_CONFIG') ?: BACKEND_ROOT . '/config/config.php';
        if (!is_file($path)) {
            http_response_code(503);
            exit('The account service is not configured yet.');
        }
        $config = require $path;
        $config['plans'] = require BACKEND_ROOT . '/config/plans.php';
    }
    return $key === null ? $config : ($config[$key] ?? null);
}

// Never show stack traces or SQL to visitors; details go to the server error log only.
ini_set('display_errors', config('environment') === 'development' ? '1' : '0');
set_exception_handler(static function (Throwable $e): void {
    error_log('[idoconverter-account] ' . get_class($e) . ': ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) http_response_code(500);
    echo 'Something went wrong. Please try again later.';
});

require __DIR__ . '/db.php';
require __DIR__ . '/view.php';
require __DIR__ . '/csrf.php';
require __DIR__ . '/auth.php';
require __DIR__ . '/plans.php';
require __DIR__ . '/history.php';
require __DIR__ . '/subscriptions.php';
require __DIR__ . '/razorpay.php';
require __DIR__ . '/admin.php';

function start_session(): void
{
    if (PHP_SAPI === 'cli' || session_status() === PHP_SESSION_ACTIVE) return;
    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    session_name('ido_account');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => config('cookie_secure') ?? true,   // only false for local http testing
        'httponly' => true,                            // not readable by JavaScript
        'samesite' => 'Lax',                           // not sent on cross-site POSTs
    ]);
    session_start();
}

function send_security_headers(array $cspOverrides = []): void
{
    if (headers_sent()) return;
    $csp = array_merge([
        'default-src' => "'self'",
        'script-src' => "'self'",
        'style-src' => "'self'",
        'img-src' => "'self' data:",
        'connect-src' => "'self'",
        'frame-src' => "'none'",
        'form-action' => "'self'",
        'base-uri' => "'self'",
        'object-src' => "'none'",
        'frame-ancestors' => "'none'",
    ], $cspOverrides);
    header('Content-Security-Policy: ' . implode('; ', array_map(fn($k, $v) => "$k $v", array_keys($csp), $csp)));
    header('X-Content-Type-Options: nosniff');
    header('Referrer-Policy: same-origin');
    header('X-Frame-Options: DENY');
    header('Cache-Control: no-store');                 // account pages hold personal data
}

if (PHP_SAPI !== 'cli') {
    start_session();
    send_security_headers();
}
