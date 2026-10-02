<?php
require __DIR__ . '/../../src/bootstrap.php';

$admin = require_admin();
$search = trim((string)($_GET['q'] ?? ''));
$page = max(1, (int)($_GET['page'] ?? 1));
$users = admin_list_users($search, $page);
$stats = admin_stats();
$log = q('SELECT l.created_at, l.action, l.target_user_id, l.details, a.email AS admin_email FROM admin_audit_log l LEFT JOIN users a ON a.id = l.admin_user_id ORDER BY l.id DESC LIMIT 30')->fetchAll();

render_header('Admin', $admin);
?>
<h1>Admin</h1>
<section class="card">
  <p><strong><?= $stats['users'] ?></strong> users · <strong><?= $stats['active'] ?></strong> with paid access · <strong><?= e(format_inr($stats['revenue_paise'])) ?></strong> paid in total</p>
  <h2>Saved results by tool (counts only)</h2>
  <?php if (!$stats['tool_usage']): ?><p class="muted">None yet.</p><?php else: ?>
    <ul><?php foreach ($stats['tool_usage'] as $u): ?><li><?= e($u['tool_name']) ?>: <?= (int)$u['saves'] ?></li><?php endforeach; ?></ul>
  <?php endif; ?>
</section>

<section class="card">
  <h2>Users</h2>
  <form method="get" class="form"><label>Search by email <input type="search" name="q" value="<?= e($search) ?>"></label><button class="btn-secondary" type="submit">Search</button></form>
  <div class="table-wrap"><table>
    <thead><tr><th>Email</th><th>Signed up</th><th>Plan</th><th>Status</th><th>Ends (UTC)</th><th>Change subscription</th></tr></thead>
    <tbody>
    <?php foreach ($users as $u): ?>
      <tr>
        <td><?= e($u['email']) ?><?= $u['role'] === 'admin' ? ' <strong>(admin)</strong>' : '' ?></td>
        <td><?= e(substr($u['created_at'], 0, 10)) ?></td>
        <td><?= e($u['tier'] ? (plan($u['tier'])['name'] ?? $u['tier']) : 'Free') ?></td>
        <td><?= e($u['status'] ?? '—') ?></td>
        <td><?= e($u['ends_at'] ? substr($u['ends_at'], 0, 10) : '—') ?></td>
        <td>
          <form method="post" action="/admin/subscription.php" class="form">
            <?= csrf_field() ?>
            <input type="hidden" name="user_id" value="<?= (int)$u['id'] ?>">
            <label>Action
              <select name="action">
                <option value="extend">Grant / extend</option>
                <option value="cancel_at_end">Cancel at period end</option>
                <option value="cancel_now">Cancel now (refund)</option>
              </select>
            </label>
            <label>Plan
              <select name="tier"><?php foreach (plans() as $key => $p): ?><option value="<?= e($key) ?>" <?= $u['tier'] === $key ? 'selected' : '' ?>><?= e($p['name']) ?></option><?php endforeach; ?></select>
            </label>
            <label>Days (grant/extend) <input type="number" name="days" min="1" max="366" value="30"></label>
            <label>Reason <input type="text" name="reason" maxlength="200"></label>
            <button class="btn-secondary" type="submit">Apply</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <p><?php if ($page > 1): ?><a href="?q=<?= e(rawurlencode($search)) ?>&page=<?= $page - 1 ?>">&larr; Newer</a> <?php endif; ?>
     <?php if (count($users) === 50): ?><a href="?q=<?= e(rawurlencode($search)) ?>&page=<?= $page + 1 ?>">Older &rarr;</a><?php endif; ?></p>
</section>

<section class="card">
  <h2>Audit log (latest 30)</h2>
  <div class="table-wrap"><table>
    <thead><tr><th>When (UTC)</th><th>Admin</th><th>Action</th><th>User id</th><th>Details</th></tr></thead>
    <tbody><?php foreach ($log as $l): ?>
      <tr><td><?= e($l['created_at']) ?></td><td><?= e($l['admin_email'] ?? '(deleted)') ?></td><td><?= e($l['action']) ?></td><td><?= e((string)$l['target_user_id']) ?></td><td><?= e($l['details']) ?></td></tr>
    <?php endforeach; ?></tbody>
  </table></div>
</section>
<?php render_footer();
