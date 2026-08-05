import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const [html, app, enhancementApp, enhancementCss] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('app.js', root), 'utf8'),
  readFile(new URL('forge-v2.js', root), 'utf8'),
  readFile(new URL('enhancements.css', root), 'utf8'),
]);

for (const id of ['idea-input', 'forge-button', 'blueprint', 'operations-slider', 'review-title']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Missing required HTML id: ${id}`);
}

for (const asset of ['./enhancements.css', './forge-v2.js']) {
  assert.ok(app.includes(asset), `The enhancement loader must reference ${asset}`);
}

for (const feature of ['INTERACTIVE PREVIEW', 'VALIDATE BEFORE BUILDING', 'annual-value', 'copy-to-review']) {
  assert.ok(enhancementApp.includes(feature), `Missing Forge enhancement: ${feature}`);
}

assert.ok(enhancementCss.includes('@media (max-width: 760px)'), 'Mobile adaptation rules are required');
assert.match(html, /prefers-reduced-motion/, 'Reduced-motion support must remain present');
assert.match(html, /data-netlify=["']true["']/, 'Netlify form detection attribute is required');
assert.match(html, /netlify-honeypot=/, 'Netlify honeypot is required');

for (const source of [app, enhancementApp]) {
  assert.doesNotMatch(source, /(sk-[A-Za-z0-9_-]{20,}|password\s*=\s*["'][^"']+["'])/i, 'Potential secret found in browser code');
}

console.log('Crohnoz Forge static quality checks passed.');
