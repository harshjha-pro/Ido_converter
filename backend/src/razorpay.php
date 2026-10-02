<?php
// Razorpay integration (Orders API + Checkout + webhooks). Docs: https://razorpay.com/docs/payments/
// Security rule: a subscription is activated ONLY after the server has verified the payment, either by
// checking the checkout signature with the secret key AND fetching the payment from Razorpay's API, or
// via a webhook signed with the webhook secret. A browser saying "paid" is never enough.

declare(strict_types=1);

const RAZORPAY_API = 'https://api.razorpay.com/v1';

function razorpay_configured(): bool
{
    $c = config('razorpay') ?? [];
    foreach (['key_id', 'key_secret', 'webhook_secret'] as $k) {
        if (empty($c[$k]) || str_contains((string)$c[$k], 'XXXX')) return false;
    }
    return true;
}

/** HTTP transport; replaced in tests so no real request is ever made there. */
function razorpay_http(?callable $override = null): callable
{
    static $transport = null;
    if ($override !== null) $transport = $override;
    return $transport ??= static function (string $method, string $path, ?array $body = null): array {
        $c = config('razorpay');
        $ch = curl_init(RAZORPAY_API . $path);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_USERPWD => $c['key_id'] . ':' . $c['key_secret'],
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT => 20,
            CURLOPT_SSL_VERIFYPEER => true,
        ]);
        if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        $raw = curl_exec($ch);
        $status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($raw === false || $status >= 400) {
            throw new RuntimeException("Razorpay API {$method} {$path} failed with HTTP {$status}");
        }
        return json_decode((string)$raw, true, 512, JSON_THROW_ON_ERROR);
    };
}

/**
 * Creates a Razorpay order for a plan. The amount always comes from config/plans.php on the server.
 * @return array{ok: bool, error?: string, order?: array}
 */
function razorpay_create_order(int $userId, string $tier, string $period): array
{
    $amount = plan_price_paise($tier, $period);
    if ($amount === null) return ['ok' => false, 'error' => 'That plan is not available.'];
    if (!razorpay_configured()) return ['ok' => false, 'error' => 'Payments are not set up yet. Please try again later.'];

    try {
        $order = (razorpay_http())('POST', '/orders', [
            'amount' => $amount,
            'currency' => config('plans')['currency'],
            'receipt' => 'u' . $userId . '-' . time(),
            'notes' => ['user_id' => (string)$userId, 'tier' => $tier, 'period' => $period],
        ]);
    } catch (Throwable $e) {
        error_log('[idoconverter-account] order creation failed: ' . $e->getMessage());
        return ['ok' => false, 'error' => 'Could not reach the payment provider. Please try again in a minute.'];
    }
    if (($order['amount'] ?? null) !== $amount || empty($order['id'])) {
        return ['ok' => false, 'error' => 'Could not start the payment. Please try again.'];
    }
    q('INSERT INTO payments (user_id, razorpay_order_id, tier, billing_period, amount_paise, currency, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [$userId, $order['id'], $tier, $period, $amount, config('plans')['currency'], 'created', now(), now()]);
    return ['ok' => true, 'order' => $order];
}

/** Checkout signature = HMAC-SHA256(order_id + "|" + payment_id, key_secret). */
function razorpay_verify_checkout_signature(string $orderId, string $paymentId, string $signature): bool
{
    if ($orderId === '' || $paymentId === '' || $signature === '') return false;
    $expected = hash_hmac('sha256', $orderId . '|' . $paymentId, (string)config('razorpay')['key_secret']);
    return hash_equals($expected, $signature);
}

/** Webhook signature = HMAC-SHA256(raw request body, webhook_secret). */
function razorpay_verify_webhook_signature(string $rawBody, string $signature): bool
{
    if ($signature === '') return false;
    $expected = hash_hmac('sha256', $rawBody, (string)config('razorpay')['webhook_secret']);
    return hash_equals($expected, $signature);
}

/**
 * Marks a verified payment as paid and activates the subscription. Safe to call twice (callback and
 * webhook can both arrive): the row is locked and an already-paid order is not applied again.
 * @return array{ok: bool, error?: string, already?: bool}
 */
function complete_payment(string $orderId, string $paymentId, int $amountPaise): array
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $row = q('SELECT * FROM payments WHERE razorpay_order_id = ? FOR UPDATE', [$orderId])->fetch();
        if (!$row) { $pdo->rollBack(); return ['ok' => false, 'error' => 'Unknown order.']; }
        if ($row['status'] === 'paid') { $pdo->commit(); return ['ok' => true, 'already' => true]; }
        if ((int)$row['amount_paise'] !== $amountPaise) {
            $pdo->rollBack();
            error_log("[idoconverter-account] amount mismatch for {$orderId}: expected {$row['amount_paise']}, got {$amountPaise}");
            return ['ok' => false, 'error' => 'Payment amount does not match the order.'];
        }
        if ($row['user_id'] === null) { $pdo->rollBack(); return ['ok' => false, 'error' => 'The account for this order no longer exists.']; }
        q('UPDATE payments SET status = ?, razorpay_payment_id = ?, updated_at = ? WHERE id = ?', ['paid', $paymentId, now(), $row['id']]);
        activate_subscription((int)$row['user_id'], $row['tier'], $row['billing_period'], $paymentId);
        $pdo->commit();
        return ['ok' => true, 'already' => false];
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        throw $e;
    }
}

/** A failed attempt never downgrades an order that was already paid. */
function mark_payment_failed(string $orderId): void
{
    q("UPDATE payments SET status = 'failed', updated_at = ? WHERE razorpay_order_id = ? AND status = 'created'", [now(), $orderId]);
}

/**
 * Checkout callback: verify the signature, then confirm with Razorpay's API that the payment is
 * captured, for this order, for the right amount.
 * @return array{ok: bool, error?: string, pending?: bool}
 */
function handle_checkout_callback(int $userId, string $orderId, string $paymentId, string $signature): array
{
    if (!razorpay_verify_checkout_signature($orderId, $paymentId, $signature)) {
        return ['ok' => false, 'error' => 'Payment could not be verified.'];
    }
    $row = q('SELECT * FROM payments WHERE razorpay_order_id = ? AND user_id = ?', [$orderId, $userId])->fetch();
    if (!$row) return ['ok' => false, 'error' => 'Unknown order.'];
    try {
        $payment = (razorpay_http())('GET', '/payments/' . rawurlencode($paymentId));
    } catch (Throwable $e) {
        // Could not reach Razorpay right now: the signed webhook will activate the plan when it arrives.
        return ['ok' => false, 'pending' => true, 'error' => 'Payment received; we are confirming it. Your plan will activate in a few minutes.'];
    }
    if (($payment['order_id'] ?? '') !== $orderId) return ['ok' => false, 'error' => 'Payment does not belong to this order.'];
    if (($payment['status'] ?? '') !== 'captured') {
        return ['ok' => false, 'pending' => ($payment['status'] ?? '') === 'authorized',
            'error' => ($payment['status'] ?? '') === 'authorized' ? 'Payment authorised; it will be confirmed shortly.' : 'Payment was not completed.'];
    }
    return complete_payment($orderId, $paymentId, (int)($payment['amount'] ?? -1));
}

/**
 * Webhook handler. Returns the HTTP status to send. Idempotent by Razorpay event id.
 */
function handle_razorpay_webhook(string $rawBody, string $signature, string $eventId): int
{
    if (!razorpay_verify_webhook_signature($rawBody, $signature)) return 400;
    $event = json_decode($rawBody, true);
    if (!is_array($event) || empty($event['event'])) return 400;

    // Duplicate delivery of an event we already applied: acknowledge and do nothing.
    if ($eventId !== '' && q('SELECT 1 FROM webhook_events WHERE event_id = ?', [$eventId])->fetch()) return 200;

    $payment = $event['payload']['payment']['entity'] ?? null;
    switch ($event['event']) {
        case 'payment.captured':
        case 'order.paid':
            if ($payment && ($payment['status'] ?? '') === 'captured' && !empty($payment['order_id'])) {
                complete_payment((string)$payment['order_id'], (string)$payment['id'], (int)$payment['amount']);
            }
            break;
        case 'payment.failed':
            if ($payment && !empty($payment['order_id'])) mark_payment_failed((string)$payment['order_id']);
            break;
    }
    // Recorded only after processing succeeded, so a failure here lets Razorpay's retry run it again.
    // (Processing is idempotent, so a rare double run is harmless.)
    if ($eventId !== '') {
        q('INSERT INTO webhook_events (event_id, event_type, received_at) SELECT ?, ?, ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM webhook_events WHERE event_id = ?)',
            [$eventId, $event['event'], now(), $eventId]);
    }
    return 200;
}
