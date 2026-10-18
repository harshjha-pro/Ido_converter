# Accessibility and responsive design

**Target:** WCAG 2.2 AA.

**Evidence:** axe-core scans (WCAG 2.0/2.1/2.2 A and AA rule sets) on all six public pages plus two interactive states, in desktop and phone viewports: **0 violations**. Manual keyboard tests in e2e. **Not yet done:** screen-reader walkthrough or real-device zoom tests.

## Implemented
- Skip link; one H1 per page (tested); logical H2/H3; landmarks (header, nav, main, footer, aside).
- Visible 2px focus ring on every control; no keyboard traps; the inspector sheet moves focus to Close, Escape closes it, and focus returns to the photo.
- Labels on every input. Errors linked with `aria-describedby`, `aria-invalid`, and focus moves to the first invalid field. Status updates in `role="status"` live regions.
- Status is never colour-only (Pass/Check/Fail text). All text pairs meet 4.5:1 (ratios in DESIGN.md).
- Touch targets at least 44px for primary controls; the radio and checkbox rows are full-width hit areas.
- `prefers-reduced-motion` disables the scan animation and transitions; dark mode via `prefers-color-scheme`.

## Responsive behaviour
| Width | Layout |
|---|---|
| ≤ 480 | Single column; header shows logo + Menu; tool actions in a fixed bottom bar; inspector as a bottom sheet |
| 481–960 | Hamburger menu; tool settings above results |
| 961–1099 | Full navigation; settings above results; inspector as a sheet |
| ≥ 1100 | Three-zone tool layout (settings, results, inspector) |

No horizontal overflow at 360, 390, 768 or 1440 px (tested). Long file names truncate with the full name in a tooltip.

## Known gaps
- Native drag-and-drop has no keyboard equivalent, but the picker (same control) does.
- Tile image previews use empty `alt` (decorative; the name and status follow as text).
- A screen-reader pass is needed before launch.
