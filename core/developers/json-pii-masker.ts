import type { ToolResult } from '../shared/types';

export interface MaskerOptions {
  keysToMask?: string[];
  maskEmail?: boolean;
  maskPhone?: boolean;
  maskJWT?: boolean;
  maskAadhaar?: boolean;
  maskPAN?: boolean;
  maskStyle?: 'full' | 'partial' | 'placeholder';
}

type MaskStyle = NonNullable<MaskerOptions['maskStyle']>;

export const DEFAULT_KEYS = ['email', 'phone', 'mobile', 'name', 'password', 'token', 'secret', 'authorization', 'apikey', 'aadhaar', 'pan'];

const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  jwt: /\bey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g,
  // Runs before the phone patterns so a 12-digit Aadhaar is masked as one value, not split into a phone match.
  aadhaar: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  // Case-insensitive because pasted data often lowercases IDs; a PAN-like string is still a PAN.
  pan: /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g,
  // Indian mobiles (+91 98765 43210, 098765-43210, 9876543210) are not covered by the NANP-style pattern below.
  phoneIndia: /(?:\+91[-\s]?|\b0|\b)[6-9]\d{4}[-\s]?\d{5}\b/g,
  phone: /(?:\+\d{1,3}[-.\s]?)?\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
};

function applyMask(value: string, style: MaskStyle): string {
  if (style === 'placeholder') return '[REDACTED]';

  if (style === 'full') {
    return '*'.repeat(Math.max(value.length, 3));
  }

  // Partial mask
  if (value.length <= 2) return '*'.repeat(value.length);

  if (value.includes('@')) {
    const [local, domain] = value.split('@');
    if (!domain) return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
    const maskedLocal = local.length > 2 ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1] : '*'.repeat(local.length);
    return `${maskedLocal}@${domain}`;
  }

  return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Splits camelCase, snake_case, kebab-case and dotted keys into lowercase words.
function keyTokens(key: string): string[] {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(t => t.toLowerCase());
}

// Matches whole words or runs of words, so `accessToken`, `user-password` and `api_key` match
// their targets, while `company` does not match `pan` and `filename` does not match `name`.
function keyMatches(key: string, targets: Set<string>): boolean {
  if (targets.has(normalize(key))) return true;
  const tokens = keyTokens(key);
  for (let i = 0; i < tokens.length; i++) {
    let joined = '';
    for (let j = i; j < tokens.length; j++) {
      joined += tokens[j];
      if (targets.has(joined)) return true;
    }
  }
  return false;
}

export function run(input: string, options: MaskerOptions = {}): ToolResult<string> {
  if (!input || input.trim() === '') {
    return { ok: false, error: 'Input is empty' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (e) {
    return { ok: false, error: `Invalid JSON: ${(e as Error).message}` };
  }

  const {
    keysToMask = DEFAULT_KEYS,
    maskEmail = true,
    maskPhone = true,
    maskJWT = true,
    maskAadhaar = true,
    maskPAN = true,
    maskStyle = 'placeholder'
  } = options;

  const targets = new Set(keysToMask.map(normalize).filter(Boolean));
  const patterns: RegExp[] = [];
  if (maskJWT) patterns.push(PATTERNS.jwt);
  if (maskEmail) patterns.push(PATTERNS.email);
  if (maskAadhaar) patterns.push(PATTERNS.aadhaar);
  if (maskPAN) patterns.push(PATTERNS.pan);
  if (maskPhone) patterns.push(PATTERNS.phoneIndia, PATTERNS.phone);

  let replacementCount = 0;

  function maskPatterns(text: string): string {
    let out = text;
    for (const regex of patterns) {
      out = out.replace(regex, (match: string) => {
        replacementCount++;
        return applyMask(match, maskStyle);
      });
    }
    return out;
  }

  // `forced` is true for anything under a sensitive key, including nested objects and arrays,
  // so `{ "password": { "value": "x" } }` cannot leak through a wrapper object.
  function processValue(val: unknown, forced: boolean): unknown {
    if (val === null || val === undefined) return val;

    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      if (forced) {
        replacementCount++;
        return applyMask(String(val), maskStyle);
      }
      if (typeof val === 'string') return maskPatterns(val);
      if (typeof val === 'number') {
        // Phone and Aadhaar numbers are often stored as JSON numbers; masking turns them into strings.
        const asText = String(val);
        const masked = maskPatterns(asText);
        return masked === asText ? val : masked;
      }
      return val;
    }

    if (Array.isArray(val)) {
      return val.map(item => processValue(item, forced));
    }

    if (typeof val === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        result[k] = processValue(v, forced || keyMatches(k, targets));
      }
      return result;
    }

    return val;
  }

  const outputObj = processValue(parsed, false);

  return {
    ok: true,
    output: JSON.stringify(outputObj, null, 2),
    meta: { replacementCount }
  };
}
