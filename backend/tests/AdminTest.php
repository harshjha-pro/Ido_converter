<?php

test('admin: extend creates or extends a subscription and is audited', function () {
    $admin = register_user('admin@example.com', 'longenoughpw')['user_id'];
    $user = register_user('u@example.com', 'longenoughpw')['user_id'];
    same(true, admin_change_subscription($admin, $user, 'extend', ['tier' => 'plus', 'days' => 10])['ok']);
    $sub = subscription_for($user);
    same('plus', $sub['tier']);
    same('active', $sub['status']);
    $log = q('SELECT * FROM admin_audit_log')->fetch();
    same('subscription_extend', $log['action']);
    same($user, (int)$log['target_user_id']);
});

test('admin: cancel now removes paid access immediately; cancel at end keeps it until ends_at', function () {
    $admin = register_user('admin@example.com', 'longenoughpw')['user_id'];
    $u1 = register_user('u1@example.com', 'longenoughpw')['user_id'];
    $u2 = register_user('u2@example.com', 'longenoughpw')['user_id'];
    activate_subscription($u1, 'basic', 'monthly', 'p1');
    activate_subscription($u2, 'basic', 'monthly', 'p2');
    admin_change_subscription($admin, $u1, 'cancel_now', ['reason' => 'refund']);
    admin_change_subscription($admin, $u2, 'cancel_at_end', []);
    same(false, has_paid_access($u1));
    same(true, has_paid_access($u2));
    same('cancelled', subscription_for($u2)['status']);
});

test('admin: rejects bad input', function () {
    $admin = register_user('admin@example.com', 'longenoughpw')['user_id'];
    $user = register_user('u@example.com', 'longenoughpw')['user_id'];
    same(false, admin_change_subscription($admin, $user, 'extend', ['tier' => 'gold', 'days' => 10])['ok']);
    same(false, admin_change_subscription($admin, $user, 'extend', ['tier' => 'basic', 'days' => 9999])['ok']);
    same(false, admin_change_subscription($admin, 999, 'extend', ['tier' => 'basic', 'days' => 1])['ok']);
    same(false, admin_change_subscription($admin, $user, 'drop_table', [])['ok']);
    same(0, (int)q('SELECT COUNT(*) FROM admin_audit_log')->fetchColumn());
});

test('admin: stats show tool usage counts but never saved content', function () {
    $user = register_user('u@example.com', 'longenoughpw')['user_id'];
    activate_subscription($user, 'basic', 'monthly', 'p');
    save_history($user, 'JSON Repair', 'private title', 'TOP SECRET CONTENT');
    $stats = admin_stats();
    same([['tool_name' => 'JSON Repair', 'saves' => 1]], array_map(fn($r) => ['tool_name' => $r['tool_name'], 'saves' => (int)$r['saves']], $stats['tool_usage']));
    check(!str_contains(json_encode($stats), 'TOP SECRET') && !str_contains(json_encode($stats), 'private title'));
});

test('admin: user search escapes LIKE wildcards and paginates with integer binding', function () {
    register_user('a_b@example.com', 'longenoughpw');
    register_user('axb@example.com', 'longenoughpw');
    same(['a_b@example.com'], array_column(admin_list_users('a_b', 1), 'email'));
    same(2, count(admin_list_users('', 1)));
    same(0, count(admin_list_users('', 2)));
});
