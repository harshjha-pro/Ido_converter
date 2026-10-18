# Feature catalogue and traceability

Status: Planned / In progress / Implemented / **Verified** (implemented, with passing automated tests) / Blocked.

| Feature | Users | Route / code | Where it runs | Limits | Errors handled | Accessibility | SEO page | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|
| Upload (drag-drop + picker) | All | `components/tool/DropZone.tsx`, `acceptImages` in `lib/image/files.ts` | Browser | 100 files; JPG/PNG/WebP by first bytes (name and reported type ignored), then decoded | Skipped types named; over-limit explained | Label + input, focus ring, keyboard | — | e2e converter, journeys | **Verified** |
| Product-photo pipeline | Sellers, cataloguers | `lib/image/engine.ts`, `Workbench.tsx`, `/product-photos` | Browser (Web Worker, main-thread fallback) | 30 MB, 40 MP | Corrupt, too large, non-white background, no product found, touches edge, upscaled, over size limit | Status text + tags (not colour only); inspector dialog | `/product-photos` | e2e journeys + axe; Python stress (100 photos) | **Verified** |
| Marketplace presets | Sellers | `lib/presets.ts` | Browser | — | Unverified rules labelled | — | `/#rules` | e2e SEO page check | Implemented (rules unverified for 2 of 3) |
| ZIP + CSV report | All | `lib/image/zip.ts`, `files.ts` | Browser | Store-only ZIP | Build failure → toast | Toast is `role=status` | — | Unit CRC test; e2e ZIP parsing; formula injection | **Verified** |
| Converter | Visitors | `lib/image/convert.ts`, `lib/image/converterForm.ts`, `ConverterWorkbench.tsx`, `converter/ConverterSettings.tsx`, `/tools/image-converter` | Browser (worker) | 30 MB, 40 MP; px 16–10,000; ratio 1–10,000 | Empty, corrupt, unsupported encoder, larger output, transparency loss, transparent-on-JPG padding | Labelled fields, inline errors, axe clean | `/tools/image-converter` | 18 unit + 9 e2e (pixel-checked output) | **Verified** |
| Crop / pad to aspect ratio, background colour | Visitors | `targetSize`, `safeBackground` in `convert.ts` | Browser (worker) | Centre crop only | Invalid ratio or colour blocked in UI; engine falls back to white | Toggle buttons with `aria-pressed`, labelled colour field | `/tools/image-converter` | 8 unit + 3 e2e | **Verified** |
| Remove after processing; per-photo download | All | `Workbench.tsx`, `product/Inspector.tsx`, `ConverterWorkbench.tsx` | Browser | — | Removed files leave ZIP and CSV | Labelled buttons | — | 3 e2e | **Verified** |
| Stop / leave warning | All | `useLeaveWarning.ts` | Browser | — | — | — | — | Stop: Python e2e | Implemented |
| Early access | Prospects | `EarlyAccessForm.tsx`, `/api/early-access` | Browser + server + MySQL | 5/h per client (100/h shared if IP unknown) | 400/403/413/415/422/429/503 | Field errors linked, focus moves to first error, axe clean | `/#early-access` | 4 component, 9 integration, 2 e2e | **Verified** |
| Batch statistics | Owner | `/api/events/batch` | Server + MySQL | 60/h per client | Failure ignored by tool | — | — | 2 integration, 2 e2e | **Verified** |
| Health check | Owner | `/api/health` | Server | — | 503 when DB down | — | noindex (API) | Integration, e2e | **Verified** |
| SEO: metadata, canonical, OG, JSON-LD, robots, sitemap | Search users | `lib/seo.ts`, `app/robots.ts`, `app/sitemap.ts` | Build time | Titles ≤ 70, descriptions 70–170 | — | — | All public | e2e SEO (3 tests) | **Verified** |
| Photo guide | Sellers | `/photo-guide` | Static | — | — | axe clean | Yes | e2e SEO + axe | **Verified** |
| Privacy / Terms | All | `/privacy`, `/terms` | Static | — | — | axe clean | Yes (low priority) | e2e SEO + axe | Implemented (legal review pending) |
| Done-for-you WhatsApp offer | Sellers | Homepage, tool help | Static link | — | Hidden if unconfigured | — | — | Manual | Implemented; **blocked** on owner's number |
| Interactive (drag) crop, saved workflows, accounts, AI, templates | — | — | — | — | — | — | — | — | Planned (ROADMAP.md) |
