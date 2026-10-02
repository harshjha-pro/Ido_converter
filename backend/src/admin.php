<?php

declare(strict_types=1);

function audit(int $adminId, string $action, ?int $targetUserId, string $details = ''): void
{
    q('INSERT INTO admin_audit_log (admin_user_id, action, target_user_id, details, created_at) VALUES (?, ?, ?, ?, ?)',
        [$adminId, $action, $targetUserId, mb_substr($details, 0, 500), now()]);
}

/** Users with their plan. LIMIT/OFFSET are bound as integers. */
function admin_list_users(string $search, int $page, int $perPage = 50): array
{
    $where = '';
    $params = [];
    if ($search !== '') {
        $where = 'WHERE u.email LIKE ?';
        $params[] = '%' . addcslashes($search, '%_\\') . '%';
    }
    $stmt = db()->prepare("SELECT u.id, u.email, u.role, u.created_at, u.last_login_at, s.tier, s.status, s.ends_at
        FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id $where ORDER BY u.created_at DESC, u.id DESC LIMIT ? OFFSET ?");
    foreach ($params as $i => $v) $stmt->bindValue($i + 1, $v);
    $stmt->bindValue(count($params) + 1, $perPage, PDO::PARAM_INT);
    $stmt->bindValue(count($params) + 2, max(0, $page - 1) * $perPage, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll();
}

function admin_stats(): array
{
    return [
        'users' => (int)q('SELECT COUNT(*) FROM users')->fetchColumn(),
        'active' => (int)q("SELECT COUNT(*) FROM subscriptions WHERE status IN ('active','cancelled') AND ends_at >= ?", [now()])->fetchColumn(),
        'revenue_paise' => (int)q("SELECT COALESCE(SUM(amount_paise), 0) FROM payments WHERE status = 'paid'")->fetchColumn(),
        // Aggregate counts only: admins never see saved content.
        'tool_usage' => q('SELECT tool_name, COUNT(*) AS saves FROM tool_history GROUP BY tool_name ORDER BY saves DESC')->fetchAll(),
    ];
}

/** @return array{ok: bool, error?: string} */
function admin_change_subscription(int $adminId, int $userId, string $action, array $input): array
{
    if (!q('SELECT id FROM users WHERE id = ?', [$userId])->fetch()) return ['ok' => false, 'error' => 'No such user.'];
    $sub = q('SELECT * FROM subscriptions WHERE user_id = ?', [$userId])->fetch();

    switch ($action) {
        case 'grant':
        case 'extend': {
            $tier = (string)($input['tier'] ?? ($sub['tier'] ?? ''));
            $days = (int)($input['days'] ?? 0);
            if (!plan($tier)) return ['ok' => false, 'error' => 'Unknown plan.'];
            if ($days < 1 || $days > 366) return ['ok' => false, 'error' => 'Days must be between 1 and 366.'];
            $base = ($sub && $sub['ends_at'] > now()) ? strtotime($sub['ends_at'] . ' UTC') : time();
            $ends = now($base + $days * 86400);
            if ($sub) {
                q('UPDATE subscriptions SET tier = ?, status = ?, ends_at = ?, updated_at = ? WHERE user_id = ?', [$tier, 'active', $ends, now(), $userId]);
            } else {
                q('INSERT INTO subscriptions (user_id, tier, billing_period, status, started_at, ends_at, payment_reference, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [$userId, $tier, 'monthly', 'active', now(), $ends, 'admin-grant', now()]);
            }
            audit($adminId, 'subscription_extend', $userId, "tier={$tier} days={$days} ends_at={$ends}");
            return ['ok' => true];
        }
        case 'cancel_at_end':
            if (!$sub) return ['ok' => false, 'error' => 'User has no subscription.'];
            q('UPDATE subscriptions SET status = ?, updated_at = ? WHERE user_id = ?', ['cancelled', now(), $userId]);
            audit($adminId, 'subscription_cancel_at_end', $userId, "ends_at={$sub['ends_at']}");
            return ['ok' => true];
        case 'cancel_now':
            if (!$sub) return ['ok' => false, 'error' => 'User has no subscription.'];
            q('UPDATE subscriptions SET status = ?, ends_at = ?, updated_at = ? WHERE user_id = ?', ['expired', now(), now(), $userId]);
            audit($adminId, 'subscription_cancel_now', $userId, (string)($input['reason'] ?? ''));
            return ['ok' => true];
        default:
            return ['ok' => false, 'error' => 'Unknown action.'];
    }
}
