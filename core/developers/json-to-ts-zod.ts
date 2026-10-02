import type { ToolResult } from '../shared/types';
import { parseJsonInput } from '../shared/pii';

export interface JsonToTsOptions {
  /** Name of the top-level type. */
  rootName?: string;
}

export interface JsonToTsOutput {
  typescript: string;
  zod: string;
}

type Primitive = 'string' | 'number' | 'boolean' | 'null';

type TypeNode =
  | { kind: 'primitive'; name: Primitive }
  | { kind: 'unknown' } // only from empty arrays: nothing to infer from
  | { kind: 'array'; item: TypeNode }
  | { kind: 'object'; fields: Map<string, Field> }
  | { kind: 'union'; members: TypeNode[] };

interface Field {
  type: TypeNode;
  optional: boolean;
}

function infer(value: unknown): TypeNode {
  if (value === null) return { kind: 'primitive', name: 'null' };
  if (Array.isArray(value)) {
    return { kind: 'array', item: value.reduce<TypeNode>((acc, v) => merge(acc, infer(v)), { kind: 'unknown' }) };
  }
  switch (typeof value) {
    case 'string': return { kind: 'primitive', name: 'string' };
    case 'number': return { kind: 'primitive', name: 'number' };
    case 'boolean': return { kind: 'primitive', name: 'boolean' };
    case 'object': {
      const fields = new Map<string, Field>();
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) fields.set(k, { type: infer(v), optional: false });
      return { kind: 'object', fields };
    }
    default: return { kind: 'unknown' };
  }
}

function members(t: TypeNode): TypeNode[] {
  return t.kind === 'union' ? t.members : [t];
}

function sameShapeKind(a: TypeNode, b: TypeNode): boolean {
  if (a.kind !== b.kind) return false;
  return a.kind !== 'primitive' || a.name === (b as typeof a).name;
}

// Merging is what turns array items into one type: objects merge field by field (missing → optional),
// arrays merge their items, and anything else becomes a union.
function merge(a: TypeNode, b: TypeNode): TypeNode {
  if (a.kind === 'unknown') return b;
  if (b.kind === 'unknown') return a;

  const result: TypeNode[] = [...members(a)];
  for (const m of members(b)) {
    const idx = result.findIndex(r => sameShapeKind(r, m));
    if (idx === -1) { result.push(m); continue; }
    const existing = result[idx];
    if (existing.kind === 'object' && m.kind === 'object') {
      result[idx] = mergeObjects(existing, m);
    } else if (existing.kind === 'array' && m.kind === 'array') {
      result[idx] = { kind: 'array', item: merge(existing.item, m.item) };
    }
  }
  return result.length === 1 ? result[0] : { kind: 'union', members: result };
}

function mergeObjects(a: Extract<TypeNode, { kind: 'object' }>, b: Extract<TypeNode, { kind: 'object' }>): TypeNode {
  const fields = new Map<string, Field>();
  for (const [k, fa] of a.fields) {
    const fb = b.fields.get(k);
    fields.set(k, fb ? { type: merge(fa.type, fb.type), optional: fa.optional || fb.optional } : { type: fa.type, optional: true });
  }
  for (const [k, fb] of b.fields) {
    if (!a.fields.has(k)) fields.set(k, { type: fb.type, optional: true });
  }
  return { kind: 'object', fields };
}

// ---------- naming ----------

function pascal(raw: string): string {
  const words = raw
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  let name = words.map(w => w[0].toUpperCase() + w.slice(1)).join('');
  if (!name) name = 'Item';
  if (/^\d/.test(name)) name = `T${name}`;
  return name;
}

function singular(name: string): string {
  if (/ies$/.test(name) && name.length > 4) return name.slice(0, -3) + 'y';
  if (/(ss|us|is)$/.test(name)) return `${name}Item`;
  if (/(s|x|z|ch|sh)es$/.test(name)) return name.slice(0, -2);
  if (/s$/.test(name) && name.length > 1) return name.slice(0, -1);
  return `${name}Item`;
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const propKey = (k: string) => (IDENT.test(k) ? k : JSON.stringify(k));

// ---------- emit ----------

interface NamedObject {
  name: string;
  node: Extract<TypeNode, { kind: 'object' }>;
}

function emit(root: TypeNode, rootName: string): JsonToTsOutput {
  const used = new Set<string>();
  const named = new Map<TypeNode, string>();
  const objects: NamedObject[] = []; // in discovery order: parents before children

  function claim(base: string): string {
    let name = base;
    for (let n = 2; used.has(name); n++) name = `${base}${n}`;
    used.add(name);
    return name;
  }

  // Assign names breadth-first from the root so the outermost types get the plainest names.
  function nameObjects(node: TypeNode, suggested: string) {
    const queue: [TypeNode, string][] = [[node, suggested]];
    while (queue.length) {
      const [n, hint] = queue.shift()!;
      if (n.kind === 'object') {
        if (named.has(n)) continue;
        const name = claim(hint);
        named.set(n, name);
        objects.push({ name, node: n });
        for (const [k, f] of n.fields) queue.push([f.type, pascal(k)]);
      } else if (n.kind === 'array') {
        queue.push([n.item, singular(hint)]);
      } else if (n.kind === 'union') {
        n.members.forEach(m => queue.push([m, hint]));
      }
    }
  }

  const rootIsObject = root.kind === 'object';
  if (!rootIsObject) used.add(rootName);
  nameObjects(root, rootName);

  // TypeScript
  function ts(n: TypeNode): string {
    switch (n.kind) {
      case 'primitive': return n.name;
      case 'unknown': return 'unknown';
      case 'object': return named.get(n)!;
      case 'array': {
        const inner = ts(n.item);
        return n.item.kind === 'union' ? `(${inner})[]` : `${inner}[]`;
      }
      case 'union': {
        // null last reads naturally: string | null
        const parts = n.members.map(ts);
        return [...parts.filter(p => p !== 'null'), ...parts.filter(p => p === 'null')].join(' | ');
      }
    }
  }

  const tsBlocks: string[] = [];
  if (!rootIsObject) tsBlocks.push(`export type ${rootName} = ${ts(root)};`);
  for (const { name, node } of objects) {
    const lines = [...node.fields].map(([k, f]) => `  ${propKey(k)}${f.optional ? '?' : ''}: ${ts(f.type)};`);
    tsBlocks.push(lines.length ? `export interface ${name} {\n${lines.join('\n')}\n}` : `export interface ${name} {}`);
  }

  // Zod: a schema must be declared before it is used, so emit children before parents.
  function zod(n: TypeNode): string {
    switch (n.kind) {
      case 'primitive': return `z.${n.name}()`;
      case 'unknown': return 'z.unknown()';
      case 'object': return `${named.get(n)!}Schema`;
      case 'array': return `z.array(${zod(n.item)})`;
      case 'union': {
        const nonNull = n.members.filter(m => !(m.kind === 'primitive' && m.name === 'null'));
        const hasNull = nonNull.length !== n.members.length;
        const base = nonNull.length === 1 ? zod(nonNull[0]) : `z.union([${nonNull.map(zod).join(', ')}])`;
        return hasNull ? `${base}.nullable()` : base;
      }
    }
  }

  const zodBlocks: string[] = ['import { z } from "zod";'];
  for (const { name, node } of [...objects].reverse()) {
    const lines = [...node.fields].map(([k, f]) => `  ${propKey(k)}: ${zod(f.type)}${f.optional ? '.optional()' : ''},`);
    zodBlocks.push(`export const ${name}Schema = z.object({\n${lines.join('\n')}\n});`);
  }
  if (!rootIsObject) zodBlocks.push(`export const ${rootName}Schema = ${zod(root)};`);
  zodBlocks.push(...(rootIsObject ? [] : [`export type ${rootName} = z.infer<typeof ${rootName}Schema>;`]));
  for (const { name } of objects) zodBlocks.push(`export type ${name} = z.infer<typeof ${name}Schema>;`);

  return { typescript: tsBlocks.join('\n\n') + '\n', zod: zodBlocks.join('\n\n') + '\n' };
}

export function run(input: string, options: JsonToTsOptions = {}): ToolResult<JsonToTsOutput> {
  const parsed = parseJsonInput(input);
  if (!parsed.ok) return { ok: false, error: parsed.error };

  const rootName = pascal(options.rootName?.trim() || 'Root');
  const root = infer(parsed.value);
  const output = emit(root, rootName);
  const interfaceCount = (output.typescript.match(/^export interface /gm) ?? []).length;

  return { ok: true, output, meta: { interfaceCount } };
}
