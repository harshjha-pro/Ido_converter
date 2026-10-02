import type { ToolResult } from '../shared/types';
import { DEFAULT_SENSITIVE_KEYS, enabledPatterns, matchKey, parseJsonInput, toTargetSet } from '../shared/pii';

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

export const DEFAULT_KEYS = DEFAULT_SENSITIVE_KEYS;

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

export function run(input: string, options: MaskerOptions = {}): ToolResult<string> {
  const parsedResult = parseJsonInput(input);
  if (!parsedResult.ok) return { ok: false, error: parsedResult.error };
  const parsed = parsedResult.value;

  const {
    keysToMask = DEFAULT_KEYS,
    maskEmail = true,
    maskPhone = true,
    maskJWT = true,
    maskAadhaar = true,
    maskPAN = true,
    maskStyle = 'placeholder'
  } = options;

  const targets = toTargetSet(keysToMask);
  const patterns = enabledPatterns({ jwt: maskJWT, email: maskEmail, aadhaar: maskAadhaar, pan: maskPAN, phone: maskPhone });

  let replacementCount = 0;

  function maskPatterns(text: string): string {
    let out = text;
    for (const { regex } of patterns) {
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
        result[k] = processValue(v, forced || matchKey(k, targets) !== null);
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
