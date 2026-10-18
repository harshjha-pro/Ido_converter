# Idoconverter design system — "Inspection desk"

_Adopted 17 October 2026. Replaces the previous cream/forest system. This file is the source of truth; the `idoconverter-design` skill must match it._

## Idea

Idoconverter is a quality-control station for product photos. Every image is measured, labelled and judged. The interface is precise, calm and fast: white surfaces, dark ink, and one recognisable motif borrowed from the work itself — **crop-mark corners and blue dimension lines** drawn over images, with **Pass / Check / Fail tags**.

Decoration never stands in for information. If a line, label or colour doesn't say something about the image, remove it.

## Colour tokens

All text pairs are measured (WCAG 2.x). Status is never shown by colour alone: every tag has a text label.

### Light

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `--surface` | `#FFFFFF` | Page and panels | — |
| `--well` | `#F4F5F7` | Thumbnail wells, input fills, quiet bands | — |
| `--ink` | `#14171A` | Body text, primary button fill | 17.99 on surface, 16.49 on well |
| `--graphite` | `#545B63` | Secondary text, input borders, crop marks | 6.88 on surface, 6.30 on well |
| `--guide` | `#1F4FD1` | Links, dimension lines, focus ring | 6.78 on surface |
| `--pass` | `#1B7A4A` | Pass text | 5.34 on surface |
| `--check` | `#9A5B00` | Check text | 5.43 on surface |
| `--fail` | `#B42318` | Fail text, errors | 6.57 on surface |
| `--pass-bg` | `#E6F2EB` | Pass tag fill | pass text 4.65 |
| `--check-bg` | `#FAF0DE` | Check tag fill | check text 4.80 |
| `--fail-bg` | `#FBE8E6` | Fail tag fill | fail text 5.57 |
| `--line` | `#D5D9DE` | Dividers only (decorative, 1.42) | never for control borders |

### Dark

| Token | Hex | Contrast |
|---|---|---|
| `--surface` | `#121518` | — |
| `--well` | `#1B1F24` | — |
| `--ink` | `#E9EBEE` | 15.34 on surface |
| `--graphite` | `#A3AAB3` | 7.82 |
| `--guide` | `#8AA8FF` | 7.96 |
| `--pass` / `--pass-bg` | `#5BC992` / `#16302A` | 8.91 / 6.85 on its tag |
| `--check` / `--check-bg` | `#E8A84A` / `#33281A` | 8.84 / 6.94 |
| `--fail` / `--fail-bg` | `#FF8A7E` / `#3A1E1D` | 8.02 / 6.64 |
| `--line` | `#343A41` | dividers only |

Primary button: `--ink` fill with `--surface` text (17.99 light, 15.34 dark).

Product images are always shown on pure white (`#FFFFFF`) in both modes, because that is what the marketplace will show.

## Typography

- One family: the system sans stack — `system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Devanagari", "Helvetica Neue", Arial, sans-serif`. No web font until one is approved.
- No serif, no italic emphasis words, no all-caps labels, no monospace.
- Numbers that are compared (px, KB, %) use `font-variant-numeric: tabular-nums`.
- Scale (px): 13 / 14 / 16 (body) / 18 / 20 / 24 / 32 / 44. Body line-height 1.6; headings 1.15.
- Weights: 400 body, 600 labels and headings, 700 for the page h1 only.

## Spacing, radius, elevation

- Spacing: 4 / 8 / 16 / 24 / 32 / 64 px only.
- Radius: 4 for tags, 8 for buttons, inputs and thumbnails, 12 for panels. No pills.
- Structure comes from 1px dividers and whitespace, not cards. Panels have no shadow.
- One shadow, only for things that float above the page (dialogs, menus, sheets).

## Signature motif

- **Crop marks:** four L-shaped corners in `--graphite`, 1.5px, marking the marketplace frame around an image.
- **Dimension lines:** 1px `--guide` lines with end ticks and a label (`85% · 1600 px`), drawn along the product's bounding box.
- **Target fill:** dashed `--guide` square at the preset's fill percentage, shown only in the inspector.
- **QC tag:** 4px-radius tag with a small punched-hole dot, text `Pass`, `Check` or `Fail` in the status colour on its tag fill.

Use the motif only on images and specimens. Never as page decoration.

## Components

- **Buttons:** primary (ink fill), secondary (1px graphite border, ink text), text link (guide colour, underlined). Exactly one primary button per page section. Disabled: 45% opacity plus a visible reason.
- **Inputs:** label above, unit inside the field (`px`, `KB`, `%`), helper text below, 1px graphite border, error text in `--fail` with the fix.
- **Selection rows** (presets): full-width rows with a 2px ink left rule when selected; no card grids.
- **Filter chips:** text with count (`Fail 3`), selected = ink underline.
- **Progress:** 4px bar in `--guide`, plus a sentence ("38 of 100 · 2 failed").
- **Toasts:** bottom-centre, one at a time, optional action.
- **Skeletons:** `--well` blocks, no shimmer.
- **Empty states:** one sentence, one action. No illustrations.
- **Errors:** what happened, why, what to do next.
- **Focus:** 2px `--guide` outline, 2px offset, on every interactive element.

## Layout

- Marketing and tool pages: max content width 1200px, 12-column grid, left-aligned text.
- Tool workspace ≥1100px: settings (320px) | results grid | inspector (360px). Below that the inspector becomes a sheet.
- Must work at 360px with no sideways scrolling; wide tables scroll inside their own container.

## Rules that override everything

- No third-party CDNs on tool pages. No new font or library without approval (AGENTS.md rule 3).
- No gradients, glass effects, floating orbs, stock photography, faces, testimonial carousels or AI-sparkle icons.
- Only claim what the code does (for example, "never uploaded" only where processing is local).
- Every colour used must be a token above. State contrast ratios for any new pair.
