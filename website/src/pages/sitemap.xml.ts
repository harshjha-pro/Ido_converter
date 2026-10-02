import type { APIRoute } from 'astro';
import { sitePages } from '../data/pages';

export const GET: APIRoute = ({ site }) => {
  const urls = sitePages()
    .map(p => `  <url><loc>${new URL(p.path, site).href}</loc></url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
