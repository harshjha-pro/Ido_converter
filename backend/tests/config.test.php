<?php
// Test configuration: a throwaway MariaDB/MySQL database. Override with IDO_TEST_DSN / IDO_TEST_USER / IDO_TEST_PASSWORD.
return [
    'app_url' => 'http://127.0.0.1:4331',
    'tools_url' => 'http://127.0.0.1:4329',
    'db' => [
        'dsn' => getenv('IDO_TEST_DSN') ?: 'mysql:host=127.0.0.1;dbname=ido_test;charset=utf8mb4',
        'user' => getenv('IDO_TEST_USER') ?: 'ido',
        'password' => getenv('IDO_TEST_PASSWORD') ?: 'idotest',
    ],
    'razorpay' => ['key_id' => 'rzp_test_dummykey', 'key_secret' => 'test_secret_123', 'webhook_secret' => 'whsec_test_456'],
    'environment' => 'development',
    'cookie_secure' => false,   // the local test server is plain http
    'login_max_attempts' => 5,
    'login_window_minutes' => 15,
];
