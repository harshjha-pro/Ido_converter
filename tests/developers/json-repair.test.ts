import { describe, it, expect } from 'vitest';
import { run, type RepairChange } from '../../core/developers/json-repair';
import fs from 'fs';
import path from 'path';

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'json-repair', name), 'utf-8');

function repair(text: string) {
  const result = run(text);
  expect(result.ok, result.error).toBe(true);
  const changes = result.meta?.changes as RepairChange[];
  return { value: JSON.parse(result.output!), changes, messages: changes.map(c => c.message) };
}

describe('JSON repair', () => {
  it('rejects empty input', () => {
    expect(run(' ')).toEqual({ ok: false, error: 'Input is empty' });
  });

  it('passes valid JSON through and says it was already valid', () => {
    const result = run('{"a":[1,2]}');
    expect(result.output).toBe('{\n  "a": [\n    1,\n    2\n  ]\n}');
    expect(result.meta).toEqual({ changes: [], alreadyValid: true });
  });

  it('removes trailing commas', () => {
    const { value, changes } = repair(fixture('trailing-commas.txt'));
    expect(value).toEqual({ name: 'Asha', tags: ['a', 'b'] });
    expect(changes).toEqual([{ line: 3, message: 'Removed trailing comma' }, { line: 3, message: 'Removed trailing comma' }]);
  });

  it('converts single quotes, keeping inner double quotes and escaped apostrophes', () => {
    const { value, messages } = repair(fixture('single-quotes.txt'));
    expect(value).toEqual({ name: 'Asha', quote: 'She said "hi"', "it's": 'ok' });
    expect(messages).toContain('Replaced single quotes with double quotes');
  });

  it('quotes unquoted keys', () => {
    const { value, messages } = repair(fixture('unquoted-keys.txt'));
    expect(value).toEqual({ name: 'Asha', age: 30, is_admin: false });
    expect(messages).toContain('Quoted unquoted key name');
  });

  it('removes //, /* */ and # comments', () => {
    const { value, messages } = repair(fixture('comments.txt'));
    expect(value).toEqual({ name: 'Asha', city: 'Pune' });
    expect(messages).toEqual(expect.arrayContaining(['Removed // comment', 'Removed /* */ comment', 'Removed # comment']));
  });

  it('extracts JSON from a markdown code fence with chat text around it', () => {
    const { value, changes } = repair(fixture('code-fence.txt'));
    expect(value).toEqual({ name: 'Asha', ok: true });
    expect(changes[0]).toEqual({ line: 3, message: 'Removed markdown code fence' });
  });

  it('extracts JSON from prose without a fence', () => {
    const { value, messages } = repair('Here you go: {"a": 1}');
    expect(value).toEqual({ a: 1 });
    expect(messages).toContain('Removed text before the JSON');
  });

  it('replaces Python True/False/None and NaN', () => {
    const { value, messages } = repair(fixture('python-literals.txt'));
    expect(value).toEqual({ active: true, deleted: false, manager: null, score: null });
    expect(messages).toEqual(expect.arrayContaining(['Replaced Python True with true', 'Replaced Python None with null', 'Replaced NaN with null']));
  });

  it('closes truncated output (unclosed string, object and array)', () => {
    const { value, messages } = repair(fixture('truncated.txt'));
    expect(value.users).toHaveLength(2);
    expect(value.users[1]).toEqual({ name: 'Ravi', bio: 'Loves cricket and chai, also wri' });
    expect(messages).toEqual(expect.arrayContaining([
      'Closed an unclosed string (input looks truncated)',
      'Closed an unclosed { (input looks truncated)',
      'Closed an unclosed [ (input looks truncated)',
    ]));
  });

  it('drops a dangling key and completes a cut-off literal in truncated output', () => {
    expect(repair('{"a": 1, "b":').value).toEqual({ a: 1 });
    expect(repair('{"a": 1, "b": tr').value).toEqual({ a: 1, b: true });
    expect(repair('[1, 2, ').value).toEqual([1, 2]);
  });

  it('adds missing commas', () => {
    const { value, messages } = repair(fixture('missing-commas.txt'));
    expect(value).toEqual({ a: 1, b: 2, c: [1, 2, 3] });
    expect(messages.filter(m => m === 'Added missing comma')).toHaveLength(3);
  });

  it('replaces curly quotes', () => {
    expect(repair(fixture('curly-quotes.txt')).value).toEqual({ name: 'Asha', city: 'Pune' });
  });

  it('escapes raw line breaks and keeps invalid escapes as literal backslashes', () => {
    const { value, messages } = repair(fixture('string-issues.txt'));
    expect(value).toEqual({ note: 'line one\nline two', path: 'C:\\Users\\asha', re: '\\d+' });
    expect(messages).toContain('Escaped line break inside a string');
  });

  it('normalizes non-JSON numbers', () => {
    const { value } = repair(fixture('numbers.txt'));
    expect(value).toEqual({ a: 1, b: 2, c: 0.5, d: 31, e: 3 });
  });

  it('wraps several top-level values in an array', () => {
    const { value, messages } = repair(fixture('concatenated.txt'));
    expect(value).toEqual([{ a: 1 }, { a: 2 }]);
    expect(messages).toContain('Wrapped several top-level values in an array');
  });

  it('reports line numbers for every change', () => {
    const { changes } = repair('{\n"a": 1,\n"b": 2,\n}');
    expect(changes).toEqual([{ line: 3, message: 'Removed trailing comma' }]);
  });

  it('handles Unicode', () => {
    expect(repair("{'नाम': 'राहुल', emoji: '😀',}").value).toEqual({ 'नाम': 'राहुल', emoji: '😀' });
  });

  it('handles large broken input', () => {
    const body = Array.from({ length: 20000 }, (_, i) => `{id: ${i}, ok: True,}`).join(',\n');
    const { value } = repair(`[${body},]`);
    expect(value).toHaveLength(20000);
    expect(value[19999]).toEqual({ id: 19999, ok: true });
  });

  describe('unrepairable input says why instead of guessing', () => {
    it('double colon', () => {
      const result = run(fixture('unrepairable-colon.txt'));
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/^Can't repair: unexpected ":" where a value should be at line 1, column 25/);
    });

    it('HTML', () => {
      const result = run(fixture('unrepairable-html.txt'));
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/^Can't repair:/);
    });

    it('mismatched brackets', () => {
      const result = run(fixture('unrepairable-mismatch.txt'));
      expect(result.ok).toBe(false);
      expect(result.error).toMatch(/found "}" but expected "]"/);
    });

    it('bare words', () => {
      expect(run('{"status": active}').error).toMatch(/"active" is not a valid value \(strings need quotes\)/);
    });
  });
});
