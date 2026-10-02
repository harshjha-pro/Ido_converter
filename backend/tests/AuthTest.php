<?php

test('register: validates email and password length', function () {
    same(false, register_user('not-an-email', 'longenoughpw')['ok']);
    same(false, register_user('a@example.com', 'short')['ok']);
    same(false, register_user('a@example.com', str_repeat('x', 73))['ok'], '73-byte password refused (bcrypt limit)');
    same(true, register_user('a@example.com', 'longenoughpw')['ok']);
});

test('register: stores only a password hash, never the password', function () {
    register_user('Asha@Example.COM', 'correct horse battery');
    $row = q('SELECT * FROM users')->fetch();
    same('asha@example.com', $row['email'], 'email normalised');
    check(!str_contains(json_encode($row), 'correct horse'), 'plaintext password found in row');
    check(password_verify('correct horse battery', $row['password_hash']), 'hash does not verify');
    same('user', $row['role'], 'new users are never admins');
});

test('register: duplicate email is refused (case-insensitive)', function () {
    register_user('a@example.com', 'longenoughpw');
    same(false, register_user('A@EXAMPLE.com', 'otherpassword1')['ok']);
});

test('login: correct password logs in and sets the session', function () {
    $id = register_user('a@example.com', 'longenoughpw')['user_id'];
    $r = attempt_login('A@example.com', 'longenoughpw', '1.2.3.4');
    same(true, $r['ok']);
    same($id, $_SESSION['user_id']);
    check(current_user()['email'] === 'a@example.com');
    check(q('SELECT last_login_at FROM users')->fetchColumn() !== null, 'last_login_at set');
});

test('login: wrong password and unknown email give the same generic error', function () {
    register_user('a@example.com', 'longenoughpw');
    $wrong = attempt_login('a@example.com', 'wrongpassword', '1.2.3.4');
    $unknown = attempt_login('nobody@example.com', 'wrongpassword', '1.2.3.4');
    same(false, $wrong['ok']);
    same($wrong['error'], $unknown['error']);
    check(!isset($_SESSION['user_id']));
});

test('login: throttled after 5 failures, even with the right password', function () {
    register_user('a@example.com', 'longenoughpw');
    for ($i = 0; $i < 5; $i++) attempt_login('a@example.com', 'wrong' . $i, '1.2.3.4');
    $r = attempt_login('a@example.com', 'longenoughpw', '1.2.3.4');
    same(false, $r['ok']);
    check(str_contains($r['error'], 'Too many failed attempts'), $r['error']);
    // A different IP for the same account is a different key (the per-IP limit is separate).
    same(true, attempt_login('a@example.com', 'longenoughpw', '5.6.7.8')['ok']);
});

test('login: one IP trying many accounts hits the per-IP limit', function () {
    register_user('victim@example.com', 'longenoughpw');
    for ($i = 0; $i < 20; $i++) attempt_login("guess{$i}@example.com", 'x', '9.9.9.9');
    same(false, attempt_login('victim@example.com', 'longenoughpw', '9.9.9.9')['ok']);
});

test('login: attempts table holds only hashes, no email or IP', function () {
    attempt_login('secret.person@example.com', 'x', '203.0.113.7');
    $dump = json_encode(q('SELECT * FROM login_attempts')->fetchAll());
    check(!str_contains($dump, 'secret.person') && !str_contains($dump, '203.0.113.7'), 'raw email or IP stored');
});

test('login: success clears earlier failures for that key', function () {
    register_user('a@example.com', 'longenoughpw');
    for ($i = 0; $i < 4; $i++) attempt_login('a@example.com', 'wrong', '1.2.3.4');
    attempt_login('a@example.com', 'longenoughpw', '1.2.3.4');
    for ($i = 0; $i < 4; $i++) attempt_login('a@example.com', 'wrong', '1.2.3.4');
    same(true, attempt_login('a@example.com', 'longenoughpw', '1.2.3.4')['ok']);
});

test('logout clears the session', function () {
    register_user('a@example.com', 'longenoughpw');
    attempt_login('a@example.com', 'longenoughpw', '1.2.3.4');
    logout();
    same(null, current_user());
});

test('safe_path blocks open redirects', function () {
    same('/dashboard.php', safe_path('https://evil.example'));
    same('/dashboard.php', safe_path('//evil.example'));
    same('/dashboard.php', safe_path('/\\evil.example'));
    same('/admin/', safe_path('/admin/'));
});
