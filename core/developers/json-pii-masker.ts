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

const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  phone: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  jwt: /\bey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*\b/g,
  aadhaar: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  pan: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g,
};

function applyMask(value: string, style: 'full' | 'partial' | 'placeholder'): string {
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
  if (!input || input.trim() === '') {
    return { ok: false, error: 'Input is empty' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(input);
  } catch (e: any) {
    return { ok: false, error: `Invalid JSON: ${e.message}` };
  }

  const {
    keysToMask = ['email', 'phone', 'name', 'password', 'token', 'secret', 'authorization', 'aadhaar', 'pan'],
    maskEmail = true,
    maskPhone = true,
    maskJWT = true,
    maskAadhaar = true,
    maskPAN = true,
    maskStyle = 'placeholder'
  } = options;

  const normalizedKeys = new Set(keysToMask.map(k => k.toLowerCase()));
  let replacementCount = 0;

  function processValue(val: any, keyName?: string): any {
    if (val === null || val === undefined) return val;
    
    let keyMatches = false;
    if (keyName && normalizedKeys.has(keyName.toLowerCase())) {
      keyMatches = true;
    }

    if (typeof val === 'string') {
      if (keyMatches) {
        replacementCount++;
        return applyMask(val, maskStyle);
      }

      let maskedVal = val;
      let stringReplaced = false;

      const runPattern = (regex: RegExp) => {
        maskedVal = maskedVal.replace(regex, (match: string) => {
          stringReplaced = true;
          return applyMask(match, maskStyle);
        });
      };

      if (maskJWT) runPattern(PATTERNS.jwt);
      if (maskEmail) runPattern(PATTERNS.email);
      if (maskPhone) runPattern(PATTERNS.phone);
      if (maskAadhaar) runPattern(PATTERNS.aadhaar);
      if (maskPAN) runPattern(PATTERNS.pan);

      if (stringReplaced) {
        // Only increment once per string to avoid overcounting when multiple things matched
        replacementCount++;
      }
      return maskedVal;
    }

    if (typeof val === 'number' || typeof val === 'boolean') {
      if (keyMatches) {
        replacementCount++;
        return applyMask(String(val), maskStyle);
      }
      return val;
    }

    if (Array.isArray(val)) {
      return val.map(item => processValue(item, keyName));
    }

    if (typeof val === 'object') {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(val)) {
        result[k] = processValue(v, k);
      }
      return result;
    }

    return val;
  }

  const outputObj = processValue(parsed);

  return {
    ok: true,
    output: JSON.stringify(outputObj, null, 2),
    meta: { replacementCount }
  };
}
