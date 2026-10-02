<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
require_post_with_csrf();
$r = save_history((int)$user['id'], (string)($_POST['tool_name'] ?? ''), (string)($_POST['title'] ?? ''), (string)($_POST['data'] ?? ''));
flash($r['ok'] ? 'Result saved.' : $r['error'], $r['ok'] ? 'success' : 'error');
redirect('/dashboard.php');
