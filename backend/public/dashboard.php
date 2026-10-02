<?php
require __DIR__ . '/../src/bootstrap.php';

$user = require_login();
purge_expired_history();   // apply the retention rule even if the daily cron is not set up
$sub = subscription_for((int)$user['id']);
$paid = has_paid_access((int)$user['id']);
$history = list_history((int)$user['id']);

render_header('Dashboard', $user);
?>
<h1>Your account</h1>
<section class="card">
  <h2>Plan</h2>
  <p>Signed in as <strong><?= e($user['email']) ?></strong>.</p>
  <?php if ($sub): ?>
    <p><strong><?= e(plan($sub['tier'])['name'] ?? $sub['tier']) ?></strong> (<?= e($sub['billing_period']) ?>):
      <?= e($sub['status']) ?>, <?= $sub['status'] === 'expired' ? 'ended' : 'access until' ?> <?= e(substr($sub['ends_at'], 0, 10)) ?> (UTC).</p>
    <?php if ($sub['status'] === 'expired'): ?>
      <p class="notice">Your saved results are deleted <?= (int)config('plans')['history_grace_days'] ?> days after a plan ends. Renew to keep them.</p>
    <?php endif; ?>
  <?php else: ?>
    <p>You are on the free plan: every tool, no storage.</p>
  <?php endif; ?>
  <p><a class="btn-secondary" href="/plans.php"><?= $paid ? 'Renew or change plan' : 'See paid plans' ?></a></p>
</section>

<section class="card">
  <h2>Save a result</h2>
  <?php if ($paid): ?>
    <p class="muted">Paste a result from one of the tools to keep it here. Only save what you are happy to store on our server: this is the one place we keep your data.</p>
    <form method="post" action="/history-save.php" class="form">
      <?= csrf_field() ?>
      <label>Tool
        <select name="tool_name" required>
          <?php foreach (HISTORY_TOOLS as $t): ?><option><?= e($t) ?></option><?php endforeach; ?>
        </select>
      </label>
      <label>Title (optional) <input type="text" name="title" maxlength="200"></label>
      <label>Result <textarea name="data" required></textarea></label>
      <button class="btn-primary" type="submit">Save result</button>
    </form>
  <?php else: ?>
    <p class="muted">Saving results needs a paid plan.</p>
  <?php endif; ?>
</section>

<section class="card">
  <h2>Saved results (<?= count($history) ?>)</h2>
  <?php if (!$history): ?>
    <p class="muted">Nothing saved.</p>
  <?php else: ?>
    <div class="table-wrap"><table>
      <thead><tr><th>Tool</th><th>Title</th><th>Saved (UTC)</th><th>Size</th><th></th></tr></thead>
      <tbody>
      <?php foreach ($history as $h): ?>
        <tr>
          <td><?= e($h['tool_name']) ?></td>
          <td><?= e($h['title'] ?: '—') ?></td>
          <td><?= e(substr($h['saved_at'], 0, 16)) ?></td>
          <td><?= e(number_format((int)$h['bytes'] / 1024, 1)) ?> KB</td>
          <td>
            <a href="/history-view.php?id=<?= (int)$h['id'] ?>">View</a>
            <form method="post" action="/history-delete.php" class="inline"><?= csrf_field() ?><input type="hidden" name="id" value="<?= (int)$h['id'] ?>"><button class="link-btn" type="submit">Delete</button></form>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table></div>
    <form method="post" action="/history-delete.php" class="form spaced">
      <?= csrf_field() ?>
      <input type="hidden" name="all" value="1">
      <label><span><input type="checkbox" name="confirm" value="1" required> Yes, permanently delete all my saved results</span></label>
      <button class="btn-danger" type="submit">Delete all saved results</button>
    </form>
  <?php endif; ?>
</section>

<section class="card">
  <h2>Delete account</h2>
  <p class="muted">Permanently deletes your account, plan and every saved result. This cannot be undone. Payment records are kept for accounting without your email.</p>
  <form method="post" action="/account-delete.php" class="form">
    <?= csrf_field() ?>
    <label>Enter your password to confirm <input type="password" name="password" autocomplete="current-password" required></label>
    <button class="btn-danger" type="submit">Delete my account</button>
  </form>
</section>
<?php render_footer();
