import { allPresetsReviewed } from '../../../core/forms/visa-photo-sizer';
import { caReviewed } from '../../../core/ca/review';

// Single list of tools so profession pages, related-tool links and the footer never drift apart.
export type Profession = 'developers' | 'sellers' | 'jobseekers' | 'forms' | 'ca' | 'frontend';

export interface ToolEntry {
  profession: Profession;
  slug: string;
  title: string;
  description: string;
  group: string;
  live: boolean;
  /** The one search phrase this page targets (AGENTS.md site rules; recorded in NOTES.md tool tracker). */
  searchPhrase: string;
  /** <title> (before " | idoconverter") and meta description, written for the search phrase. */
  seoTitle: string;
  seoDescription: string;
}

export const TOOLS: ToolEntry[] = [
  { profession: 'developers', slug: 'json-pii-masker', group: 'privacy', live: true,
    title: 'JSON PII Masker', description: 'Mask sensitive values by key name and by pattern while keeping valid JSON structure.',
    searchPhrase: 'mask PII in JSON online', seoTitle: 'Mask PII in JSON Online: Free, Private JSON Masker',
    seoDescription: 'Mask emails, phone numbers, Aadhaar, PAN, JWTs and passwords in JSON online. Keeps valid JSON structure. Runs in your browser; nothing is uploaded.' },
  { profession: 'developers', slug: 'consistent-pseudonymizer', group: 'privacy', live: true,
    title: 'Consistent Pseudonymizer', description: 'Replace real values with realistic fakes. The same input always gets the same fake, so relationships survive.',
    searchPhrase: 'pseudonymize JSON online', seoTitle: 'Pseudonymize JSON Online with Consistent Fake Data',
    seoDescription: 'Pseudonymize JSON online: replace names, emails and phone numbers with realistic fakes that stay consistent across records. Runs in your browser.' },
  { profession: 'developers', slug: 'log-secret-scrubber', group: 'privacy', live: true,
    title: 'Log and Secret Scrubber', description: 'Find and redact API keys, tokens, JWTs, passwords and private keys in logs, with a findings list.',
    searchPhrase: 'redact API keys from logs', seoTitle: 'Redact API Keys and Secrets from Logs Online',
    seoDescription: 'Redact API keys, tokens, JWTs, passwords and private keys from logs before sharing. Shows a findings list. Runs in your browser; nothing is uploaded.' },
  { profession: 'developers', slug: 'sql-output-to-json', group: 'data', live: true,
    title: 'SQL Output to JSON', description: 'Paste psql, mysql or tab-separated console output and get typed JSON.',
    searchPhrase: 'psql output to JSON', seoTitle: 'psql Output to JSON Converter (also mysql and TSV)',
    seoDescription: 'Convert psql or mysql console output to JSON: paste the table, get typed JSON with NULL, numbers and booleans detected. Runs in your browser.' },
  { profession: 'developers', slug: 'json-to-typescript-zod', group: 'data', live: true,
    title: 'JSON to TypeScript and Zod', description: 'Paste JSON and get TypeScript interfaces and a Zod schema, with optional fields detected.',
    searchPhrase: 'JSON to TypeScript and Zod', seoTitle: 'JSON to TypeScript and Zod Schema Generator',
    seoDescription: 'Generate TypeScript interfaces and a Zod schema from JSON, with optional fields, unions and nullable values detected. Free and runs in your browser.' },
  { profession: 'developers', slug: 'json-repair', group: 'data', live: true,
    title: 'JSON Repair', description: 'Fix broken JSON from AI output or hand edits, and see exactly what changed.',
    searchPhrase: 'fix broken JSON from AI', seoTitle: 'Fix Broken JSON from AI Output: JSON Repair Tool',
    seoDescription: 'Fix broken JSON from ChatGPT and other AI output or hand edits: trailing commas, quotes, comments, code fences, truncation. See every change. Runs locally.' },
  { profession: 'jobseekers', slug: 'notice-period-buyout-calculator', group: 'offer', live: true,
    title: 'Notice Period Buyout Calculator', description: 'Estimate what it costs to buy out the rest of your notice period, with the formula shown.',
    searchPhrase: 'notice period buyout calculator', seoTitle: 'Notice Period Buyout Calculator (Formula Shown)',
    seoDescription: 'Calculate your notice period buyout amount from monthly salary, notice days and days served. Formula shown, day basis editable. Private, in-browser.' },
  { profession: 'sellers', slug: 'volumetric-weight-calculator', group: 'shipping', live: true,
    title: 'Volumetric Weight Calculator', description: 'Work out volumetric weight from box size with your courier\'s divisor, and see which weight is higher.',
    searchPhrase: 'volumetric weight calculator', seoTitle: 'Volumetric Weight Calculator for Courier Shipping',
    seoDescription: 'Volumetric weight calculator for sellers: enter box size in cm or inches and your courier\'s divisor, compare with actual weight. Runs in your browser.' },
  { profession: 'sellers', slug: 'return-loss-calculator', group: 'shipping', live: true,
    title: 'Return-Loss Calculator', description: 'See what each returned order costs you and your real margin after returns, with the break-even return rate.',
    searchPhrase: 'return loss calculator for online sellers', seoTitle: 'Return Loss Calculator for Online Sellers',
    seoDescription: 'Return loss calculator for online sellers: cost of each returned order, margin after returns and break-even return rate. Formula shown; nothing uploaded.' },
  // AGENTS.md rule 5: listed only once every country preset has a named reviewer in visa-photo-presets.json.
  { profession: 'forms', slug: 'visa-passport-photo-sizer', group: 'photo', live: allPresetsReviewed(),
    title: 'Visa and Passport Photo Sizer', description: 'Crop and resize a photo to India, USA or UK passport and visa photo specs, in your browser.',
    searchPhrase: 'visa and passport photo resizer', seoTitle: 'Visa and Passport Photo Resizer: India, USA, UK',
    seoDescription: 'Resize and crop a photo to India, USA and UK passport and visa photo sizes, compressed to the file-size limit. Runs in your browser; not uploaded.' },
  // Phase 2 CA tools: listed only after a CA signs off in core/ca/review.json (AGENTS.md rule 5).
  { profession: 'ca', slug: 'gstr-2b-json-to-excel', group: 'gst-data', live: caReviewed('gstr-2b-json-to-excel'),
    title: 'GSTR-2B JSON to Excel', description: 'Merge several months of GSTR-2B JSON into one Excel workbook, with a summary sheet. Files stay on your device.',
    searchPhrase: 'GSTR-2B JSON to Excel multiple months', seoTitle: 'GSTR-2B JSON to Excel: Merge Multiple Months',
    seoDescription: 'Convert GSTR-2B JSON files to Excel and merge several months into one workbook with B2B, CDNR, IMPG and a summary. Runs in your browser; nothing uploaded.' },
  { profession: 'ca', slug: 'bank-statement-csv-cleaner', group: 'bank', live: caReviewed('bank-statement-csv-cleaner'),
    title: 'Bank Statement CSV Cleaner', description: 'Clean any bank CSV export into one tidy layout for Tally import, with a running-balance check.',
    searchPhrase: 'bank statement CSV for Tally import', seoTitle: 'Bank Statement CSV Cleaner for Tally Import',
    seoDescription: 'Clean bank statement CSV exports for TallyPrime: removes header junk and totals, fixes dates and Dr/Cr amounts, checks running balances. Runs in your browser.' },
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
