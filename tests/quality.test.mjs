import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const [
  html,
  app,
  enhancementApp,
  strategyApp,
  storiesApp,
  dashboardApp,
  baseCss,
  enhancementCss,
  strategyCss,
  storiesCss,
  dashboardCss,
] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('app.js', root), 'utf8'),
  readFile(new URL('forge-v2.js', root), 'utf8'),
  readFile(new URL('forge-strategy.js', root), 'utf8'),
  readFile(new URL('forge-stories.js', root), 'utf8'),
  readFile(new URL('forge-dashboard.js', root), 'utf8'),
  readFile(new URL('styles.css', root), 'utf8'),
  readFile(new URL('enhancements.css', root), 'utf8'),
  readFile(new URL('strategy.css', root), 'utf8'),
  readFile(new URL('stories.css', root), 'utf8'),
  readFile(new URL('dashboard.css', root), 'utf8'),
]);

for (const id of ['idea-input', 'forge-button', 'blueprint', 'operations-slider', 'review-title']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Missing required HTML id: ${id}`);
}

for (const asset of [
  './enhancements.css',
  './forge-v2.js',
  './strategy.css',
  './forge-strategy.js',
  './stories.css',
  './forge-stories.js',
  './dashboard.css',
  './forge-dashboard.js',
]) {
  assert.ok(app.includes(asset), `The enhancement loader must reference ${asset}`);
}

for (const feature of ['INTERACTIVE PREVIEW', 'VALIDATE BEFORE BUILDING', 'annual-value', 'copy-to-review']) {
  assert.ok(enhancementApp.includes(feature), `Missing Forge enhancement: ${feature}`);
}

for (const feature of ['PRODUCT STRATEGY LAYER', 'MVP BOUNDARY', 'DATA & INTEGRATIONS', 'RISK REGISTER', 'SUGGESTED DELIVERY PHASES']) {
  assert.ok(strategyApp.includes(feature), `Missing strategic blueprint feature: ${feature}`);
}

for (const feature of ['FORGED OUTCOME', 'RAW IDEA → OUTCOME', 'PUBLICATION CONSENT MODEL', 'FICTIONAL DEMO']) {
  assert.ok(storiesApp.includes(feature), `Missing Forge Stories feature: ${feature}`);
}

for (const feature of ['INTERNAL FORGE DASHBOARD', 'OPPORTUNITY RECORD', 'AUDIT HISTORY', 'No real submissions']) {
  assert.ok(dashboardApp.includes(feature), `Missing internal dashboard feature: ${feature}`);
}

assert.ok(storiesApp.includes('showModal'), 'Story detail must use an accessible dialog when supported');
assert.ok(storiesApp.includes('Anonymous public version'), 'Forge Stories must represent anonymous publication');
assert.ok(storiesApp.includes('Client-reported and system-measured evidence stay distinct'), 'Evidence-source distinction must remain explicit');
assert.ok(dashboardApp.includes('Private-by-default model'), 'Dashboard must communicate private-by-default handling');
assert.ok(dashboardApp.includes('Role-based access planned'), 'Dashboard must communicate the RBAC boundary');
assert.ok(dashboardApp.includes('Experiment discontinued'), 'Dashboard must represent honest non-success outcomes');

for (const source of [enhancementCss, strategyCss, storiesCss, dashboardCss]) {
  assert.ok(source.includes('@media (max-width: 760px)'), 'Mobile adaptation rules are required for enhancement styles');
}

for (const source of [strategyCss, storiesCss, dashboardCss]) {
  assert.match(source, /prefers-reduced-motion/, 'Reduced-motion support is required for each advanced module');
}

assert.match(baseCss, /prefers-reduced-motion/, 'Reduced-motion support must remain present');
assert.match(html, /data-netlify=["']true["']/, 'Netlify form detection attribute is required');
assert.match(html, /netlify-honeypot=/, 'Netlify honeypot is required');

for (const source of [app, enhancementApp, strategyApp, storiesApp, dashboardApp]) {
  assert.doesNotMatch(source, /(sk-[A-Za-z0-9_-]{20,}|password\s*=\s*["'][^"']+["'])/i, 'Potential secret found in browser code');
}

console.log('Crohnoz Forge static quality checks passed.');
