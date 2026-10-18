# Technical architecture

_The architecture as implemented on 18 October 2026. It also covers the route inventory, component architecture and image pipeline._

## 1. System overview

```
Browser ──────────────────────────────────────────────┐
  Next.js pages (server-rendered + React, nonce CSP)   │
  Web Worker: lib/image/{engine,convert}.ts  ← images never leave the device
  fetch JSON ─────────────┐                            │
                          ▼                            │
Hostinger Node.js Web App (next start)                 │
  /api/health · /api/early-access · /api/events/batch  │
  lib/server/* → Drizzle/mysql2 (pool of 3) ──► Hostinger MySQL
```

Backend details: `backend.md`. Schema: `DATABASE_DESIGN.md`.

## 2. Routes and information architecture

| Route | Type | Purpose | Indexed | Primary keyword (map) |
|---|---|---|---|---|
| `/` | Rendered per request | Value proposition, hero drop zone, rules, early access, FAQ | Yes | product photos for marketplaces |
| `/product-photos` | Server shell + client tool | Marketplace batch tool | Yes | product photo resizer Amazon/Flipkart/Meesho |
| `/tools/image-converter` | Server shell + client tool | Format, size and quality conversion | Yes | bulk image converter |
| `/photo-guide` | Rendered per request | Shooting guide | Yes | product photography with a phone, white background |
| `/privacy`, `/terms` | Rendered per request | Trust and legal | Yes (low priority) | — |
| `/robots.txt`, `/sitemap.xml` | Static | Crawling | — | — |
| `/api/*` | Dynamic | Data endpoints | Disallowed in robots | — |
| 404 | Rendered per request | Not-found page, `noindex` | No | — |

Pages are rendered per request so each response carries a fresh CSP nonce (`middleware.ts`, ADR-13). `/robots.txt` and `/sitemap.xml` stay static.

**Navigation:** header (Product photos, Image converter, Marketplace rules, Photo guide, plus a "Fix my photos" button); footer (the same plus FAQ, Privacy, Terms); breadcrumbs on inner pages. Route list for sitemap and tests: `lib/routes.ts`.

## 3. Component architecture

```
components/
  ui/         Button, ButtonLink, TextButton, Tag, NumberField, TextField, Checkbox, Progress, Toast
  site/       Header (mobile menu), Footer, Logo, Breadcrumbs (+ JSON-LD), JsonLd
  tool/       DropZone, Overlay (crop marks / dimension lines), Workbench (product photos),
              ConverterWorkbench, useLeaveWarning, workbench.module.css (shared tool layout)
  marketing/  HeroDrop, Specimen, EarlyAccessForm
lib/
  image/      engine.ts (decode, analyse, clean, fit, encode), convert.ts, worker.ts, client.ts (queue + fallback), zip.ts, files.ts
  server/     env, http, rateLimit, log, handlers, services/*, db/{schema,client}
  validation.ts  presets.ts  config.ts  seo.ts  routes.ts  specimen.ts
```

**Rules:**
- UI components contain no processing logic.
- `lib/image` has no React.
- `lib/server` is never imported by client components (enforced by a unit test).

## 4. Image processing pipeline

**Shared:**
- One job at a time (`client.ts` queue), so only one image is decoded in memory at once.
- The Web Worker uses OffscreenCanvas; if that's unavailable or the worker fails, the same code runs on the main thread.
- Decoding uses `createImageBitmap` with `imageOrientation: "from-image"`, which applies EXIF rotation.
- Validation is decode-based: a file named `.jpg` that isn't an image fails with "Couldn't read this image". Files are filtered by MIME type before they're added.
- Limits: 30 MB, 40 MP, 100 files.
- Output is re-encoded via canvas, so **EXIF metadata, colour profiles and animation are not preserved** (stated to users where it matters).

**Product photos (`processImage`):**
1. Draw onto white (transparent cutouts become white).
2. Edge statistics. If less than 60% of edges are near-white, **fail** ("needs background removal").
3. Optional flood fill from the edges: near-white becomes 255; neutral shadow pixels up to 48 levels below the threshold fade smoothly; coloured pixels stop the fill.
4. Product bounding box (speckle-tolerant). If none is found, fail.
5. Scale to the target fill and centre on an S×S white square.
6. JPEG, with quality binary-searched to fit the size limit (floor 0.4).
7. Checks: touches edge, enlarged more than 1.5×, original under the minimum side, still over the limit.

**Converter (`convertImage`):**
1. Target size: rotation swaps axes, then longest-side, width or height scaling; never enlarges unless allowed; never below 1 px.
2. JPG gets a white background; rotate and flip via the canvas transform.
3. Encode as the chosen type. If the browser can't encode it (WebP on older Safari), the actual type is used and the user is told.
4. Notes on transparency loss and when the output is larger than the original.

**ZIP:** store-only, UTF-8 names, CRC-32; built after processing, one entry at a time. File names are sanitised; collisions get -2, -3.

**Measured:** 100 photos (3000×2000 to 4000×3000) took about 76 s in headless Chromium, with the main thread responsive (0.1 ms task delay) thanks to the worker.

## 5. Deployment shape
Static pages plus three API routes on one Node process (Hostinger Node.js Web App). There are no background jobs; the rate-limit cleanup is opportunistic. See `DEPLOYMENT_GUIDE.md`.
