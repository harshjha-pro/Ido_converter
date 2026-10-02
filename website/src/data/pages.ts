import { TOOLS, toolUrl, type Profession } from './tools';

// Every indexable page in one place, for sitemap.xml and the HTML /sitemap page.
// Unlisted tools (live: false) and profession pages without a live tool are left out.

export interface SitePage {
  path: string;
  title: string;
  section: 'Main' | 'Tools' | 'Company';
}

const PROFESSIONS: { id: Profession; title: string }[] = [
  { id: 'developers', title: 'Tools for Developers' },
  { id: 'sellers', title: 'Tools for Online sellers' },
  { id: 'jobseekers', title: 'Tools for Job seekers' },
  { id: 'forms', title: 'Tools for Exam and form applicants' },
];

export function sitePages(): SitePage[] {
  const live = TOOLS.filter(t => t.live);
  return [
    { path: '/', title: 'Home', section: 'Main' },
    ...PROFESSIONS.filter(p => live.some(t => t.profession === p.id)).map(p => ({ path: `/${p.id}/`, title: p.title, section: 'Main' as const })),
    ...live.map(t => ({ path: `${toolUrl(t)}/`, title: t.title, section: 'Tools' as const })),
    { path: '/about/', title: 'About', section: 'Company' },
    { path: '/contact/', title: 'Contact', section: 'Company' },
    { path: '/privacy/', title: 'Privacy Policy', section: 'Company' },
    { path: '/terms/', title: 'Terms of Use', section: 'Company' },
    { path: '/disclaimer/', title: 'Disclaimer', section: 'Company' },
    { path: '/sitemap/', title: 'Sitemap', section: 'Company' },
  ];
}
