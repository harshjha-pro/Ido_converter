<?php
// Copy to config.php (git-ignored) and fill in. Never commit real secrets.

declare(strict_types=1);

return [
    // Public URL of the account app, no trailing slash. Recommended: a separate subdomain so a bug
    // here can never affect the free static tools (TECHNICAL_SPEC section 13).
    'app_url' => 'https://account.YOUR-DOMAIN',
    // Where "Back to tools" links point.
    'tools_url' => 'https://YOUR-DOMAIN',

    // MySQL on Hostinger: hPanel → Databases → MySQL Databases.
    'db' => [
        'dsn' => 'mysql:host=localhost;dbname=YOUR_DB;charset=utf8mb4',
        'user' => 'YOUR_DB_USER',
        'password' => 'YOUR_DB_PASSWORD',
    ],

    // Razorpay: Dashboard → Account & Settings → API Keys (use Test Mode keys first).
    // Webhook secret: Dashboard → Webhooks → add https://account.YOUR-DOMAIN/webhook-razorpay.php
    // with events payment.captured, payment.failed, order.paid.
    'razorpay' => [
        'key_id' => 'rzp_test_XXXXXXXXXXXXXX',
        'key_secret' => 'XXXXXXXXXXXXXXXXXXXXXXXX',
        'webhook_secret' => 'XXXXXXXXXXXXXXXX',
    ],

    // 'production' hides all error details from users.
    'environment' => 'production',

    // Brute-force protection: max failed logins per email+IP within the window.
    'login_max_attempts' => 5,
    'login_window_minutes' => 15,
];
