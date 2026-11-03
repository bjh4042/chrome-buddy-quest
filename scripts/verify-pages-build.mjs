import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const base = '/chrome-buddy-quest/';
const html = readFileSync('dist/index.html', 'utf8');
assert(!html.includes('/src/main.tsx'), 'The deployment must contain compiled JavaScript.');
const references = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(match => match[1]);
const local = references.filter(value => !/^(?:https?:|data:|#)/.test(value));
assert(local.some(value => value.endsWith('.js')), 'The entry JavaScript is missing.');
assert(local.some(value => value.endsWith('.css')), 'The stylesheet is missing.');
for (const reference of local) {
  assert(reference.startsWith(base), `Wrong GitHub Pages path: ${reference}`);
  const relative = reference.slice(base.length).split(/[?#]/)[0];
  assert(existsSync(path.join('dist', relative)), `Missing build asset: ${relative}`);
}
const guide = readFileSync('dist/guide.html', 'utf8');
assert(guide.includes('href="./"'), 'The teacher guide must return to this project.');
console.log(`Verified ${local.length} entry assets and the teacher guide at ${base}`);
