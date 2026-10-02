# Store listing: JSON Privacy Masker

## Single purpose statement (PRD section 7, verbatim)

> Select JSON or text on a web page, mask sensitive values locally, and copy the safe version.

## Name

JSON Privacy Masker

## Short description (under 132 characters)

Mask emails, phones, tokens and secrets in JSON or logs before you share them. Runs locally; nothing leaves your browser.

## Detailed description

Paste a payload into a bug report, a chat or an AI tool without leaking personal data or credentials.

Select JSON or log text on any page, right-click and choose **JSON Privacy Masker**:

- **Mask sensitive values (JSON):** emails, phone numbers (including Indian mobiles), JWTs, Aadhaar and PAN numbers, and keys like password, token, secret and api_key become [REDACTED]. The JSON structure stays valid.
- **Replace with consistent fakes (JSON):** real values become realistic fakes. The same value always gets the same fake within a run, so relationships in the data still make sense.
- **Scrub secrets (logs or any text):** API keys, tokens, JWTs, passwords, connection-string passwords and private key blocks become [REDACTED:type].

The result opens in the popup with a Copy button. You can also paste text into the popup directly.

**Private by design.** Everything runs on your device. The extension makes no network requests, stores nothing and asks for one permission (the right-click menu).

**Review before sharing.** Detection is pattern-based and can miss unusual formats.

## Category

Developer Tools

## Privacy practices answers (Chrome Web Store form)

- Single purpose: see above.
- Data usage: does **not** collect or use any user data. Tick no data types.
- Certify: not sold to third parties; not used for unrelated purposes; not used for creditworthiness or lending.
- Remote code: **No**, the extension does not use remote code.
- Privacy policy URL: `https://<your-domain>/privacy#extension`
