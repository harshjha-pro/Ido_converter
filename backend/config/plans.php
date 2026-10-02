<?php
// Paid plans. EVERY NUMBER HERE IS UNCONFIRMED (NOTES.md open questions 7-9, PRD section 10):
// the prices are the team's numbers as written, the features are the PRD's draft table, and the
// retention rule was chosen by Claude as a placeholder. Confirm all of it before taking real payments.

declare(strict_types=1);

return [
    'currency' => 'INR',

    'tiers' => [
        'basic' => [
            'name' => 'Basic',
            // UNCONFIRMED: ₹89/year is a 74% discount on 12 × ₹29 (open question 7).
            'prices' => ['monthly' => 29, 'yearly' => 89],
            'history_limit' => 100,          // saved results
            'storage_limit_mb' => 50,
            'features' => ['All tools', 'Saved history', 'No ads'],
        ],
        'plus' => [
            'name' => 'Plus',
            // UNCONFIRMED: period and whether a yearly price exists (open question 8).
            'prices' => ['monthly' => 129],
            'history_limit' => 1000,
            'storage_limit_mb' => 500,
            'features' => ['All tools', 'Saved history', 'No ads', 'Batch processing (planned)'],
        ],
        'premium' => [
            'name' => 'Premium',
            'prices' => ['monthly' => 429],
            'history_limit' => 10000,
            'storage_limit_mb' => 2048,
            'features' => ['All tools', 'Saved history', 'No ads', 'Batch processing (planned)', 'Priority support'],
        ],
    ],

    // Retention (placeholder, open question 11): saved history is kept until the user deletes it,
    // or this many days after the subscription ends, whichever comes first. Deleting the account
    // deletes everything immediately. Payment records are kept without the user link (accounting).
    'history_grace_days' => 30,

    // Largest single saved result.
    'max_history_entry_bytes' => 1048576,
];
