-- validation_metrics.sql — read-only reports for the go/no-go decision. Safe to run any time.
-- Real usage excludes sample-photo demos (used_samples = 0).

-- Weekly batches, photos and outcomes
SELECT DATE_FORMAT(created_at, '%x-W%v') AS iso_week,
       COUNT(*) AS batches,
       SUM(processed_count) AS photos,
       ROUND(100 * SUM(pass_count) / NULLIF(SUM(processed_count), 0), 1) AS pass_pct,
       ROUND(100 * SUM(fail_count) / NULLIF(SUM(processed_count), 0), 1) AS fail_pct,
       SUM(cancelled) AS cancelled_batches
FROM batch_events
WHERE used_samples = 0
GROUP BY iso_week
ORDER BY iso_week DESC;

-- Which marketplaces people actually prepare for
SELECT preset_key, COUNT(*) AS batches, SUM(processed_count) AS photos,
       ROUND(AVG(processed_count), 1) AS avg_batch_size
FROM batch_events WHERE used_samples = 0
GROUP BY preset_key ORDER BY photos DESC;

-- Device mix and speed (seconds per photo)
SELECT device_class, COUNT(*) AS batches,
       ROUND(SUM(duration_ms) / 1000 / NULLIF(SUM(processed_count), 0), 2) AS sec_per_photo,
       SUM(used_worker = 0) AS without_worker
FROM batch_events WHERE used_samples = 0
GROUP BY device_class;

-- Early-access sign-ups by segment and volume
SELECT role, monthly_photos, COUNT(*) AS leads
FROM early_access_leads
GROUP BY role, monthly_photos
ORDER BY role, FIELD(monthly_photos, 'under_50','50_200','200_1000','over_1000');
