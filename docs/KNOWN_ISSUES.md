# Known issues and limitations

| # | Issue | Impact | Workaround / plan |
|---|---|---|---|
| K1 | Not tested on real phones, Safari or Firefox | Unknown device-specific bugs | Manual checklist before launch (RELEASE_CHECKLIST) |
| K2 | Older Safari can't encode WebP | Converter saves PNG instead | Users are told on the result; FAQ explains |
| K3 | HEIC, GIF, SVG not accepted | iPhone originals must be shared as JPG | Stated in UI and FAQ; files are checked by content, so renaming doesn't get them in |
| K4 | EXIF, colour profiles and animation not preserved | Re-encoded outputs lose metadata | Stated in the privacy notice and FAQ |
| K5 | Enclosed gaps (e.g. inside a mug handle) stay slightly off-white | Amazon may flag near-white areas | Cleaning works from the edges to protect white products; future: optional enclosed-region fill |
| K6 | Busy backgrounds can't be fixed | Photos fail and are left out of the ZIP | Photo guide; done-for-you service; future AI removal |
| K7 | ~~CSP allows inline styles~~ | — | **Fixed in 0.5.0**: no `style` attributes; production `style-src` uses the nonce. Dev mode still allows inline styles for Next's overlay |
| K8 | Flipkart and Meesho rules unverified | Presets may be wrong | Labelled "Unverified". No official public page exists (searched 18 Oct 2026; Meesho's supplier site refuses logged-out visitors); third-party guides disagree (Flipkart minimum quoted as 1000×1000 or 200×1000; Meesho as 500–1500 px). Owner must check the logged-in seller panels |
| K9 | Converter usage not measured | No converter metrics | Add `converter_events` if needed |
| K10 | No contact or support channel by default | Users can't reach us; deletion requests have no path | Configure WhatsApp; add a support email |
| K11 | npm 10 resolver crash when adding dev dependencies; npm 11 lockfiles can fail npm 10 `npm ci` | Broken installs if the lockfile isn't repaired | Add with npm 11, then `npm install --package-lock-only` on npm 10 and verify `npm ci` (DEVELOPMENT.md). Caught and fixed in the 0.3.0 package check |
| K12 | Homepage JS 137 KB (Zod in the form) | Slightly heavier home page | Lab LCP is fine; could lazy-load the form later |
| K13 | Pages render per request (CSP nonces) instead of being static | Small server cost per page view; no static HTML caching | ~10 ms per page locally; watch CPU on Hostinger (ADR-13) |
| K14 | Crop is centred only (no drag-to-position) | Off-centre subjects may be trimmed | Use *Add padding*, or crop before uploading; drag crop is on ROADMAP phase 2 |
| K15 | No real screen-reader test yet | Unknown speech issues (e.g. chatty progress on big batches) | Scripted keyboard/name audit passes; human NVDA + VoiceOver pass before launch (ACCESSIBILITY.md) |
| K16 | Brand kit, saved settings and template drafts live in one browser | Not on other devices; lost if site data is cleared or in private browsing | Stated in the UI; cross-device needs accounts (ROADMAP phase 3) |
| K17 | Templates: fixed layouts, no carousels, no resizing one design to another size | Less flexible than a full editor | By design for now (ROADMAP phase 5 follow-ups) |
| K18 | Template sample photos are our raw "before" shots (wood, grey backgrounds) | Previews look less polished until the user adds a photo | The editor says to add your own; could add processed samples |
| K19 | Text is drawn with the system font, which differs by device | Exported text looks slightly different on Windows, Android and Apple devices | Matches DESIGN.md (no web fonts); a bundled font needs owner approval |
| K20 | Terms choose Indian law but no court/city; no owner identity on legal pages | Legal pages incomplete | Lawyer review (B3) and owner details |
