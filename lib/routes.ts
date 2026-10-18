/** Public, indexable routes. Single source for the sitemap and the SEO tests. Update `updated` when a page's content changes. */
export const PUBLIC_ROUTES = [
  { path: "/", updated: "2026-10-18", priority: 1.0 },
  { path: "/product-photos", updated: "2026-10-18", priority: 0.9 },
  { path: "/tools", updated: "2026-10-18", priority: 0.8 },
  { path: "/tools/image-converter", updated: "2026-10-18", priority: 0.9 },
  { path: "/tools/watermark", updated: "2026-10-18", priority: 0.8 },
  { path: "/templates", updated: "2026-10-18", priority: 0.8 },
  { path: "/photo-guide", updated: "2026-10-17", priority: 0.7 },
  { path: "/pricing", updated: "2026-10-18", priority: 0.5 },
  { path: "/about", updated: "2026-10-18", priority: 0.4 },
  { path: "/contact", updated: "2026-10-18", priority: 0.4 },
  { path: "/privacy", updated: "2026-10-18", priority: 0.3 },
  { path: "/terms", updated: "2026-10-18", priority: 0.3 },
] as const;
