<?php

declare(strict_types=1);

// Every query goes through prepared statements with bound parameters. Never build SQL from input.
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config('db');
        $pdo = new PDO($c['dsn'], $c['user'], $c['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,       // real server-side prepared statements
        ]);
    }
    return $pdo;
}

function q(string $sql, array $params = []): PDOStatement
{
    $stmt = db()->prepare($sql);
    $stmt->execute($params);
    return $stmt;
}

/** All timestamps are stored in UTC. */
function now(?int $time = null): string
{
    return gmdate('Y-m-d H:i:s', $time ?? time());
}
