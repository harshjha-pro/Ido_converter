<?php

declare(strict_types=1);

/** The user's subscription row, with status corrected to 'expired' once ends_at has passed. */
function subscription_for(int $userId): ?array
{
    $sub = q('SELECT * FROM subscriptions WHERE user_id = ?', [$userId])->fetch();
    if ($sub && $sub['status'] !== 'expired' && $sub['ends_at'] < now()) {
        q('UPDATE subscriptions SET status = ?, updated_at = ? WHERE id = ?', ['expired', now(), $sub['id']]);
        $sub['status'] = 'expired';
    }
    return $sub ?: null;
}

/** True while the user may save history: active, or cancelled but not yet past ends_at. */
function has_paid_access(int $userId): bool
{
    $sub = subscription_for($userId);
    return $sub !== null && in_array($sub['status'], ['active', 'cancelled'], true) && $sub['ends_at'] >= now();
}

/**
 * Starts or extends a subscription after a payment has been verified server-side.
 * Paying again before the end date adds the new period on top of the remaining time.
 */
function activate_subscription(int $userId, string $tier, string $period, string $paymentReference, ?int $at = null): void
{
    $at ??= time();
    $existing = q('SELECT * FROM subscriptions WHERE user_id = ?', [$userId])->fetch();
    $base = $at;
    if ($existing && $existing['status'] !== 'expired' && strtotime($existing['ends_at'] . ' UTC') > $at && $existing['tier'] === $tier) {
        $base = strtotime($existing['ends_at'] . ' UTC');
    }
    $ends = now($base + period_seconds($period));
    if ($existing) {
        q('UPDATE subscriptions SET tier = ?, billing_period = ?, status = ?, renewed_at = ?, ends_at = ?, payment_reference = ?, updated_at = ? WHERE user_id = ?',
            [$tier, $period, 'active', now($at), $ends, $paymentReference, now($at), $userId]);
    } else {
        q('INSERT INTO subscriptions (user_id, tier, billing_period, status, started_at, ends_at, payment_reference, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [$userId, $tier, $period, 'active', now($at), $ends, $paymentReference, now($at)]);
    }
}

/**
 * Retention rule (config/plans.php): delete saved history of users whose subscription ended more than
 * history_grace_days ago. Run daily from a cron job (backend/cron/cleanup.php) and on dashboard visits.
 */
function purge_expired_history(): int
{
    $cutoff = now(time() - 86400 * (int)config('plans')['history_grace_days']);
    $stmt = q('DELETE FROM tool_history WHERE user_id IN (SELECT user_id FROM subscriptions WHERE ends_at < ?)', [$cutoff]);
    return $stmt->rowCount();
}
