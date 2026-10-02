<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
$entry = get_history_entry((int)$user['id'], (int)($_GET['id'] ?? 0));
if (!$entry) {
    http_response_code(404);   // same answer for "not yours" and "does not exist"
    render_header('Not found', $user);
    echo '<p>That saved result does not exist.</p><p><a href="/dashboard.php">Back to dashboard</a></p>';
    render_footer();
    exit;
}
render_header($entry['title'] ?: $entry['tool_name'], $user);
?>
<p><a href="/dashboard.php">&larr; Back to dashboard</a></p>
<section class="card">
  <h1><?= e($entry['title'] ?: $entry['tool_name']) ?></h1>
  <p class="muted"><?= e($entry['tool_name']) ?> · saved <?= e($entry['saved_at']) ?> UTC</p>
  <pre class="saved"><?= e($entry['data']) ?></pre>
  <form method="post" action="/history-delete.php" class="inline"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int)$entry['id'] ?>"><button class="btn-danger" type="submit">Delete</button></form>
</section>
<?php render_footer();
