# Tool spec: Visa and Passport Photo Sizer

**URL:** `/forms/visa-passport-photo-sizer` | **Core:** `core/forms/visa-photo-sizer.ts` + `core/forms/visa-photo-presets.json` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*
**Publishing status:** built, **not listed** until every preset has `reviewedBy` filled (AGENTS.md rule 5). The page shows a "pending review" banner until then.

## Countries (chosen by Claude on 2026-10-02, at the team's request)

India (main audience), USA and UK: common destinations with clear official photo pages. Five presets:

| Preset | Output | File-size rule |
|---|---|---|
| India passport, printed | 413 × 531 px (35 × 45 mm at 300 DPI) | none |
| USA visa, digital (DS-160 / DV) | 600 × 600 px | JPEG ≤ 240 kB |
| USA passport, printed | 600 × 600 px (2 × 2 in at 300 DPI) | none |
| UK passport, digital | 900 × 1125 px (≥ 600 × 750 official minimum) | 50 KB–10 MB |
| UK passport, printed | 413 × 531 px (35 × 45 mm at 300 DPI) | none |

Every value has a source and last-checked date in `docs/rules-and-sources.md`. Derived numbers (300 DPI, UK 4:5 shape) are labelled as idoconverter's choice on the page.

## How it works (all in the browser)

1. Choose a preset: the page shows its rules, output size, source link and last-checked date.
2. Pick a JPEG, PNG or WebP photo (`createImageBitmap`, EXIF orientation respected). HEIC gets a clear "not supported" message.
3. Zoom (1–4×) and left/right, up/down sliders (keyboard-operable) move a crop of the exact output shape; `computeCrop()` keeps it inside the image.
4. Create photo: canvas resize to the exact pixel size on a white base (no black areas from transparency), JPEG encode, and `findQuality()` searches the highest quality that fits the max size or reaches the min size.
5. Download (`<preset>-<w>x<h>.jpg`). Warns if the crop had to be enlarged (soft result) or a size rule cannot be met.

Not done by the tool (said on the page): background change, face detection, lighting or expression checks.

## Disclaimer on the page

"Not official advice. Verify the requirements with the official portal before you submit." Plus source and last-checked date for the selected preset.

## Tests (`tests/forms/visa-photo-sizer.test.ts`)

Preset data rules (2–3 countries, official https source, date, print aspect = mm aspect, UK/US digital size ranges, unpublishable without reviewers), crop math fixtures (`tests/fixtures/visa-photo-sizer/crops.json`) and invariants (shape kept, inside image), invalid input, and the file-size search with a synthetic encoder (no limit, under 240 KB, reach a 50 KB minimum, impossible min/max).
