# Accessibility and responsive design

**Target:** WCAG 2.2 AA.

**Evidence:** axe-core scans (WCAG 2.0/2.1/2.2 A and AA rule sets) on all six public pages plus two interactive states, in desktop and phone viewports: **0 violations**. Keyboard tests in e2e. Scripted accessibility-tree and keyboard-only walkthrough of both tools (0.5.1, below). **Not yet done:** a real screen-reader walkthrough (NVDA, VoiceOver) or real-device zoom tests.

## Implemented
- Skip link; one H1 per page (tested); logical H2/H3; landmarks (header, nav, main, footer, aside).
- Visible 2px focus ring on every control; no keyboard traps. The phone inspector sheet moves focus to Close, keeps Tab and Shift+Tab inside it, closes on Escape and returns focus to the photo (e2e).
- Removing a file moves focus to the next file's Remove button, or the drop zone when none are left (e2e).
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

No horizontal overflow at 360, 390, 768, 1024 or 1440 px (every public page at 360, 768 and 1024 px is checked by e2e since 0.6.0). Long file names truncate with the full name in a tooltip.

## Scripted walkthrough (0.5.1)
Headless Chromium, keyboard only, plus a scan for controls without an accessible name. **This is not a screen-reader test**: it checks names, focus order and focus handling, not how NVDA or VoiceOver actually speak the page.

| Check | Result |
|---|---|
| Every button, link and input has an accessible name (home, both tools) | Pass |
| Converter Tab order: breadcrumb → settings (each radio group one stop) → primary action → file list → drop zone → FAQ → footer | Pass, logical |
| Focus after a run | Stays on the primary button, which becomes Download ZIP |
| Result announced | Yes, `role="status"` polite: "1 ready · 7 KB → 8 KB" |
| Focus after removing a file | **Was lost (fixed)** |
| Phone sheet focus containment | **Escaped after 3 Tabs (fixed)** |

## Known gaps
- Native drag-and-drop has no keyboard equivalent, but the picker (same control) does.
- Tile image previews use empty `alt` (decorative; the name and status follow as text).
- A real screen-reader pass (NVDA + Firefox/Chrome, VoiceOver + Safari on iPhone) is still needed before launch. Listen especially for: the per-file progress status ("Processing 3 of 100…") may be chatty on large batches; the toggle groups (Shape, Background, Rotate) use `aria-pressed` buttons; the inspector's Before/After switch.
