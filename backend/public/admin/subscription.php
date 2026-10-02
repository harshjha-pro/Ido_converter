<?php
require __DIR__ . '/../../src/bootstrap.php';
$admin = require_admin();
require_post_with_csrf();
$r = admin_change_subscription((int)$admin['id'], (int)($_POST['user_id'] ?? 0), (string)($_POST['action'] ?? ''), $_POST);
flash($r['ok'] ? 'Subscription updated.' : $r['error'], $r['ok'] ? 'success' : 'error');
redirect('/admin/');
