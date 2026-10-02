// Opens Razorpay Checkout and posts the result to our server for verification.
// Nothing here activates a plan: payment-verify.php checks the signature and asks Razorpay's API.
(function () {
  var btn = document.getElementById('pay');
  var status = document.getElementById('checkout-status');
  var form = document.getElementById('verify');
  if (!btn || typeof Razorpay === 'undefined') {
    if (status) status.textContent = 'The payment window could not load. Check your connection or ad blocker and reload.';
    return;
  }
  var d = btn.dataset;
  var rzp = new Razorpay({
    key: d.key,
    order_id: d.order,
    amount: d.amount,
    currency: d.currency,
    name: d.name,
    description: d.description,
    prefill: { email: d.email },
    theme: { color: '#12382A' },
    handler: function (resp) {
      status.textContent = 'Verifying payment…';
      form.elements.razorpay_order_id.value = resp.razorpay_order_id;
      form.elements.razorpay_payment_id.value = resp.razorpay_payment_id;
      form.elements.razorpay_signature.value = resp.razorpay_signature;
      form.submit();
    },
    modal: {
      ondismiss: function () { status.textContent = 'Payment cancelled. You have not been charged.'; }
    }
  });
  rzp.on('payment.failed', function (resp) {
    status.textContent = 'Payment failed: ' + ((resp.error && resp.error.description) || 'please try again') + '.';
  });
  btn.addEventListener('click', function () { rzp.open(); });
  rzp.open();
})();
