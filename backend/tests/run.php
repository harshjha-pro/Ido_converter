<?php
// Minimal test runner (no PHPUnit dependency): php backend/tests/run.php
// Needs a MySQL/MariaDB test database; see tests/config.test.php.

declare(strict_types=1);

putenv('IDO_CONFIG=' . __DIR__ . '/config.test.php');
require __DIR__ . '/../src/bootstrap.php';
restore_exception_handler();

$GLOBALS['__tests'] = [];
function test(string $name, callable $fn): void { $GLOBALS['__tests'][] = [$name, $fn]; }
function check(bool $cond, string $message = 'assertion failed'): void { if (!$cond) throw new RuntimeException($message); }
function same(mixed $expected, mixed $actual, string $label = ''): void
{
    if ($expected !== $actual) throw new RuntimeException(($label ? "$label: " : '') . 'expected ' . var_export($expected, true) . ', got ' . var_export($actual, true));
}

function reset_db(): void
{
    $pdo = db();
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 0');
    foreach ($pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN) as $t) $pdo->exec("DROP TABLE `$t`");
    $pdo->exec('SET FOREIGN_KEY_CHECKS = 1');
    $pdo->exec(file_get_contents(__DIR__ . '/../schema.sql'));
    $_SESSION = [];
}

foreach (glob(__DIR__ . '/*Test.php') as $file) require $file;

$failed = 0;
foreach ($GLOBALS['__tests'] as [$name, $fn]) {
    reset_db();
    try {
        $fn();
        echo "  ✓ $name\n";
    } catch (Throwable $e) {
        $failed++;
        echo "  ✗ $name\n      " . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ")\n";
    }
}
$total = count($GLOBALS['__tests']);
echo "\n" . ($total - $failed) . "/$total passed\n";
exit($failed ? 1 : 0);
