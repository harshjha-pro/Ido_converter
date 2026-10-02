<?php

declare(strict_types=1);

function e(?string $s): string
{
    return htmlspecialchars((string)$s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Same-site relative paths only, so ?next= cannot redirect people to another site. */
function safe_path(?string $path, string $fallback = '/dashboard.php'): string
{
    if ($path === null || $path === '' || !str_starts_with($path, '/') || str_starts_with($path, '//') || str_contains($path, '\\')) {
        return $fallback;
    }
    return $path;
}

function redirect(string $path): never
{
    header('Location: ' . safe_path($path, '/'), true, 303);
    exit;
}

function flash(?string $message = null, string $kind = 'success'): ?array
{
    if ($message !== null) {
        $_SESSION['flash'] = ['message' => $message, 'kind' => $kind];
        return null;
    }
    $f = $_SESSION['flash'] ?? null;
    unset($_SESSION['flash']);
    return $f;
}

function render_header(string $title, ?array $user = null): void
{
    $tools = e((string)config('tools_url'));
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex">'
        . '<title>' . e($title) . ' | idoconverter account</title>'
        . '<link rel="stylesheet" href="/assets/account.css"></head><body>'
        // The banner makes it obvious this is the account area, not a free no-account tool.
        . '<div class="account-banner">Account area: data you save here is stored on our server. '
        . 'The free tools at <a href="' . $tools . '">idoconverter</a> never store anything.</div>'
        . '<header class="account-header"><a class="brand" href="/">idoconverter <em>account</em></a><nav>';
    if ($user) {
        echo '<a href="/dashboard.php">Dashboard</a>';
        if ($user['role'] === 'admin') echo '<a href="/admin/">Admin</a>';
        echo '<form method="post" action="/logout.php" class="inline">' . csrf_field() . '<button class="link-btn" type="submit">Log out</button></form>';
    } else {
        echo '<a href="/login.php">Log in</a><a href="/register.php">Create account</a>';
    }
    echo '</nav></header><main class="account-main">';
    if ($f = flash()) {
        echo '<p class="flash ' . e($f['kind']) . '" role="status">' . e($f['message']) . '</p>';
    }
}

function render_footer(): void
{
    echo '</main><footer class="account-footer"><a href="' . e((string)config('tools_url')) . '/privacy/">Privacy</a> · '
        . '<a href="' . e((string)config('tools_url')) . '/terms/">Terms</a></footer></body></html>';
}

function client_ip(): string
{
    // REMOTE_ADDR only: X-Forwarded-For can be forged by the client, which would defeat throttling.
    return (string)($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
}
