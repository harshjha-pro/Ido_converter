# idoconverter: Technical Spec

**Version:** 0.1 (draft) | **Date:** 2026-09-28
Read together with `PRD.md`. Items marked **[CONFIRM]** are defaults we chose and the team should confirm before coding.

---

## 1. Constraints

| Constraint | Consequence |
|---|---|
| No VPS. Shared hosting (Hostinger) that is already crowded | The tools and pages are **static files**. No server-side processing of tool input, no database. PHP is allowed only for non-tool pages (see section 2a). |
| Shared hosting returns errors or slows down when process, RAM or CPU limits are hit | Keep pages light. Do not run PHP tools that do real work. |
| Privacy is the product promise | **No tool sends user input to any server**, ours or a third party's. |
| Extension must pass Chrome Web Store review | Narrow purpose, minimal permissions, privacy policy |

## 2. Stack

| Layer | Default choice | Fallback |
|---|---|---|
| Website | **Astro** (static output) with **TypeScript** (confirmed by the team) | Plain HTML, CSS and JavaScript |
| Tool logic | TypeScript modules with no browser dependencies | Plain JavaScript |
| Tests | Vitest | Any runner that supports the same fixtures |
| Extension | Manifest V3, same TypeScript core | none |
| Hosting | Upload the built `dist/` folder to Hostinger, **or** deploy free on Cloudflare Pages | The other option |
| Version control | Git, with a private repository | none |

## 2a. Backend (PHP, minimal)

Hosting is Hostinger shared. PHP is available, and Laravel is possible but **not used for now** (heavy for a crowded plan, and there are no accounts or database in scope).

| Allowed | Not allowed |
|---|---|
| One small plain PHP script for the contact form | Any PHP that receives tool input, files or results |
| A small cron script later (for example refreshing a rates file) | Laravel, databases or logins, until the PRD adds them |

Before coding, check in hPanel and record in `NOTES.md`: PHP version, whether SSH is enabled, and whether Composer works.

If PHP is not usable, fallback order: (1) static site plus a free form service for contact messages, (2) Cloudflare Pages Functions or Workers, (3) Node.js only if the Hostinger plan supports it, (4) a small VPS later if income justifies it.

Notes:
- Astro builds on the developer's computer. Hostinger only receives the finished static files, so hosting load stays minimal.
- Choose the fallback if the team is not comfortable with a build tool. The architecture below still applies.

## 3. Architecture

Write each tool once and use it in both the site and the extension.

```
core/        pure logic  (input -> output). No DOM. Fully unit-tested.
website/     pages and UI that call core
extension/   popup / side panel / context menu that call core
```

### Tool module contract

Every tool in `core/` exports one function with this shape:

```ts
export interface ToolResult<T = string> {
  ok: boolean;
  output?: T;            // the converted result
  meta?: Record<string, unknown>; // counts, findings, change list
  error?: string;        // human-readable, shown to the user
}

export function run(input: string, options?: object): ToolResult;
```

Rules:
- Pure functions. No `fetch`, no `window`, no storage, no logging of input.
- Deterministic, except where a tool says otherwise (for example, random seeds must be explicit).
- Errors are returned as `ok: false` with a clear message, never thrown to the UI.

## 4. Folder structure

```
idoconverter/
├── AGENTS.md                     rules for the AI assistant
├── docs/
│   ├── PRD.md
│   ├── TECHNICAL_SPEC.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── NOTES.md
│   ├── rules-and-sources.md      source, date and reviewer for every rule
│   └── tools/                    one spec per tool, with sample inputs
├── core/
│   ├── shared/                   small helpers used by several tools
│   ├── developers/
│   ├── ca/
│   ├── frontend/
│   ├── jobseekers/
│   ├── forms/
│   └── sellers/
├── website/
│   ├── src/pages/[profession]/[tool]
│   ├── src/components/
│   └── public/
├── extension/
│   └── json-privacy-masker/
│       ├── manifest.json
│       └── src/
├── tests/
│   └── fixtures/                 sample inputs and expected outputs
└── package.json
```

## 5. Site map and URLs

Decide these before coding. Changing URLs later hurts search rankings.

```
/                                   home (six profession sections)
/developers/                        profession page
/developers/json-pii-masker         tool page
/developers/sql-output-to-json
/ca/                                (Phase 2)
/frontend/   /jobseekers/   /forms/   /sellers/
/about  /contact  /privacy  /terms  /disclaimer
```

Rules:
- Lowercase, hyphens, no dates in tool URLs, no file extensions.
- One tool per URL. Each URL targets **one specific search phrase** recorded in the tool tracker (`NOTES.md`).
- Set canonical tags and generate a sitemap.xml.

### Tool page template

1. Title (H1) matching the target phrase
2. The tool itself, above the fold
3. Short "how to use" (3 to 5 lines)
4. Privacy line: "Runs in your browser. Nothing is uploaded."
5. FAQ (3 to 5 questions)
6. Related tools
7. For CA, tax, visa and pricing tools: disclaimer, source, "last checked" date

## 6. Privacy and security rules

- No third-party scripts on tool pages that could read input. Self-host libraries.
- Strict Content Security Policy where the host allows it. Prefer blocking all outbound requests from tool pages except the site itself.
- Analytics, if any, must be page-level only and never include tool input, filenames or results.
- No `localStorage` of user input. Storing simple UI preferences (theme, selected options) is allowed.
- Ads (AdSense) load scripts, so keep them outside the tool area and outside any input, and verify what data the ad script can see. Decide this before applying for ads.
- Never log input to the console.

## 7. Browser and device support

- Latest two versions of Chrome, Edge, Firefox and Safari. Android Chrome and iOS Safari.
- Minimum width 360 px. Tools must be usable one-handed on a phone.
- Large inputs: warn above a set size (default 5 MB of text) and process in a Web Worker when it would block the interface.

## 8. Performance budget

- Tool pages load in a couple of seconds on a mid-range phone on a normal connection. Measure with Lighthouse and record scores in `NOTES.md`.
- Keep JavaScript per page small. Load a heavy library only on the tool page that needs it.
- Images: use optimized formats and set width and height to avoid layout shift.

## 9. Extension architecture (Extension 1: JSON Privacy Masker)

| Item | Decision |
|---|---|
| Manifest | V3 |
| Entry points | Context menu on selected text; popup or side panel for paste and options |
| Logic | Imports from `core/developers/` (same code as the website) |
| Permissions | `contextMenus`, `activeTab`. Add `scripting` only if reading the selection needs it. Add `clipboardWrite` only if copying fails without it. **No** `host_permissions`, no "all sites". |
| Network | None. No remote code. |
| Storage | Optional `storage` for masking presets only, added only if used |
| Single purpose statement | Select JSON or text on a web page, mask sensitive values locally, and copy the safe version |
| Store extras | Privacy policy URL, permission justifications, screenshots |
| Distribution | Chrome Web Store (one-time developer fee), Edge Add-ons, Firefox Add-ons |

Every permission must be justified in one sentence in the store listing. If a permission is not needed, do not request it.

## 10. Testing

- Each tool has fixtures in `tests/fixtures/<tool>/` with `*.input.*` and `*.expected.*` files.
- Cover the normal case, empty input, invalid input, very large input, and unusual characters (Unicode, Indian names and scripts).
- The masking and scrubbing tools also need a **leak test**: a set of realistic secrets and personal data that must not survive in the output.
- Manual check before every release: open the Network tab, run each new tool, and confirm no request carries user input.

## 11. Build and deploy

1. `npm run build` produces `dist/`.
2. Upload `dist/` to the host, or push to the repository connected to Cloudflare Pages.
3. Enable HTTPS and verify redirects.
4. Keep a dated backup of the previous build so a rollback is one copy.

Exact scripts are defined once the scaffold exists. Record them in `AGENTS.md`.

## 12. Data for rules and calculators

- Rates, thresholds, divisors and country specs live in one data file per tool (JSON), not inside code, so a non-programmer can update them.
- Every entry needs `source`, `effectiveFrom`, `lastChecked` and `reviewedBy`.
- Show `lastChecked` on the page.

## 13. Accounts, storage and billing (Phase 4, NOT BUILT YET)

See `docs/PRD.md` section 10 for the tier numbers and open questions. Do not start this section until it's approved with real numbers and a storage promise. Recorded here early so the architecture doesn't box us in later.

| Need | Likely approach |
|---|---|
| Accounts and login | Laravel (on Hostinger, needs SSH + Composer, see section 2a) or a hosted auth service |
| Database | MySQL, which Hostinger shared plans normally include |
| Payment gateway | Not yet researched. Common choice for India is Razorpay; confirm fees and shared-hosting compatibility before picking one |
| Stored files/results | Only for paid users, only what the user explicitly saves. Never store free-tier tool input. |
| Data retention and deletion | User can delete their stored history and account. Define a retention period. |
| Legal | Update the privacy policy to describe exactly what paid storage keeps, for how long, and where. Check India's DPDP Act requirements. |

**Schema (2026-10-02):** `backend/schema.sql`: `users`, `subscriptions`, `payments`, `tool_history`, `login_attempts`, `admin_audit_log`, `webhook_events`. Code lives in `backend/` (PHP 8, PDO with prepared statements only), deployed as a separate site (recommended subdomain `account.YOUR-DOMAIN`), configured by the git-ignored `backend/config/config.php`. Plans, prices and retention live in `backend/config/plans.php` and are **unconfirmed placeholders** (see NOTES.md, prompt 22).

**This section breaks the site's static-only architecture.** Once it's built, the site has two parts: the free static tools (still no server, same as before) and a separate account/billing app (Laravel + database) that the free tools do not depend on. Keep them separated so a bug or outage in billing never breaks the free tools.

## 14. Legal pages (required before ads and the extension)

- Privacy policy (can honestly state that tool input is not collected), terms, about, contact, disclaimer.
- Disclaimer on all CA, tax, visa and pricing tools: informational, not professional advice.
- Have a lawyer or CA review the wording before launch. **[OPEN]**
