<?php
require __DIR__ . '/../src/bootstrap.php';
$user = require_login();
require_post_with_csrf();

$tier = (string)($_POST['tier'] ?? '');
$period = (string)($_POST['period'] ?? '');
$result = razorpay_create_order((int)$user['id'], $tier, $period);
if (!$result['ok']) {
    flash($result['error'], 'error');
    redirect('/plans.php');
}
$order = $result['order'];

// Razorpay Checkout runs on Razorpay's own script and iframe; allow them on this page only.
send_security_headers([
    'script-src' => "'self' https://checkout.razorpay.com",
    'frame-src' => 'https://api.razorpay.com https://checkout.razorpay.com',
    'connect-src' => "'self' https://api.razorpay.com https://lumberjack.razorpay.com",
    'img-src' => "'self' data: https://cdn.razorpay.com",
]);
render_header('Checkout', $user);
?>
<section class="card narrow">
  <h1>Pay for <?= e(plan($tier)['name']) ?></h1>
  <p><?= e(format_inr((int)$order['amount'])) ?> for one <?= $period === 'yearly' ? 'year' : 'month' ?>. The payment window opens automatically.</p>
  <p id="checkout-status" class="muted" role="status"></p>
  <button id="pay" class="btn-primary" type="button"
    data-key="<?= e(config('razorpay')['key_id']) ?>"
    data-order="<?= e($order['id']) ?>"
    data-amount="<?= (int)$order['amount'] ?>"
    data-currency="<?= e($order['currency'] ?? 'INR') ?>"
    data-name="idoconverter"
    data-description="<?= e(plan($tier)['name'] . ' (' . $period . ')') ?>"
    data-email="<?= e($user['email']) ?>">Pay now</button>
  <p><a href="/plans.php">Cancel and go back</a></p>
  <form id="verify" method="post" action="/payment-verify.php" hidden>
    <?= csrf_field() ?>
    <input type="hidden" name="razorpay_order_id">
    <input type="hidden" name="razorpay_payment_id">
    <input type="hidden" name="razorpay_signature">
  </form>
</section>
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
<script src="/assets/checkout.js"></script>
<?php render_footer();
