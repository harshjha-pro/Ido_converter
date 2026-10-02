<?php
require __DIR__ . '/../src/bootstrap.php';

if (current_user()) redirect('/dashboard.php');

$error = null;
$email = '';
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    require_post_with_csrf();
    $email = (string)($_POST['email'] ?? '');
    $password = (string)($_POST['password'] ?? '');
    if ($password !== (string)($_POST['password_confirm'] ?? '')) {
        $error = 'The two passwords do not match.';
    } else {
        $result = register_user($email, $password);
        if ($result['ok']) {
            attempt_login($email, $password, client_ip());
            flash('Your account is ready.');
            redirect('/dashboard.php');
        }
        $error = $result['error'];
    }
}

render_header('Create account');
?>
<section class="card narrow">
  <h1>Create an account</h1>
  <p class="muted">You only need an account to save results on a paid plan. Every tool is free without one.</p>
  <?php if ($error): ?><p class="flash error" role="alert"><?= e($error) ?></p><?php endif; ?>
  <form method="post" class="form">
    <?= csrf_field() ?>
    <label>Email <input type="email" name="email" value="<?= e($email) ?>" maxlength="254" autocomplete="email" required></label>
    <label>Password (at least <?= PASSWORD_MIN ?> characters) <input type="password" name="password" minlength="<?= PASSWORD_MIN ?>" maxlength="72" autocomplete="new-password" required></label>
    <label>Repeat password <input type="password" name="password_confirm" minlength="<?= PASSWORD_MIN ?>" maxlength="72" autocomplete="new-password" required></label>
    <button class="btn-primary" type="submit">Create account</button>
  </form>
  <p class="muted">Already have an account? <a href="/login.php">Log in</a>.</p>
</section>
<?php render_footer();
