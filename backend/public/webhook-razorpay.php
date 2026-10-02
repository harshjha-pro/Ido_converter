<?php
// Razorpay → server notification. Authenticated only by the HMAC signature (no session, no CSRF).
define('IDO_NO_SESSION', true);
require __DIR__ . '/../src/bootstrap.php';
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') { http_response_code(405); exit; }
$raw = (string)file_get_contents('php://input');
$status = handle_razorpay_webhook($raw, (string)($_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? ''), (string)($_SERVER['HTTP_X_RAZORPAY_EVENT_ID'] ?? ''));
http_response_code($status);
echo $status === 200 ? 'ok' : 'invalid';
