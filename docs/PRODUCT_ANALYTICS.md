# Product analytics

**Principle:** measure what the validation plan needs, with no cookies, no third-party analytics and no identifiers.

## Implemented events
| Event | When | Fields | Where |
|---|---|---|---|
| `batch_completed` | Product-photo batch finishes (including stopped batches) | preset, photo and processed counts, pass/check/fail, duration, output size, device class, worker used, cancelled, sample photos | `batch_events` table via `/api/events/batch` |
| `early_access_signup` | Form submitted | role, marketplaces, monthly volume, source page (plus the contact, which is personal data) | `early_access_leads` |

**Not sent:** images, file names, IP addresses, user agents, or anything at all when the browser signals Global Privacy Control.

**Not tracked yet:** converter usage (the `batch_events` schema is product-photo specific). Add a migration, `converter_events`, only if converter usage matters to a decision.

## Funnel (validation)
Visit (Hostinger logs or Search Console) → batch with own photos (`used_samples = 0`) → repeat batch (interviews; no IDs exist) → sign-up → paid pilot (manual record).

## Reports
`database/queries/validation_metrics.sql`: weekly batches and pass/fail rates, presets, device speed, and sign-ups by segment.
