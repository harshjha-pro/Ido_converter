import type { ToolResult } from '../shared/types';

export interface RepairChange {
  line: number;
  message: string;
}

class RepairError extends Error {
  constructor(message: string, public pos: number) {
    super(message);
  }
}

// Returned by parseValue when the input ends where a value should start (truncated output).
const MISSING = Symbol('missing');
type Parsed = unknown | typeof MISSING;

const OPEN_QUOTES: Record<string, string> = { '"': '"', "'": "'", '\u201C': '\u201D', '\u2018': '\u2019' };
const LITERALS: Record<string, unknown> = {
  true: true, false: false, null: null,
  True: true, False: false, None: null,
  undefined: null, NaN: null, Infinity: null,
};
const STRICT_NUMBER = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/;

class Repairer {
  pos = 0;
  changes: RepairChange[] = [];

  private lineStarts: number[] = [0];

  constructor(private text: string, private lineOffset: number) {
    for (let i = 0; i < text.length; i++) if (text[i] === '\n') this.lineStarts.push(i + 1);
  }

  private lineAt(pos: number): number {
    let lo = 0, hi = this.lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.lineStarts[mid] <= pos) lo = mid; else hi = mid - 1;
    }
    return lo + 1 + this.lineOffset;
  }

  note(message: string, pos = this.pos) {
    this.changes.push({ line: this.lineAt(pos), message });
  }

  cur(): string {
    return this.text[this.pos];
  }

  eof(): boolean {
    return this.pos >= this.text.length;
  }

  skipWs() {
    while (!this.eof()) {
      const c = this.cur();
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\uFEFF' || c === '\u00A0') {
        this.pos++;
      } else if (c === '/' && this.text[this.pos + 1] === '/') {
        this.note('Removed // comment');
        while (!this.eof() && this.cur() !== '\n') this.pos++;
      } else if (c === '/' && this.text[this.pos + 1] === '*') {
        this.note('Removed /* */ comment');
        const end = this.text.indexOf('*/', this.pos + 2);
        this.pos = end === -1 ? this.text.length : end + 2;
      } else if (c === '#') {
        // Python/YAML-style comment, common in hand-edited config.
        this.note('Removed # comment');
        while (!this.eof() && this.cur() !== '\n') this.pos++;
      } else {
        break;
      }
    }
  }

  parseValue(): Parsed {
    this.skipWs();
    if (this.eof()) return MISSING;
    const c = this.cur();
    if (c === '{') return this.parseObject();
    if (c === '[') return this.parseArray();
    if (c in OPEN_QUOTES) return this.parseString();
    if (/[-+.\d]/.test(c)) return this.parseNumber();
    if (/[A-Za-z]/.test(c)) return this.parseLiteral();
    throw new RepairError(`unexpected "${c}" where a value should be`, this.pos);
  }

  parseObject(): Record<string, unknown> {
    const start = this.pos;
    this.pos++; // {
    const obj: Record<string, unknown> = {};
    for (;;) {
      this.skipWs();
      if (this.eof()) { this.note('Closed an unclosed { (input looks truncated)', start); return obj; }
      if (this.cur() === '}') { this.pos++; return obj; }
      if (this.cur() === ',') { this.note('Removed extra comma'); this.pos++; continue; }
      if (this.cur() === ']') throw new RepairError('found "]" but expected "}" to close the object', this.pos);

      const keyPos = this.pos;
      const key = this.parseKey();
      this.skipWs();
      if (this.eof()) { this.note(`Dropped key "${key}" with no value (input looks truncated)`, keyPos); return obj; }
      if (this.cur() === ':') {
        this.pos++;
      } else if (this.cur() === '=') {
        this.note('Replaced = with :'); this.pos++;
      } else {
        throw new RepairError(`expected ":" after key "${key}"`, this.pos);
      }

      const value = this.parseValue();
      if (value === MISSING) { this.note(`Dropped key "${key}" with no value (input looks truncated)`, keyPos); return obj; }
      if (Object.prototype.hasOwnProperty.call(obj, key)) this.note(`Duplicate key "${key}": kept the last value`, keyPos);
      obj[key] = value;

      this.skipWs();
      if (this.eof()) continue;
      if (this.cur() === ',') {
        const commaPos = this.pos;
        this.pos++;
        this.skipWs();
        if (this.cur() === '}') this.note('Removed trailing comma', commaPos);
        continue;
      }
      if (this.cur() === '}') continue;
      if (this.cur() === ']') throw new RepairError('found "]" but expected "}" to close the object', this.pos);
      if (this.cur() in OPEN_QUOTES || /[A-Za-z_$]/.test(this.cur())) { this.note('Added missing comma'); continue; }
      throw new RepairError(`unexpected "${this.cur()}" after a value in an object`, this.pos);
    }
  }

  parseKey(): string {
    const c = this.cur();
    // Keys in single or curly quotes are reported by parseString.
    if (c in OPEN_QUOTES) return this.parseString();
    const m = this.text.slice(this.pos).match(/^[A-Za-z_$\d][\w$-]*/);
    if (!m) throw new RepairError(`unexpected "${c}" where a key should be`, this.pos);
    this.note(`Quoted unquoted key ${m[0]}`);
    this.pos += m[0].length;
    return m[0];
  }

  parseArray(): unknown[] {
    const start = this.pos;
    this.pos++; // [
    const arr: unknown[] = [];
    for (;;) {
      this.skipWs();
      if (this.eof()) { this.note('Closed an unclosed [ (input looks truncated)', start); return arr; }
      if (this.cur() === ']') { this.pos++; return arr; }
      if (this.cur() === ',') { this.note('Removed extra comma'); this.pos++; continue; }
      if (this.cur() === '}') throw new RepairError('found "}" but expected "]" to close the array', this.pos);

      const value = this.parseValue();
      if (value === MISSING) { this.note('Closed an unclosed [ (input looks truncated)', start); return arr; }
      arr.push(value);

      this.skipWs();
      if (this.eof()) continue;
      if (this.cur() === ',') {
        const commaPos = this.pos;
        this.pos++;
        this.skipWs();
        if (this.cur() === ']') this.note('Removed trailing comma', commaPos);
        continue;
      }
      if (this.cur() === ']') continue;
      if (this.cur() === '}') throw new RepairError('found "}" but expected "]" to close the array', this.pos);
      if (/[{["'\u201C\u2018\d-]/.test(this.cur()) || /[A-Za-z]/.test(this.cur())) { this.note('Added missing comma'); continue; }
      throw new RepairError(`unexpected "${this.cur()}" after a value in an array`, this.pos);
    }
  }

  parseString(): string {
    const start = this.pos;
    const open = this.cur();
    const close = OPEN_QUOTES[open];
    if (open === "'") this.note('Replaced single quotes with double quotes');
    else if (open !== '"') this.note('Replaced curly quotes with straight quotes');
    this.pos++;

    let out = '';
    let rawNewline = false;
    while (!this.eof()) {
      const c = this.cur();
      if (c === close) { this.pos++; if (rawNewline) this.note('Escaped line break inside a string', start); return out; }
      if (c === '\\') {
        const n = this.text[this.pos + 1];
        if (n === undefined) { this.pos++; break; }
        const simple: Record<string, string> = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t', "'": "'" };
        if (n in simple) {
          out += simple[n];
          this.pos += 2;
        } else if (n === 'u' && /^[0-9a-fA-F]{4}$/.test(this.text.slice(this.pos + 2, this.pos + 6))) {
          out += String.fromCharCode(parseInt(this.text.slice(this.pos + 2, this.pos + 6), 16));
          this.pos += 6;
        } else {
          // e.g. "C:\path" or a regex "\d": keep the backslash as a literal character.
          this.note(`Kept invalid escape \\${n} as a literal backslash`);
          out += '\\';
          this.pos++;
        }
        continue;
      }
      if (c === '\n') rawNewline = true;
      out += c;
      this.pos++;
    }
    this.note('Closed an unclosed string (input looks truncated)', start);
    return out;
  }

  parseNumber(): number {
    const start = this.pos;
    const m = this.text.slice(this.pos).match(/^[-+]?(?:0[xX][0-9a-fA-F]+|(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?)/);
    if (!m) {
      if (this.text.slice(this.pos, this.pos + 9) === '-Infinity') {
        this.note('Replaced -Infinity with null'); this.pos += 9; return null as unknown as number;
      }
      throw new RepairError(`unexpected "${this.cur()}" where a number should be`, this.pos);
    }
    const raw = m[0];
    this.pos += raw.length;
    if (/^[-+]?0[xX]/.test(raw)) {
      this.note(`Converted hex number ${raw} to decimal`, start);
      return Number(raw.replace('+', ''));
    }
    if (!STRICT_NUMBER.test(raw)) this.note(`Normalized number ${raw}`, start);
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new RepairError(`number ${raw} is out of range`, start);
    return n;
  }

  parseLiteral(): unknown {
    const start = this.pos;
    const m = this.text.slice(this.pos).match(/^[A-Za-z]+/)!;
    const word = m[0];
    this.pos += word.length;
    if (word in LITERALS) {
      if (word === 'True' || word === 'False' || word === 'None') this.note(`Replaced Python ${word} with ${JSON.stringify(LITERALS[word])}`, start);
      else if (!(word === 'true' || word === 'false' || word === 'null')) this.note(`Replaced ${word} with null`, start);
      return LITERALS[word];
    }
    // A cut-off literal at the very end of truncated output: "tr" → true.
    if (this.eof()) {
      const full = ['true', 'false', 'null'].find(l => l.startsWith(word));
      if (full) { this.note(`Completed truncated ${word} to ${full}`, start); return LITERALS[full]; }
    }
    throw new RepairError(`"${word}" is not a valid value (strings need quotes)`, start);
  }
}

function lineCol(text: string, pos: number): { line: number; col: number } {
  const before = text.slice(0, pos);
  const line = before.split('\n').length;
  return { line, col: pos - before.lastIndexOf('\n') };
}

// Pulls the JSON out of chat-style answers: code fences and prose before/after.
function extract(input: string): { text: string; lineOffset: number; changes: RepairChange[] } {
  const changes: RepairChange[] = [];
  let text = input;
  let lineOffset = 0;

  const fence = text.match(/```[\w-]*[^\S\n]*\n([\s\S]*?)(?:```|$)/);
  if (fence && fence.index !== undefined) {
    lineOffset = text.slice(0, fence.index).split('\n').length;
    changes.push({ line: lineOffset, message: 'Removed markdown code fence' });
    text = fence[1];
  }

  const firstNonWs = text.search(/\S/);
  const startsLikeJson = firstNonWs !== -1 && /[{["'\u201C\u2018\d.+-]|true|false|null|True|False|None/.test(text.slice(firstNonWs, firstNonWs + 5));
  if (!startsLikeJson) {
    const brace = text.search(/[{[]/);
    if (brace > 0) {
      const removedLines = text.slice(0, brace).split('\n').length - 1;
      changes.push({ line: lineOffset + 1, message: 'Removed text before the JSON' });
      lineOffset += removedLines;
      text = text.slice(brace);
    }
  }
  return { text, lineOffset, changes };
}

export function run(input: string): ToolResult<string> {
  if (!input || input.trim() === '') {
    return { ok: false, error: 'Input is empty' };
  }

  try {
    const value = JSON.parse(input);
    return { ok: true, output: JSON.stringify(value, null, 2), meta: { changes: [], alreadyValid: true } };
  } catch {
    // Not valid as-is: repair below.
  }

  const { text, lineOffset, changes: pre } = extract(input);
  const r = new Repairer(text, lineOffset);
  let value: Parsed;
  try {
    value = r.parseValue();
    if (value === MISSING) {
      return { ok: false, error: "Can't repair: no JSON value found." };
    }

    r.skipWs();
    if (!r.eof()) {
      // Several values back to back (e.g. NDJSON or a model printing two objects) → array.
      const extra: unknown[] = [];
      const restStart = r.pos;
      try {
        while (!r.eof()) {
          const v = r.parseValue();
          if (v === MISSING) break;
          extra.push(v);
          r.skipWs();
          if (r.cur() === ',') r.pos++;
        }
        if (extra.length) {
          r.note('Wrapped several top-level values in an array', restStart);
          value = [value, ...extra];
        }
      } catch {
        r.pos = restStart;
        r.note('Removed text after the JSON', restStart);
        r.pos = text.length;
      }
    }
  } catch (e) {
    if (e instanceof RepairError) {
      const { line, col } = lineCol(text, e.pos);
      const snippet = text.slice(Math.max(0, e.pos - 20), e.pos + 20).replace(/\s+/g, ' ').trim();
      return {
        ok: false,
        error: `Can't repair: ${e.message} at line ${line + lineOffset}, column ${col} (near "${snippet}"). Fix that spot by hand and try again.`,
      };
    }
    if (e instanceof RangeError) {
      return { ok: false, error: "Can't repair: the JSON is nested too deeply to process." };
    }
    return { ok: false, error: "Can't repair: unexpected problem while reading the input." };
  }

  return {
    ok: true,
    output: JSON.stringify(value, null, 2),
    meta: { changes: [...pre, ...r.changes], alreadyValid: false },
  };
}
