<?php

/** Fake Razorpay API: records calls and returns canned responses. No network. */
function fake_razorpay(array $payments = [], bool $failGet = false): ArrayObject
{
    $calls = new ArrayObject();
    razorpay_http(function (string $method, string $path, ?array $body = null) use ($calls, $payments, $failGet) {
        $calls[] = [$method, $path, $body];
        if ($method === 'POST' && $path === '/orders') {
            return ['id' => 'order_' . (count($calls)), 'amount' => $body['amount'], 'currency' => $body['currency'], 'status' => 'created'];
        }
        if ($method === 'GET' && str_starts_with($path, '/payments/')) {
            if ($failGet) throw new RuntimeException('network down');
            $id = substr($path, strlen('/payments/'));
            return $payments[$id] ?? throw new RuntimeException('not found');
        }
        throw new RuntimeException("unexpected call $method $path");
    });
    return $calls;
}

function sign_checkout(string $orderId, string $paymentId): string
{
    return hash_hmac('sha256', "$orderId|$paymentId", config('razorpay')['key_secret']);
}

function webhook(array $event, ?string $secret = null): array
{
    $raw = json_encode($event);
    return [$raw, hash_hmac('sha256', $raw, $secret ?? config('razorpay')['webhook_secret'])];
}

function captured_event(string $orderId, string $paymentId, int $amount, string $type = 'payment.captured'): array
{
    return ['event' => $type, 'payload' => ['payment' => ['entity' => ['id' => $paymentId, 'order_id' => $orderId, 'amount' => $amount, 'status' => 'captured']]]];
}

test('order: amount comes from server config, not the client; invalid plan refused', function () {
    $calls = fake_razorpay();
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    $r = razorpay_create_order($uid, 'basic', 'monthly');
    same(true, $r['ok']);
    same(2900, $calls[0][2]['amount']);
    same('INR', $calls[0][2]['currency']);
    $row = q('SELECT * FROM payments')->fetch();
    same('created', $row['status']);
    same(2900, (int)$row['amount_paise']);
    same(false, razorpay_create_order($uid, 'plus', 'yearly')['ok'], 'Plus has no yearly price');
    same(false, razorpay_create_order($uid, 'diamond', 'monthly')['ok']);
});

test('order: refused with placeholder keys (not configured)', function () {
    fake_razorpay();
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    $orig = config('razorpay');
    $cfg = &config_ref();
    $cfg['razorpay']['key_secret'] = 'XXXXXXXX';
    same(false, razorpay_configured());
    same(false, razorpay_create_order($uid, 'basic', 'monthly')['ok']);
    $cfg['razorpay'] = $orig;
});

test('checkout signature: valid accepted; tampered or wrong-key rejected', function () {
    $sig = sign_checkout('order_1', 'pay_1');
    same(true, razorpay_verify_checkout_signature('order_1', 'pay_1', $sig));
    same(false, razorpay_verify_checkout_signature('order_1', 'pay_2', $sig), 'other payment id');
    same(false, razorpay_verify_checkout_signature('order_2', 'pay_1', $sig), 'other order');
    same(false, razorpay_verify_checkout_signature('order_1', 'pay_1', hash_hmac('sha256', 'order_1|pay_1', 'wrong')));
    same(false, razorpay_verify_checkout_signature('order_1', 'pay_1', ''));
});

test('callback: activates only after signature AND API confirm captured, right order and amount', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $order = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    fake_razorpay(['pay_ok' => ['id' => 'pay_ok', 'order_id' => $order, 'amount' => 2900, 'status' => 'captured']]);
    $r = handle_checkout_callback($uid, $order, 'pay_ok', sign_checkout($order, 'pay_ok'));
    same(true, $r['ok']);
    same(true, has_paid_access($uid));
    same('paid', q('SELECT status FROM payments')->fetchColumn());
    same('pay_ok', subscription_for($uid)['payment_reference']);
});

test('callback: forged signature, wrong order, wrong amount, failed status, other user all refused', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    $other = register_user('other@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $order = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    fake_razorpay([
        'pay_cheap' => ['id' => 'pay_cheap', 'order_id' => $order, 'amount' => 100, 'status' => 'captured'],
        'pay_elsewhere' => ['id' => 'pay_elsewhere', 'order_id' => 'order_other', 'amount' => 2900, 'status' => 'captured'],
        'pay_failed' => ['id' => 'pay_failed', 'order_id' => $order, 'amount' => 2900, 'status' => 'failed'],
    ]);
    same(false, handle_checkout_callback($uid, $order, 'pay_cheap', 'forged-signature')['ok']);
    same(false, handle_checkout_callback($uid, $order, 'pay_cheap', sign_checkout($order, 'pay_cheap'))['ok'], 'amount mismatch');
    same(false, handle_checkout_callback($uid, $order, 'pay_elsewhere', sign_checkout($order, 'pay_elsewhere'))['ok'], 'payment for another order');
    same(false, handle_checkout_callback($uid, $order, 'pay_failed', sign_checkout($order, 'pay_failed'))['ok'], 'not captured');
    same(false, handle_checkout_callback($other, $order, 'pay_cheap', sign_checkout($order, 'pay_cheap'))['ok'], 'someone else\'s order');
    same(false, has_paid_access($uid));
    same('created', q('SELECT status FROM payments')->fetchColumn());
});

test('callback: API unreachable leaves payment pending for the webhook', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $order = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    fake_razorpay([], true);
    $r = handle_checkout_callback($uid, $order, 'pay_x', sign_checkout($order, 'pay_x'));
    same(false, $r['ok']);
    same(true, $r['pending']);
    same(false, has_paid_access($uid));
});

test('webhook: valid signed payment.captured activates; replays and duplicates do nothing more', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $order = razorpay_create_order($uid, 'basic', 'yearly')['order']['id'];
    [$raw, $sig] = webhook(captured_event($order, 'pay_w', 8900));
    same(200, handle_razorpay_webhook($raw, $sig, 'evt_1'));
    same(true, has_paid_access($uid));
    $ends = subscription_for($uid)['ends_at'];
    same(200, handle_razorpay_webhook($raw, $sig, 'evt_1'), 'duplicate event id');
    [$raw2, $sig2] = webhook(captured_event($order, 'pay_w', 8900, 'order.paid'));
    same(200, handle_razorpay_webhook($raw2, $sig2, 'evt_2'), 'order.paid for the same order');
    same($ends, subscription_for($uid)['ends_at'], 'not extended twice');
    same(1, (int)q('SELECT COUNT(*) FROM payments WHERE status = ?', ['paid'])->fetchColumn());
});

test('webhook: bad signature or wrong secret rejected with 400 and no change', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $order = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    [$raw, $sig] = webhook(captured_event($order, 'pay_w', 2900), 'attacker-secret');
    same(400, handle_razorpay_webhook($raw, $sig, 'evt_bad'));
    same(400, handle_razorpay_webhook($raw, '', 'evt_bad'));
    [$raw2, $sig2] = webhook(captured_event($order, 'pay_w', 2900));
    same(400, handle_razorpay_webhook($raw2 . ' ', $sig2, 'evt_tampered'), 'body changed after signing');
    same(false, has_paid_access($uid));
    same(0, (int)q('SELECT COUNT(*) FROM webhook_events')->fetchColumn());
});

test('webhook: payment.failed marks the order failed but never downgrades a paid one', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $o1 = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    $o2 = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    $failed = fn($o) => webhook(['event' => 'payment.failed', 'payload' => ['payment' => ['entity' => ['id' => 'pay_f', 'order_id' => $o, 'amount' => 2900, 'status' => 'failed']]]]);
    [$raw, $sig] = $failed($o1);
    handle_razorpay_webhook($raw, $sig, 'evt_f1');
    same('failed', q('SELECT status FROM payments WHERE razorpay_order_id = ?', [$o1])->fetchColumn());
    [$rawOk, $sigOk] = webhook(captured_event($o2, 'pay_ok', 2900));
    handle_razorpay_webhook($rawOk, $sigOk, 'evt_ok');
    [$raw2, $sig2] = $failed($o2);
    handle_razorpay_webhook($raw2, $sig2, 'evt_f2');
    same('paid', q('SELECT status FROM payments WHERE razorpay_order_id = ?', [$o2])->fetchColumn());
    same(true, has_paid_access($uid));
});

test('payment for a deleted account is not applied', function () {
    $uid = register_user('buyer@example.com', 'longenoughpw')['user_id'];
    fake_razorpay();
    $order = razorpay_create_order($uid, 'basic', 'monthly')['order']['id'];
    delete_account($uid);
    same(false, complete_payment($order, 'pay_late', 2900)['ok']);
});
