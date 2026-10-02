Read AGENTS.md and docs/ again, especially TECHNICAL_SPEC.md section 9
and PRD.md section 7. Milestone 4: build Extension 1.

Plan first (take your time on this one), wait for my OK. In the plan,
list the exact permissions you intend to request and justify each in
one sentence.

Build:
- Manifest V3, in extension/json-privacy-masker/.
- Single purpose: select JSON or text on a web page, mask sensitive
  values locally, and copy the safe version.
- Reuse core/developers/json-pii-masker.ts, pseudonymizer.ts and
  secret-scrubber.ts directly — do not duplicate logic.
- Entry points: right-click context menu on selected text, and a popup
  (or side panel) to paste text and choose options.
- Permissions: contextMenus, activeTab only, unless you have a specific
  reason for more — ask me first if so.
- No network requests anywhere in the extension. No remote code.
- Apply the design tokens to the popup UI, simplified for the small
  space.

Do NOT submit to any store yet. Just build and let me test it loaded
unpacked in Chrome.

When finished: list the exact permissions used and why, confirm no
network requests, give load-unpacked instructions, update docs/NOTES.md,
stop for my review.
