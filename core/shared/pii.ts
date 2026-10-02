// PII detection shared by the masker and the pseudonymizer, so both tools agree on what counts as sensitive.

export const DEFAULT_SENSITIVE_KEYS = ['email', 'phone', 'mobile', 'name', 'password', 'token', 'secret', 'authorization', 'apikey', 'aadhaar', 'pan'];

export type PiiKind = 'jwt' | 'email' | 'aadhaar' | 'pan' | 'phone';

export const PII_PATTERNS: Record<PiiKind | 'phoneIndia', RegExp> = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  jwt: /\bey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g,
  // Runs before the phone patterns so a 12-digit Aadhaar is caught as one value, not split into a phone match.
  aadhaar: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  // Case-insensitive because pasted data often lowercases IDs; a PAN-like string is still a PAN.
  pan: /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g,
  // Indian mobiles (+91 98765 43210, 098765-43210, 9876543210) are not covered by the NANP-style pattern below.
  phoneIndia: /(?:\+91[-\s]?|\b0|\b)[6-9]\d{4}[-\s]?\d{5}\b/g,
  phone: /(?:\+\d{1,3}[-.\s]?)?\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
};

export interface PatternToggles {
  jwt?: boolean;
  email?: boolean;
  aadhaar?: boolean;
  pan?: boolean;
  phone?: boolean;
}

// Order matters: earlier patterns win, so a JWT is not half-eaten by the email or phone patterns.
export function enabledPatterns(t: PatternToggles): { kind: PiiKind; regex: RegExp }[] {
  const list: { kind: PiiKind; regex: RegExp }[] = [];
  if (t.jwt !== false) list.push({ kind: 'jwt', regex: PII_PATTERNS.jwt });
  if (t.email !== false) list.push({ kind: 'email', regex: PII_PATTERNS.email });
  if (t.aadhaar !== false) list.push({ kind: 'aadhaar', regex: PII_PATTERNS.aadhaar });
  if (t.pan !== false) list.push({ kind: 'pan', regex: PII_PATTERNS.pan });
  if (t.phone !== false) {
    list.push({ kind: 'phone', regex: PII_PATTERNS.phoneIndia });
    list.push({ kind: 'phone', regex: PII_PATTERNS.phone });
  }
  return list;
}

export function normalizeKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Splits camelCase, snake_case, kebab-case and dotted keys into lowercase words.
export function keyTokens(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(t => t.toLowerCase());
}

// Returns the target that matched, or null. Matches whole words or runs of words, so `accessToken`,
// `user-password` and `api_key` match their targets, while `company` does not match `pan`.
export function matchKey(key: string, targets: Set<string>): string | null {
  const whole = normalizeKey(key);
  if (targets.has(whole)) return whole;
  const tokens = keyTokens(key);
  for (let i = 0; i < tokens.length; i++) {
    let joined = '';
    for (let j = i; j < tokens.length; j++) {
      joined += tokens[j];
      if (targets.has(joined)) return joined;
    }
  }
  return null;
}

export function toTargetSet(keys: string[]): Set<string> {
  return new Set(keys.map(normalizeKey).filter(Boolean));
}

export function parseJsonInput(input: string): { ok: true; value: unknown } | { ok: false; error: string } {
  if (!input || input.trim() === '') return { ok: false, error: 'Input is empty' };
  try {
    return { ok: true, value: JSON.parse(input) };
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }
}
