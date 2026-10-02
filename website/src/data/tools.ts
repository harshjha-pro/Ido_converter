// Single list of tools so profession pages, related-tool links and the footer never drift apart.
export type Profession = 'developers' | 'sellers' | 'jobseekers' | 'forms' | 'ca' | 'frontend';

export interface ToolEntry {
  profession: Profession;
  slug: string;
  title: string;
  description: string;
  group: string;
  live: boolean;
}

export const TOOLS: ToolEntry[] = [
  { profession: 'developers', slug: 'json-pii-masker', group: 'privacy', live: true,
    title: 'JSON PII Masker', description: 'Mask sensitive values by key name and by pattern while keeping valid JSON structure.' },
  { profession: 'developers', slug: 'consistent-pseudonymizer', group: 'privacy', live: false,
    title: 'Consistent Pseudonymizer', description: 'Replace real values with realistic fakes. The same input always gets the same fake, so relationships survive.' },
  { profession: 'developers', slug: 'log-secret-scrubber', group: 'privacy', live: false,
    title: 'Log and Secret Scrubber', description: 'Find and redact API keys, tokens, JWTs, passwords and private keys in logs, with a findings list.' },
  { profession: 'developers', slug: 'sql-output-to-json', group: 'data', live: false,
    title: 'SQL Output to JSON', description: 'Paste psql, mysql or tab-separated console output and get typed JSON.' },
  { profession: 'developers', slug: 'json-to-typescript-zod', group: 'data', live: false,
    title: 'JSON to TypeScript and Zod', description: 'Paste JSON and get TypeScript interfaces and a Zod schema, with optional fields detected.' },
  { profession: 'developers', slug: 'json-repair', group: 'data', live: false,
    title: 'JSON Repair', description: 'Fix broken JSON from AI output or hand edits, and see exactly what changed.' },
];

export function toolUrl(tool: ToolEntry): string {
  return `/${tool.profession}/${tool.slug}`;
}

export function toolsFor(profession: Profession): ToolEntry[] {
  return TOOLS.filter(t => t.profession === profession);
}

// Related = same group first, then the rest of the profession. Unbuilt tools get no URL.
export function relatedTools(slug: string, limit = 4): { title: string; url?: string }[] {
  const self = TOOLS.find(t => t.slug === slug);
  if (!self) return [];
  const peers = TOOLS.filter(t => t.slug !== slug && t.profession === self.profession);
  const ordered = [...peers.filter(t => t.group === self.group), ...peers.filter(t => t.group !== self.group)];
  return ordered.slice(0, limit).map(t => ({ title: t.title, url: t.live ? toolUrl(t) : undefined }));
}
