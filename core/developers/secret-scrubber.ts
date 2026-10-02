import type { ToolResult } from '../shared/types';

export type SecretType =
  | 'private_key' | 'connection_string_password' | 'jwt' | 'aws_access_key' | 'aws_secret_key'
  | 'github_token' | 'slack_token' | 'stripe_key' | 'google_api_key' | 'api_key'
  | 'bearer_token' | 'basic_auth' | 'password';

export interface ScrubberOptions {
  /** Detector types to skip. All run by default. */
  disabled?: SecretType[];
}

export interface Finding {
  type: SecretType;
  label: string;
  count: number;
  /** 1-based line numbers in the input, so users can check each spot. Never includes the secret. */
  lines: number[];
}

interface Detector {
  type: SecretType;
  label: string;
  regex: RegExp;
  /** Capture group to redact; 0 = whole match. Lets us keep `postgres://user:` and `@host` readable. */
  group?: number;
}

// Order is priority: when two detectors overlap, the earlier one wins.
const DETECTORS: Detector[] = [
  { type: 'private_key', label: 'Private key block',
    // A missing END line (truncated paste) still redacts up to the next blank line or end of text.
    regex: /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----[\s\S]*?(?:-----END (?:[A-Z0-9]+ )*PRIVATE KEY(?: BLOCK)?-----|(?=\r?\n\s*\r?\n)|$)/g },
  { type: 'connection_string_password', label: 'Password in connection string',
    regex: /\b[a-z][a-z0-9+.-]*:\/\/[^\s:/@]*:([^\s@/]+)@/gi, group: 1 },
  { type: 'jwt', label: 'JWT',
    regex: /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}/g },
  { type: 'aws_access_key', label: 'AWS access key ID',
    regex: /\b(?:AKIA|ASIA|AGPA|AIDA|AROA|ANPA|ANVA|AIPA)[A-Z0-9]{16}\b/g },
  { type: 'aws_secret_key', label: 'AWS secret access key',
    regex: /aws_?secret_?(?:access_?)?key["']?\s*[:=]\s*["']?([A-Za-z0-9/+=]{40})(?![A-Za-z0-9/+=])/gi, group: 1 },
  { type: 'github_token', label: 'GitHub token',
    regex: /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{22,})\b/g },
  { type: 'slack_token', label: 'Slack token',
    regex: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { type: 'stripe_key', label: 'Stripe key',
    regex: /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{10,}\b/g },
  { type: 'google_api_key', label: 'Google API key',
    regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { type: 'api_key', label: 'API key (sk- style)',
    regex: /\bsk-(?:[a-z]+-)?[A-Za-z0-9_-]{20,}/g },
  { type: 'bearer_token', label: 'Bearer token',
    regex: /\bBearer\s+([A-Za-z0-9\-._~+/]{8,}=*)/g, group: 1 },
  { type: 'basic_auth', label: 'Basic auth credentials',
    regex: /\bBasic\s+([A-Za-z0-9+/]{8,}={0,2})/g, group: 1 },
  { type: 'password', label: 'Password or secret value',
    // key = value / key: value / "key": "value" / ?key=value, for keys that name a secret.
    regex: /["']?\b[\w.-]*?(?:password|passwd|pwd|secret|api[_-]?key|access[_-]?key|private[_-]?key|token|credential)s?\b["']?\s*[:=]\s*(?:"([^"\r\n]*)"|'([^'\r\n]*)'|(\$\{[^}\s]*\}|[^\s"',;&}]+))/gi },
];

// Values that are already placeholders are not secrets; redacting them would only inflate the count.
const PLACEHOLDER = /^(?:\*+|x{3,}|<[^>]*>|\$\{[^}]*\}|\{\{[^}]*\}\}|\[REDACTED[^\]]*\]|redacted|null|none|undefined)$/i;

interface Span { start: number; end: number; type: SecretType }

function lineOf(text: string, index: number, lineStarts: number[]): number {
  // Binary search over precomputed line starts keeps large logs fast.
  let lo = 0, hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= index) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

function findSpans(text: string, detectors: Detector[]): Span[] {
  const spans: Span[] = [];
  const overlaps = (s: number, e: number) => spans.some(x => s < x.end && e > x.start);

  for (const d of detectors) {
    const regex = new RegExp(d.regex.source, d.regex.flags.includes('d') ? d.regex.flags : d.regex.flags + 'd');
    for (const m of text.matchAll(regex)) {
      if (!m.indices) continue;
      let range: [number, number] | undefined;
      let value: string | undefined;
      if (d.type === 'password') {
        // Whichever of the three value groups (double-quoted, single-quoted, bare) matched.
        const g = [1, 2, 3].find(i => m[i] !== undefined);
        if (g === undefined) continue;
        range = m.indices[g];
        value = m[g];
      } else {
        const g = d.group ?? 0;
        range = m.indices[g];
        value = m[g];
      }
      if (!range || value === undefined || value === '' || PLACEHOLDER.test(value)) continue;
      if (overlaps(range[0], range[1])) continue;
      spans.push({ start: range[0], end: range[1], type: d.type });
    }
  }
  return spans.sort((a, b) => a.start - b.start);
}

export function run(input: string, options: ScrubberOptions = {}): ToolResult<string> {
  if (!input || input.trim() === '') {
    return { ok: false, error: 'Input is empty' };
  }

  const disabled = new Set(options.disabled ?? []);
  const detectors = DETECTORS.filter(d => !disabled.has(d.type));
  const spans = findSpans(input, detectors);

  const lineStarts = [0];
  for (let i = 0; i < input.length; i++) if (input[i] === '\n') lineStarts.push(i + 1);

  const byType = new Map<SecretType, Finding>();
  let output = '';
  let cursor = 0;
  for (const span of spans) {
    output += input.slice(cursor, span.start) + `[REDACTED:${span.type}]`;
    cursor = span.end;
    const label = DETECTORS.find(d => d.type === span.type)!.label;
    const finding = byType.get(span.type) ?? { type: span.type, label, count: 0, lines: [] };
    finding.count++;
    const line = lineOf(input, span.start, lineStarts);
    if (!finding.lines.includes(line)) finding.lines.push(line);
    byType.set(span.type, finding);
  }
  output += input.slice(cursor);

  // Report in detector order so the list reads the same way every time.
  const findings = DETECTORS.map(d => byType.get(d.type)).filter((f): f is Finding => !!f);

  return {
    ok: true,
    output,
    meta: { findings, total: spans.length },
  };
}
