# Permission justifications

| Permission | One-sentence justification |
|---|---|
| `contextMenus` | Adds the "JSON Privacy Masker" item to the right-click menu on selected text, which is how users send a selection to be masked; the browser passes only the selected text with the click. |

**Not requested** (for reviewers): `activeTab`, `scripting`, `tabs`, `storage`, `clipboardWrite` and any host permissions. Copying the result uses the Clipboard API from the extension popup on a user click, which needs no permission.
