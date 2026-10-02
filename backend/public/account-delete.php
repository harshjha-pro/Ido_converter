<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
require_post_with_csrf();
if (!verify_password_for((int)$user['id'], (string)($_POST['password'] ?? ''))) {
    flash('Password is incorrect; your account was not deleted.', 'error');
    redirect('/dashboard.php');
}
delete_account((int)$user['id']);
logout();
start_session();
flash('Your account and all saved results have been permanently deleted.');
redirect('/login.php');
