# Data retention

| Data | Where | Personal? | Kept | Deleted by |
|---|---|---|---|---|
| Photos and file names | Visitor's browser only | — | Until the tab closes | Never sent to the server |
| Saved settings, brand kit (name, logo, colours), template drafts (text and colours) | Visitor's browser storage (`localStorage`) | Possibly (a shop name or logo) | Until the visitor clears them | The visitor, in the tool or browser settings; never sent to us |
| Early-access leads | `early_access_leads` | Yes | 12 months after the last submission, or until the person asks | `database/queries/retention.sql`, `delete_person.sql` |
| Batch statistics | `batch_events` | No | 24 months | `retention.sql` |
| Rate-limit counters | `rate_limits` | No (keyed hash) | Under 1 day | Automatic cleanup in requests; `retention.sql` |
| Server logs | Hostinger | Contain IPs (host-level) | Per Hostinger | Hostinger |
| Lead CSV exports | Your computer | Yes | As short as possible | You |
| Done-for-you photos (WhatsApp) | Your phone and computer | Yes | Until the job is delivered | You (the privacy page promises this) |

## Deletion requests

1. Normalise the contact (lower-case email; Indian mobile as `+91XXXXXXXXXX`).
2. Run `database/queries/delete_person.sql` with that value.
3. Delete any exported CSVs and WhatsApp copies.
4. Reply to confirm.

## Monthly routine

1. Back up the database.
2. Run the preview section of `retention.sql`.
3. Run the delete statements.

The privacy page (`app/privacy/page.tsx`) states these periods. Change both together, and bump `CONSENT_VERSION` in `lib/validation.ts` if the consent wording changes.

_Not legal advice. India's DPDP Act obligations may apply; review with a qualified adviser before scaling._
