import { describe, it, expect } from 'vitest';
import ts from 'typescript';
import { run, type JsonToTsOutput } from '../../core/developers/json-to-ts-zod';
import fs from 'fs';
import path from 'path';

const fixture = (name: string) => fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'json-to-ts-zod', name), 'utf-8');
const gen = (json: string, rootName?: string) => {
  const result = run(json, { rootName });
  expect(result.ok).toBe(true);
  return result.output as JsonToTsOutput;
};

// Type-checks generated declarations plus `const value: Root = <the input>` in memory.
// This proves the types are valid TypeScript AND that the original JSON fits them.
function typeCheck(source: string): string[] {
  const fileName = 'generated.ts';
  const options: ts.CompilerOptions = { strict: true, noEmit: true, target: ts.ScriptTarget.ES2020, types: [] };
  const host = ts.createCompilerHost(options);
  const original = host.getSourceFile;
  host.getSourceFile = (name, lang, ...rest) =>
    name === fileName ? ts.createSourceFile(name, source, lang) : original.call(host, name, lang, ...rest);
  const program = ts.createProgram([fileName], options, host);
  return ts.getPreEmitDiagnostics(program)
    .filter(d => d.file?.fileName === fileName)
    .map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
}

function zodSyntaxErrors(source: string): string[] {
  const out = ts.transpileModule(source, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2020 } });
  return (out.diagnostics ?? []).map(d => ts.flattenDiagnosticMessageText(d.messageText, '\n'));
}

describe('JSON to TypeScript and Zod', () => {
  it('rejects empty and invalid input', () => {
    expect(run('')).toEqual({ ok: false, error: 'Input is empty' });
    expect(run('{"a":').error).toMatch(/Invalid JSON/);
  });

  it('generates nested interfaces with sensible names', () => {
    const { typescript } = gen(fixture('nested.json'));
    expect(typescript).toContain('export interface Root {');
    expect(typescript).toContain('  address: Address;');
    expect(typescript).toContain('export interface Geo {');
    expect(typescript).toContain('  orders: Order[];');
    expect(typescript).toContain('  items: Item[];');
    expect(typescript).toContain('  tags: string[];');
    expect(typescript).toContain('  "first-name": string;');
    expect(typescript).toContain('export interface Preferences {}');
  });

  it('marks keys missing from some array items optional and merges nullable values', () => {
    const { typescript, zod } = gen(fixture('nested.json'));
    expect(typescript).toContain('  coupon?: string | null;');
    expect(typescript).toContain('  gift?: boolean;');
    expect(typescript).toContain('  lastLogin: null;');
    expect(zod).toContain('  coupon: z.string().nullable().optional(),');
  });

  it('handles empty arrays as unknown[] only when nothing else is known', () => {
    const { typescript } = gen('{"empty": [], "later": [[], [1]]}');
    expect(typescript).toContain('  empty: unknown[];');
    expect(typescript).toContain('  later: number[][];');
  });

  it('builds unions for mixed types across array items', () => {
    const { typescript, zod } = gen(fixture('mixed-array.json'));
    expect(typescript).toContain('export type Root = RootItem[];');
    expect(typescript).toContain('  value: string | number | null;');
    expect(typescript).toContain('  extra?: (number | string)[];');
    expect(zod).toContain('  value: z.union([z.string(), z.number()]).nullable(),');
    expect(zod).toContain('export const RootSchema = z.array(RootItemSchema);');
  });

  it('declares Zod schemas before they are used and exports inferred types', () => {
    const { zod } = gen(fixture('nested.json'));
    expect(zod.indexOf('export const GeoSchema')).toBeLessThan(zod.indexOf('export const AddressSchema'));
    expect(zod.indexOf('export const AddressSchema')).toBeLessThan(zod.indexOf('export const RootSchema'));
    expect(zod).toContain('export type Root = z.infer<typeof RootSchema>;');
    expect(zodSyntaxErrors(zod)).toEqual([]);
  });

  for (const name of ['nested.json', 'mixed-array.json']) {
    it(`generated TypeScript compiles and accepts the original JSON (${name})`, () => {
      const json = fixture(name);
      const { typescript } = gen(json);
      expect(typeCheck(`${typescript}\nconst value: Root = ${json};\n`)).toEqual([]);
    });
  }

  it('uses a custom root name and avoids name clashes', () => {
    const { typescript } = gen('{"user": {"user": {"id": 1}}}', 'user');
    expect(typescript).toContain('export interface User {');
    expect(typescript).toContain('export interface User2 {');
    expect(typescript).toContain('export interface User3 {');
  });

  it('handles top-level primitives', () => {
    expect(gen('"hello"').typescript).toBe('export type Root = string;\n');
    expect(gen('null').zod).toContain('export const RootSchema = z.null();');
  });

  it('handles Unicode keys and values', () => {
    const json = '{"नाम": "राहुल", "city": "बेंगलुरु", "emoji 😀": true}';
    const { typescript } = gen(json);
    expect(typescript).toContain('  "नाम": string;');
    expect(typecheckOk(typescript, json)).toBe(true);
  });

  it('handles large input', () => {
    const rows = Array.from({ length: 5000 }, (_, i) => ({ id: i, name: `n${i}`, ...(i % 2 ? { odd: true } : {}) }));
    const { typescript } = gen(JSON.stringify(rows));
    expect(typescript).toContain('  odd?: boolean;');
  });
});

function typecheckOk(typescript: string, json: string): boolean {
  return typeCheck(`${typescript}\nconst value: Root = ${json};\n`).length === 0;
}
