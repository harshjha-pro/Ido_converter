import { defineConfig } from 'astro/config';

export default defineConfig({
  // Used for canonical links, sitemap.xml and robots.txt. CONFIRM THE REAL DOMAIN (NOTES.md open question 21);
  // override at build time with SITE_URL=https://example.com npm run build.
  site: process.env.SITE_URL ?? 'https://idoconverter.com',
  srcDir: './website/src',
  publicDir: './website/public',
  outDir: './dist',
  // Never inline scripts: the Content-Security-Policy in website/public/.htaccess allows only same-origin script files.
  vite: { build: { assetsInlineLimit: 0 } },
});
