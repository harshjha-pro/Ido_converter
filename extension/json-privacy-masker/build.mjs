// Builds the unpacked extension into dist/ using only the project's own TypeScript compiler.
import { execFileSync } from 'node:child_process';
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, 'dist');
const tsc = join(here, '..', '..', 'node_modules', 'typescript', 'bin', 'tsc');

rmSync(dist, { recursive: true, force: true });
execFileSync(process.execPath, [tsc, '-p', join(here, 'tsconfig.json')], { stdio: 'inherit' });

// Browsers need file extensions on ES module imports; TypeScript keeps the extensionless form.
function fixImports(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { fixImports(path); continue; }
    if (!name.endsWith('.js')) continue;
    const src = readFileSync(path, 'utf-8');
    const out = src.replace(/(from\s+|import\s*\(\s*)(['"])(\.{1,2}\/[^'"]+?)(?<!\.js)\2/g, '$1$2$3.js$2');
    if (out !== src) writeFileSync(path, out);
  }
}
fixImports(join(dist, 'js'));

cpSync(join(here, 'static'), dist, { recursive: true });

// Fail the build if anything in the bundle could reach the network.
const forbidden = /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket|EventSource|importScripts|https?:\/\//;
function scan(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) { scan(path); continue; }
    if (!/\.(js|html)$/.test(name)) continue;
    const hit = readFileSync(path, 'utf-8').match(forbidden);
    if (hit) throw new Error(`Network-capable code found in ${path}: ${hit[0]}`);
  }
}
scan(dist);
console.log(`Extension built: ${dist}`);
