# Screenshots to take (1280 × 800 or 640 × 400, PNG)

1. **Right-click menu:** a page with sample JSON selected (use fake data, for example from `tests/fixtures/json-pii-masker/normal.json`), right-click open, showing *JSON Privacy Masker →* and its three options.
2. **Masked result:** the popup after "Mask sensitive values (JSON)", showing the [REDACTED] output and the status line.
3. **Consistent fakes:** the popup after "Replace with consistent fakes" on JSON where the same email appears twice, showing the same fake in both places.
4. **Secret scrubbing:** a log with fake keys (for example from `tests/fixtures/secret-scrubber/leak.log`) after "Scrub secrets", showing [REDACTED:type] labels.
5. **Privacy:** the popup header with "Runs locally. Nothing is uploaded." and the review note visible.

Optional small promo tile (440 × 280): the shield icon on the cream background with "Mask before you share".

Use only fake data in every screenshot.
