# JSON Privacy Masker (browser extension)

**Single purpose:** select JSON or text on a web page, mask sensitive values locally, and copy the safe version.

Reuses `core/developers/json-pii-masker.ts`, `pseudonymizer.ts` and `secret-scrubber.ts` directly (no copied logic).

## Permissions

| Permission | Why |
|---|---|
| `contextMenus` | Adds the right-click "JSON Privacy Masker" menu on selected text; Chrome passes the selected text with the click, so no access to page content is needed. |

Not requested: `activeTab`, `scripting`, `storage`, `clipboardWrite`, host permissions. Copying happens from the popup on a user click, which needs no permission. The extension page CSP sets `connect-src 'none'`, and the build fails if network-capable code appears in the bundle.

## Build and load (Chrome or Edge)

1. `npm install` (once), then `npm run build:extension`.
2. Open `chrome://extensions` (or `edge://extensions`), turn on **Developer mode**.
3. Click **Load unpacked** and choose `extension/json-privacy-masker/dist`.
4. Pin the extension. Select some JSON or log text on any page, right-click → **JSON Privacy Masker** → pick a mode. The popup opens with the result (or the icon shows a "1" badge; click it). Or open the popup and paste text.

## Notes

- The right-click selection and result are held in the service worker's memory only and cleared when the popup reads them. Nothing is written to storage.
- Chrome passes the selection as plain text; some pages collapse line breaks in it. For multi-line logs, pasting into the popup keeps line numbers accurate.
- Firefox needs `background.scripts` instead of `background.service_worker`; to be handled when testing Firefox (Milestone 4, task 4.5).
