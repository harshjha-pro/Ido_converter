# Threat model and security findings

## Assets
Visitors' images (on their device), early-access contacts (personal data), the database and its credentials, `IP_HASH_SECRET`, site availability, and owner reputation (trust claims).

## Trust boundaries and entry points
1. **Browser ↔ user files:** decode-only, never uploaded.
2. **Browser ↔ API:** three public endpoints.
3. **App ↔ MySQL:** localhost, pooled.
4. **Owner ↔ DB:** CLI scripts and phpMyAdmin.

## Threats and mitigations (STRIDE-style)
| ID | Threat | Mitigation | Residual |
|---|---|---|---|
| S1 | Malicious image (decoder exploit) | Decoding happens in the browser's sandboxed codecs; SVG not accepted; nothing reaches the server | Browser zero-days (out of scope) |
| S2 | Decompression or huge images exhaust memory | 30 MB and 40 MP limits checked after decode; one image in memory at a time; batches up to 100 | Low-end phones may still struggle (needs device testing) |
| S3 | Spam or bot sign-ups | Honeypot; 5/h per client; strict schema; origin check | Distributed bots; add a CAPTCHA if seen |
| S4 | Cross-site request abuse (CSRF-like) | `Origin` must match; JSON-only; no cookies or sessions exist | — |
| S5 | SQL injection | Parameterised queries only; no multi-statements for the app pool (tested) | — |
| S6 | XSS | React escaping; no user HTML rendered; JSON-LD escapes `<`; nonce-based CSP with `'strict-dynamic'` (injected inline scripts and handlers verified blocked) | Inline styles still allowed (Low) |
| S7 | Personal data leak (logs, errors, exports) | Logs carry no PII; generic error bodies (tested); no admin UI; exports via CLI with formula escaping | Owner's handling of exports |
| S8 | Rate-limit bypass or lockout | HMAC(IP) buckets; unknown IP → shared 20× bucket + warning | Spoofed headers if the proxy doesn't overwrite X-Forwarded-For (verify on Hostinger) |
| S9 | Supply chain | Exact pins, ≥ 14-day-old releases, lockfile, audit 0 for production | Dev-only `braces` advisory (no fix exists; patterns are not attacker-controlled) |
| S10 | Secrets exposure | Server-only env vars; `.env*.local` git-ignored; no secrets in the zip (scanned); one `NEXT_PUBLIC` value, which is public by design | — |
| S11 | Path traversal or unsafe names in ZIP | Names sanitised (`/ \ : * ? " < > |` and control characters replaced; unit-tested); ZIP is written, never extracted | — |
| S12 | Formula injection via CSV | Cells starting `= + - @ tab CR` prefixed with `'` (tested) | — |
| S13 | Open redirect / SSRF | No redirect parameters; the server makes no outbound requests | — |
| S14 | Misleading trust claims | Privacy page reviewed against code; statistics disclosed; GPC respected | Legal review pending |
| S15 | Statistics poisoning | Strict schema + DB checks; 60/h | Inflated counts are possible but bounded; filter with `used_samples` |

## Not applicable now
- Authentication, authorisation and IDOR: there are no accounts or private resources.
- Server-side upload storage: none exists.
- AI cost exhaustion: no AI. See ROADMAP for the future controls.

## Findings register
| Finding | Severity | Status |
|---|---|---|
| Shared rate-limit bucket when the IP is unknown | High | Fixed |
| No Content-Security-Policy | Medium | Fixed: nonce CSP on every page, e2e-tested (0.4.0) |
| Real client IP header unverified on Hostinger | Medium | Open: post-deploy check |
| Dev dependency `braces` advisory | Low | Accepted (dev only) |
| No CAPTCHA | Low | Accepted until abuse is observed |
