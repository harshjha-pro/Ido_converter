<?php

declare(strict_types=1);

// Tools a result can be saved from (titles as on the site, website/src/data/tools.ts).
const HISTORY_TOOLS = [
    'JSON PII Masker', 'Consistent Pseudonymizer', 'Log and Secret Scrubber', 'SQL Output to JSON',
    'JSON to TypeScript and Zod', 'JSON Repair', 'Notice Period Buyout Calculator', 'Volumetric Weight Calculator',
    'Return-Loss Calculator', 'Visa and Passport Photo Sizer', 'Other',
];

/** @return array{ok: bool, error?: string} */
function save_history(int $userId, string $toolName, string $title, string $data): array
{
    if (!has_paid_access($userId)) {
        return ['ok' => false, 'error' => 'Saving history needs an active paid plan.'];
    }
    $toolName = trim($toolName);
    $title = trim($title);
    if (!in_array($toolName, HISTORY_TOOLS, true)) return ['ok' => false, 'error' => 'Choose which tool this result is from.'];
    if (mb_strlen($title) > 200) return ['ok' => false, 'error' => 'Keep the title under 200 characters.'];
    if ($data === '') return ['ok' => false, 'error' => 'Paste the result you want to save.'];
    $max = (int)config('plans')['max_history_entry_bytes'];
    if (strlen($data) > $max) return ['ok' => false, 'error' => 'That result is too large to save (limit ' . round($max / 1048576) . ' MB).'];

    $sub = subscription_for($userId);
    $limit = (int)(plan($sub['tier'])['history_limit'] ?? 0);
    $count = (int)q('SELECT COUNT(*) FROM tool_history WHERE user_id = ?', [$userId])->fetchColumn();
    if ($count >= $limit) return ['ok' => false, 'error' => "Your plan stores up to {$limit} results. Delete some to save more."];

    q('INSERT INTO tool_history (user_id, tool_name, title, data, saved_at) VALUES (?, ?, ?, ?, ?)', [$userId, $toolName, $title, $data, now()]);
    return ['ok' => true];
}

function list_history(int $userId): array
{
    return q('SELECT id, tool_name, title, saved_at, LENGTH(data) AS bytes FROM tool_history WHERE user_id = ? ORDER BY saved_at DESC, id DESC', [$userId])->fetchAll();
}

/** Scoped to the owner: a user can never read another user's entry by changing the id. */
function get_history_entry(int $userId, int $id): ?array
{
    return q('SELECT * FROM tool_history WHERE id = ? AND user_id = ?', [$id, $userId])->fetch() ?: null;
}

function delete_history_entry(int $userId, int $id): bool
{
    return q('DELETE FROM tool_history WHERE id = ? AND user_id = ?', [$id, $userId])->rowCount() === 1;
}

function delete_all_history(int $userId): int
{
    return q('DELETE FROM tool_history WHERE user_id = ?', [$userId])->rowCount();
}

/** Hard delete. Foreign keys remove subscription and history; payments are kept but unlinked. */
function delete_account(int $userId): void
{
    $pdo = db();
    $pdo->beginTransaction();
    try {
        q('DELETE FROM tool_history WHERE user_id = ?', [$userId]);
        q('DELETE FROM subscriptions WHERE user_id = ?', [$userId]);
        q('UPDATE payments SET user_id = NULL WHERE user_id = ?', [$userId]);
        q('DELETE FROM users WHERE id = ?', [$userId]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}
