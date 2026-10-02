import type { ToolResult } from '../shared/types';
import { DEFAULT_SENSITIVE_KEYS, enabledPatterns, matchKey, parseJsonInput, toTargetSet, type PatternToggles } from '../shared/pii';

export interface PseudonymizerOptions {
  keysToReplace?: string[];
  patterns?: PatternToggles;
  /**
   * Same seed + same input gives the same output. Without a seed the fakes are only consistent
   * within this call. Callers should pass a random seed per run: a fixed or empty seed lets anyone
   * who guesses an original value recompute its fake.
   */
  seed?: string;
  /** Return the original → fake mapping in meta. Off by default so it is never produced by accident. */
  includeMapping?: boolean;
}

export type FakeKind = 'email' | 'phone' | 'aadhaar' | 'pan' | 'jwt' | 'name' | 'secret' | 'text' | 'number';

export interface MappingEntry {
  kind: FakeKind;
  original: string;
  fake: string;
}

// Mixed Indian and international names, because the audience pastes both.
const FIRST_NAMES = ['Aarav', 'Diya', 'Kabir', 'Meera', 'Rohan', 'Ananya', 'Vikram', 'Isha', 'Arjun', 'Sana',
  'Liam', 'Emma', 'Noah', 'Olivia', 'Mateo', 'Sofia', 'Kenji', 'Amara', 'Lucas', 'Zara'];
const LAST_NAMES = ['Sharma', 'Iyer', 'Khan', 'Reddy', 'Banerjee', 'Patel', 'Nair', 'Gill', 'Das', 'Joshi',
  'Smith', 'Garcia', 'Müller', 'Okafor', 'Silva', 'Tanaka', 'Cohen', 'Novak', 'Haddad', 'Brown'];

const NAME_KEYS = new Set(['name', 'firstname', 'lastname', 'fullname', 'username']);
const SECRET_KEYS = new Set(['password', 'token', 'secret', 'authorization', 'apikey']);

// cyrb53: small, fast, well-distributed 53-bit string hash. Not cryptographic, and does not need to be:
// the random per-run seed is what stops reversal, not hash strength.
function hash53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// Deterministic stream of pseudo-random integers for one value.
function stream(key: string) {
  let counter = 0;
  return (max: number) => hash53(`${key}#${counter++}`) % max;
}

const DIGITS = '0123456789';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';

function pick(next: (max: number) => number, chars: string, n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) out += chars[next(chars.length)];
  return out;
}

// Keeps separators, country code and length so the fake still looks and validates like the original.
function fakeDigitsLike(original: string, next: (max: number) => number): string {
  const ccMatch = original.match(/^\+\d{1,3}[-.\s]?/);
  const prefix = ccMatch ? ccMatch[0] : '';
  let firstLocal = true;
  return prefix + original.slice(prefix.length).replace(/\d/g, (d) => {
    // Indian mobiles start with 6-9; keep that so the fake still passes format checks.
    if (firstLocal) {
      firstLocal = false;
      if (/[6-9]/.test(d)) return String(6 + next(4));
      if (d === '0') return '0';
    }
    return DIGITS[next(10)];
  });
}

function makeFake(kind: FakeKind, original: string, next: (max: number) => number, attempt: number): string {
  switch (kind) {
    case 'email':
      return `user.${pick(next, ALNUM, 6)}@example.com`;
    case 'phone':
    case 'aadhaar':
      return fakeDigitsLike(original, next);
    case 'pan':
      return pick(next, UPPER, 5) + pick(next, DIGITS, 4) + pick(next, UPPER, 1);
    case 'jwt':
      return `eyJ${pick(next, ALNUM, 16)}.${pick(next, ALNUM, 24)}.${pick(next, ALNUM, 20)}`;
    case 'name': {
      const words = original.trim().split(/\s+/).length;
      const first = FIRST_NAMES[next(FIRST_NAMES.length)];
      const last = LAST_NAMES[next(LAST_NAMES.length)];
      // The name lists are small, so widen the space only when collisions start: middle initial, then a number.
      const middle = attempt >= 4 ? ` ${UPPER[next(26)]}.` : '';
      const suffix = attempt >= 12 ? ` ${2 + next(998)}` : '';
      return (words > 1 ? `${first}${middle} ${last}` : `${first}${middle}`) + suffix;
    }
    case 'secret':
      return `secret_${pick(next, ALNUM, 12)}`;
    case 'number': {
      const negative = original.startsWith('-');
      const digits = original.replace(/\D/g, '').length || 1;
      // No leading zero, so the fake has the same digit count as the original.
      const first = digits === 1 ? DIGITS[next(10)] : String(1 + next(9));
      return (negative ? '-' : '') + first + pick(next, DIGITS, digits - 1);
    }
    default:
      return `value_${pick(next, ALNUM, 8)}`;
  }
}

function kindForKey(matchedTarget: string, value: string, patterns: { kind: FakeKind; regex: RegExp }[]): FakeKind {
  // A value's own shape beats its key: an email under `contact` is still an email.
  for (const { kind, regex } of patterns) {
    const m = value.match(new RegExp(`^(?:${regex.source})$`, regex.flags.replace('g', '')));
    if (m) return kind;
  }
  if (NAME_KEYS.has(matchedTarget) || matchedTarget.endsWith('name')) return 'name';
  if (SECRET_KEYS.has(matchedTarget)) return 'secret';
  if (matchedTarget === 'email') return 'email';
  if (matchedTarget === 'phone' || matchedTarget === 'mobile') return 'phone';
  if (matchedTarget === 'aadhaar') return 'aadhaar';
  if (matchedTarget === 'pan') return 'pan';
  return 'text';
}

// A uniqueness suffix (see fakeFor) makes a fake non-numeric; keep it as a string rather than emit NaN.
function asNumberIfPossible(fake: string): number | string {
  const n = Number(fake);
  return Number.isFinite(n) ? n : fake;
}

export function run(input: string, options: PseudonymizerOptions = {}): ToolResult<string> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const { keysToReplace = DEFAULT_SENSITIVE_KEYS, patterns: toggles = {}, seed = '', includeMapping = false } = options;
  const targets = toTargetSet(keysToReplace);
  const patterns = enabledPatterns(toggles);

  // original (per kind) → fake, plus the reverse set, so two different originals never share a fake.
  const forward = new Map<string, string>();
  const usedFakes = new Set<string>();
  const mapping: MappingEntry[] = [];
  let replacementCount = 0;

  function fakeFor(kind: FakeKind, original: string): string {
    // Emails are case-insensitive, so Asha@X.com and asha@x.com are the same person.
    const identity = kind === 'email' ? original.toLowerCase() : original;
    const mapKey = `${kind}\u0000${identity}`;
    replacementCount++;
    const existing = forward.get(mapKey);
    if (existing !== undefined) return existing;

    let fake = '';
    for (let attempt = 0; ; attempt++) {
      fake = makeFake(kind, original, stream(`${seed}\u0000${mapKey}\u0000${attempt}`), attempt);
      if (!usedFakes.has(fake) && fake !== original) break;
      // Formats with few possible values (short numbers) can run out; a counter keeps fakes unique.
      if (attempt >= 50) {
        fake = `${fake}_${usedFakes.size}`;
        break;
      }
    }
    forward.set(mapKey, fake);
    usedFakes.add(fake);
    mapping.push({ kind, original, fake });
    return fake;
  }

  function replacePatterns(text: string): string {
    let out = text;
    for (const { kind, regex } of patterns) {
      out = out.replace(regex, (m) => fakeFor(kind, m));
    }
    return out;
  }

  function processValue(val: unknown, matchedTarget: string | null): unknown {
    if (val === null || val === undefined) return val;

    if (typeof val === 'string') {
      if (matchedTarget) return fakeFor(kindForKey(matchedTarget, val, patterns), val);
      return replacePatterns(val);
    }

    if (typeof val === 'number') {
      const asText = String(val);
      if (matchedTarget) {
        // Phone/Aadhaar numbers keep their digit count; other numbers stay numbers of the same size.
        const kind = kindForKey(matchedTarget, asText, patterns);
        if (kind === 'phone' || kind === 'aadhaar') return asNumberIfPossible(fakeFor(kind, asText));
        if (Number.isInteger(val) && Math.abs(val) <= Number.MAX_SAFE_INTEGER) return asNumberIfPossible(fakeFor('number', asText));
        return fakeFor('secret', asText);
      }
      const replaced = replacePatterns(asText);
      return replaced === asText ? val : Number(replaced.replace(/\D/g, '')) || replaced;
    }

    if (typeof val === 'boolean') return val;

    if (Array.isArray(val)) return val.map(item => processValue(item, matchedTarget));

    if (typeof val === 'object') {
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        result[k] = processValue(v, matchedTarget ?? matchKey(k, targets));
      }
      return result;
    }

    return val;
  }

  const output = processValue(parsed.value, null);
  const meta: Record<string, unknown> = { replacementCount, uniqueValues: mapping.length };
  if (includeMapping) meta.mapping = mapping;

  return { ok: true, output: JSON.stringify(output, null, 2), meta };
}
