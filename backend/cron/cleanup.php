<?php
// Daily retention job. Hostinger: hPanel → Advanced → Cron Jobs → "php /home/USER/account/cron/cleanup.php", once a day.
declare(strict_types=1);
require __DIR__ . '/../src/bootstrap.php';
$history = purge_expired_history();
$attempts = q('DELETE FROM login_attempts WHERE attempted_at < ?', [now(time() - 86400)])->rowCount();
echo "Deleted {$history} expired history entries and {$attempts} old login attempts.\n";
