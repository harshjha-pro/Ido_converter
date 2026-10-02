# What is ready and what you still need to do

## Ready (in this folder)

- [x] Privacy policy text (`privacy-policy.md`, also on the site at `/privacy#extension` once the legal pages are published)
- [x] Single purpose statement, short and detailed description (`listing.md`)
- [x] Permission justification (`permissions.md`)
- [x] Screenshot list (`screenshots.md`)
- [x] Icons 16/32/48/128 (`static/icons/`)

## You need to do manually

1. **Test it yourself** in Chrome: `npm run build:extension`, load `extension/json-privacy-masker/dist` unpacked, try all three right-click options on a real page. (Automated checks covered the popup and modes; the right-click menu itself needs a human click.)
2. **Chrome Web Store developer account**: register at the Chrome Web Store Developer Dashboard with a Google account and pay the one-time registration fee shown there.
3. **Zip the build**: zip the *contents* of `extension/json-privacy-masker/dist` (manifest.json at the root of the zip).
4. **Upload** the zip, fill the listing from `listing.md`, upload the screenshots, paste the permission justification and the privacy policy URL.
5. **Publish the website first**, so the privacy policy URL is live before you submit.
6. **Edge Add-ons and Firefox Add-ons** afterwards (Firefox needs `background.scripts` in the manifest; ask Claude to add a Firefox build).
7. Expect review to take a few days; fix and resubmit if asked.
