<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
require_post_with_csrf();
$r = handle_checkout_callback(
    (int)$user['id'],
    (string)($_POST['razorpay_order_id'] ?? ''),
    (string)($_POST['razorpay_payment_id'] ?? ''),
    (string)($_POST['razorpay_signature'] ?? ''),
);
if ($r['ok']) {
    flash('Payment confirmed. Your plan is active.');
} else {
    flash($r['error'] ?? 'Payment could not be verified.', !empty($r['pending']) ? 'success' : 'error');
}
redirect('/dashboard.php');
