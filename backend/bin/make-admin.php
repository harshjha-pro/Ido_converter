<?php
// Grants (or with --revoke removes) admin rights. Run on the server, never from the web:
//   php bin/make-admin.php someone@example.com
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../src/bootstrap.php';
$email = normalize_email($argv[1] ?? '');
$role = in_array('--revoke', $argv, true) ? 'user' : 'admin';
$n = q('UPDATE users SET role = ? WHERE email = ?', [$role, $email])->rowCount();
echo $n ? "{$email} is now '{$role}'.\n" : "No change: no user {$email}, or already '{$role}'.\n";
exit($n ? 0 : 1);
