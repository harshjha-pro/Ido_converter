<?php
require __DIR__ . '/../src/bootstrap.php';

$next = safe_path($_GET['next'] ?? $_POST['next'] ?? null);
if (current_user()) redirect($next);

$error = null;
$email = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    require_post_with_csrf();
    $email = (string)($_POST['email'] ?? '');
    $result = attempt_login($email, (string)($_POST['password'] ?? ''), client_ip());
    if ($result['ok']) redirect($next);
    $error = $result['error'];
}

render_header('Log in');
?>
<section class="card narrow">
  <h1>Log in</h1>
  <?php if ($error): ?><p class="flash error" role="alert"><?= e($error) ?></p><?php endif; ?>
  <form method="post" class="form">
    <?= csrf_field() ?>
    <input type="hidden" name="next" value="<?= e($next) ?>">
    <label>Email <input type="email" name="email" value="<?= e($email) ?>" autocomplete="email" required></label>
    <label>Password <input type="password" name="password" autocomplete="current-password" required></label>
    <button class="btn-primary" type="submit">Log in</button>
  </form>
  <p class="muted">No account yet? <a href="/register.php">Create one</a>.</p>
</section>
<?php render_footer();
