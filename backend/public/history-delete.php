<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
require_post_with_csrf();
if (!empty($_POST['all'])) {
    if (empty($_POST['confirm'])) {
        flash('Tick the box to confirm deleting everything.', 'error');
    } else {
        $n = delete_all_history((int)$user['id']);
        flash("Deleted {$n} saved results.");
    }
} else {
    $ok = delete_history_entry((int)$user['id'], (int)($_POST['id'] ?? 0));
    flash($ok ? 'Saved result deleted.' : 'That saved result does not exist.', $ok ? 'success' : 'error');
}
redirect('/dashboard.php');
