<?php

declare(strict_types=1);

function plans(): array
{
    return config('plans')['tiers'];
}

function plan(string $tier): ?array
{
    return plans()[$tier] ?? null;
}

/** Price in paise for a tier and period, or null if that combination is not offered. */
function plan_price_paise(string $tier, string $period): ?int
{
    $price = plan($tier)['prices'][$period] ?? null;
    return $price === null ? null : (int)round($price * 100);
}

function period_seconds(string $period): int
{
    return $period === 'yearly' ? 365 * 86400 : 30 * 86400;
}

function format_inr(int $paise): string
{
    return '₹' . number_format($paise / 100, $paise % 100 === 0 ? 0 : 2);
}
