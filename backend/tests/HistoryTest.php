<?php

function paid_user(string $email = 'p@example.com', string $tier = 'basic'): int
{
    $id = register_user($email, 'longenoughpw')['user_id'];
    activate_subscription($id, $tier, 'monthly', 'pay_test_1');
    return $id;
}

test('history: free users cannot save', function () {
    $id = register_user('f@example.com', 'longenoughpw')['user_id'];
    same(false, save_history($id, 'JSON Repair', '', '{"a":1}')['ok']);
    same(0, (int)q('SELECT COUNT(*) FROM tool_history')->fetchColumn());
});

test('history: paid user saves, lists and views own entries', function () {
    $id = paid_user();
    same(true, save_history($id, 'JSON Repair', 'My fix', '{"a":1}')['ok']);
    $list = list_history($id);
    same(1, count($list));
    same('My fix', $list[0]['title']);
    same('{"a":1}', get_history_entry($id, (int)$list[0]['id'])['data']);
});

test('history: rejects unknown tool names, empty data and oversized entries', function () {
    $id = paid_user();
    same(false, save_history($id, '<script>', '', 'x')['ok']);
    same(false, save_history($id, 'JSON Repair', '', '')['ok']);
    same(false, save_history($id, 'JSON Repair', '', str_repeat('x', 1048577))['ok']);
});

test('history: plan limit is enforced', function () {
    $id = paid_user();
    q('INSERT INTO tool_history (user_id, tool_name, data, saved_at) SELECT ?, ?, ?, ? FROM (SELECT 1 FROM information_schema.columns LIMIT 100) t', [$id, 'Other', 'x', now()]);
    same(false, save_history($id, 'Other', '', 'one more')['ok']);
});

test('history: users cannot read or delete each other\'s entries', function () {
    $a = paid_user('a@example.com');
    $b = paid_user('b@example.com');
    save_history($a, 'Other', '', 'secret of A');
    $entryId = (int)list_history($a)[0]['id'];
    same(null, get_history_entry($b, $entryId));
    same(false, delete_history_entry($b, $entryId));
    same(1, (int)q('SELECT COUNT(*) FROM tool_history')->fetchColumn());
});

test('history: delete one and delete all really remove rows', function () {
    $id = paid_user();
    save_history($id, 'Other', '', 'one');
    save_history($id, 'Other', '', 'two');
    save_history($id, 'Other', '', 'three');
    same(true, delete_history_entry($id, (int)list_history($id)[0]['id']));
    same(2, (int)q('SELECT COUNT(*) FROM tool_history')->fetchColumn());
    same(2, delete_all_history($id));
    same(0, (int)q('SELECT COUNT(*) FROM tool_history')->fetchColumn());
});

test('account deletion removes user, subscription and history; payments are kept but unlinked', function () {
    $id = paid_user();
    save_history($id, 'Other', '', 'my data');
    q('INSERT INTO payments (user_id, razorpay_order_id, tier, billing_period, amount_paise, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [$id, 'order_1', 'basic', 'monthly', 2900, 'paid', now(), now()]);
    delete_account($id);
    foreach (['users', 'subscriptions', 'tool_history'] as $t) same(0, (int)q("SELECT COUNT(*) FROM $t")->fetchColumn(), $t);
    $p = q('SELECT * FROM payments')->fetch();
    same(null, $p['user_id']);
    same(2900, (int)$p['amount_paise']);
    check(!str_contains(json_encode(q('SELECT * FROM payments')->fetchAll()), 'p@example.com'));
});

test('retention: history is purged 30 days after a plan ends, not before', function () {
    $id = paid_user();
    save_history($id, 'Other', '', 'keep me');
    q('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?', [now(time() - 29 * 86400), $id]);
    same(0, purge_expired_history());
    q('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?', [now(time() - 31 * 86400), $id]);
    same(1, purge_expired_history());
});

test('subscriptions: expire automatically and renewals extend the end date', function () {
    $id = register_user('r@example.com', 'longenoughpw')['user_id'];
    $t0 = time();
    activate_subscription($id, 'basic', 'monthly', 'pay_1', $t0);
    $first = subscription_for($id)['ends_at'];
    activate_subscription($id, 'basic', 'monthly', 'pay_2', $t0 + 86400);
    same(now(strtotime($first . ' UTC') + 30 * 86400), subscription_for($id)['ends_at'], 'renewal stacks on remaining time');
    q('UPDATE subscriptions SET ends_at = ? WHERE user_id = ?', [now(time() - 1), $id]);
    same('expired', subscription_for($id)['status']);
    same(false, has_paid_access($id));
});
