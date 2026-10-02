<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
render_header('Plans', $user);
?>
<h1>Paid plans</h1>
<p class="notice">Plans, prices and features are <strong>not final</strong> yet. Every tool stays free without a plan; paid plans add saved history.</p>
<?php if (!razorpay_configured()): ?><p class="flash error">Payments are not set up yet, so plans cannot be bought right now.</p><?php endif; ?>
<div class="plans">
  <?php foreach (plans() as $key => $p): ?>
    <section class="plan">
      <h3><?= e($p['name']) ?></h3>
      <ul><?php foreach ($p['features'] as $f): ?><li><?= e($f) ?></li><?php endforeach; ?></ul>
      <p class="muted">Saves up to <?= (int)$p['history_limit'] ?> results.</p>
      <?php foreach ($p['prices'] as $period => $price): ?>
        <form method="post" action="/checkout.php" class="form spaced">
          <?= csrf_field() ?>
          <input type="hidden" name="tier" value="<?= e($key) ?>">
          <input type="hidden" name="period" value="<?= e($period) ?>">
          <button class="btn-secondary" type="submit" <?= razorpay_configured() ? '' : 'disabled' ?>><?= e(format_inr(plan_price_paise($key, $period))) ?> / <?= $period === 'yearly' ? 'year' : 'month' ?></button>
        </form>
      <?php endforeach; ?>
    </section>
  <?php endforeach; ?>
</div>
<p class="muted">Payments are processed by Razorpay. We never see or store your card or UPI details. Plans do not renew automatically: pay again to extend.</p>
<?php render_footer();
