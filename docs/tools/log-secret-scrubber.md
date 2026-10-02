# Tool spec: Log and Secret Scrubber

**URL:** `/developers/log-secret-scrubber` | **Core:** `core/developers/secret-scrubber.ts` | **Phase:** 1
**Search phrase:** *TODO: fill in the tool tracker (NOTES.md section 4)*

## Purpose

Paste logs, config or stack traces. Secrets are replaced with `[REDACTED:type]` and a findings list shows what was found (type, count, line numbers; never the secret).

## Detectors (in priority order; the earlier one wins on overlap)

| Type | Catches |
|---|---|
| `private_key` | `-----BEGIN … PRIVATE KEY-----` blocks, including a truncated block with no END line (up to the next blank line) |
| `connection_string_password` | Password part of `scheme://user:password@host` (user, host and path stay readable; empty user allowed, e.g. Redis) |
| `jwt` | `eyJ….….…` |
| `aws_access_key` | `AKIA…`, `ASIA…` and other AWS key ID prefixes |
| `aws_secret_key` | 40-char value after `aws_secret_access_key` style keys |
| `github_token` | `ghp_`, `gho_`, `ghu_`, `ghs_`, `ghr_`, `github_pat_` |
| `slack_token` | `xoxb-`, `xoxp-` etc. |
| `stripe_key` | `sk_/rk_/pk_` + `live_/test_` |
| `google_api_key` | `AIza` + 35 chars |
| `api_key` | `sk-…` style keys (OpenAI, Anthropic and similar) |
| `bearer_token` / `basic_auth` | Token after `Bearer` / credentials after `Basic` |
| `password` | Value of keys naming a secret (`password`, `passwd`, `pwd`, `secret`, `api_key`, `access_key`, `private_key`, `token`, `credential`, with any prefix such as `DB_PASSWORD`) in `k=v`, `k: v`, `"k": "v"`, `'v'` and query-string form |

Placeholders are not counted: `***`, `xxx`, `<…>`, `${…}`, `{{…}}`, `[REDACTED…]`, `null`, `none`.

## Required page warning

"Review before sharing. This tool is pattern-based and can miss secrets in unusual formats." When nothing is found, the page says that does not prove the text is safe.

## Edge cases

Empty → `Input is empty`. Clean text is returned unchanged. 20,000-line log processed. Unicode around secrets kept. Keys like `token_count` are not treated as secrets (whole-word match).

## Known limits

Generic high-entropy strings with no telling key or prefix are not detected. Personal data (emails, phones) is out of scope here; use the JSON PII Masker.

## Samples (fixture `tests/fixtures/secret-scrubber/leak.log`)

A realistic service log with fake AWS keys, three connection strings, `DB_PASSWORD`, Stripe, GitHub, Slack, Google and `sk-proj-` keys, a Bearer JWT, Basic auth, JSON and query-string passwords, YAML-style secrets, an RSA key block and a truncated OpenSSH key block. None survive; the log lines stay readable.
