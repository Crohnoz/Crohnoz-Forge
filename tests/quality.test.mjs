import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const intelligenceCoreApi = require('../forge-intelligence-core.js');
const root = new URL('../', import.meta.url);
const [
  html,
  app,
  enhancementApp,
  strategyApp,
  storiesApp,
  dashboardApp,
  intelligenceCore,
  intelligenceApp,
  baseCss,
  enhancementCss,
  strategyCss,
  storiesCss,
  dashboardCss,
  intelligenceCss,
] = await Promise.all([
  readFile(new URL('index.html', root), 'utf8'),
  readFile(new URL('app.js', root), 'utf8'),
  readFile(new URL('forge-v2.js', root), 'utf8'),
  readFile(new URL('forge-strategy.js', root), 'utf8'),
  readFile(new URL('forge-stories.js', root), 'utf8'),
  readFile(new URL('forge-dashboard.js', root), 'utf8'),
  readFile(new URL('forge-intelligence-core.js', root), 'utf8'),
  readFile(new URL('forge-intelligence.js', root), 'utf8'),
  readFile(new URL('styles.css', root), 'utf8'),
  readFile(new URL('enhancements.css', root), 'utf8'),
  readFile(new URL('strategy.css', root), 'utf8'),
  readFile(new URL('stories.css', root), 'utf8'),
  readFile(new URL('dashboard.css', root), 'utf8'),
  readFile(new URL('intelligence.css', root), 'utf8'),
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
  './intelligence.css',
  './forge-intelligence-core.js',
  './forge-intelligence.js',
]) {
  assert.ok(app.includes(asset), `The enhancement loader must reference ${asset}`);
}

assert.ok(app.indexOf('./forge-intelligence-core.js') < app.indexOf('./forge-intelligence.js'), 'The intelligence calculation core must load before its interface');

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

for (const feature of ['OPERATIONAL SCENARIO WORKBENCH', 'COMPLEXITY & INFRASTRUCTURE', 'RECOMMENDED MVP SCOPE', 'ADOPTION PLAN', 'User-supplied', 'Calculated']) {
  assert.ok(intelligenceApp.includes(feature), `Missing Forge Intelligence v2 feature: ${feature}`);
}

for (const feature of ['calculateScenario', 'frictionMultiplier', 'infrastructureRecommendation', 'capacity value', 'not a guaranteed efficiency gain']) {
  assert.ok(intelligenceCore.includes(feature), `Missing Forge Intelligence calculation safeguard: ${feature}`);
}

assert.ok(storiesApp.includes('showModal'), 'Story detail must use an accessible dialog when supported');
assert.ok(storiesApp.includes('Anonymous public version'), 'Forge Stories must represent anonymous publication');
assert.ok(storiesApp.includes('Client-reported and system-measured evidence stay distinct'), 'Evidence-source distinction must remain explicit');
assert.ok(dashboardApp.includes('Private-by-default model'), 'Dashboard must communicate private-by-default handling');
assert.ok(dashboardApp.includes('Role-based access planned'), 'Dashboard must communicate the RBAC boundary');
assert.ok(dashboardApp.includes('Experiment discontinued'), 'Dashboard must represent honest non-success outcomes');
assert.ok(intelligenceApp.includes('aria-live="polite"'), 'Calculated intelligence outputs must be announced accessibly');
assert.ok(intelligenceApp.includes('Review calculation assumptions and limitations'), 'Simulator assumptions must be visible on demand');

for (const source of [enhancementCss, strategyCss, storiesCss, dashboardCss, intelligenceCss]) {
  assert.ok(source.includes('@media (max-width: 760px)'), 'Mobile adaptation rules are required for enhancement styles');
}

for (const source of [strategyCss, storiesCss, dashboardCss, intelligenceCss]) {
  assert.match(source, /prefers-reduced-motion/, 'Reduced-motion support is required for each advanced module');
}

assert.match(baseCss, /prefers-reduced-motion/, 'Reduced-motion support must remain present');
assert.match(html, /data-netlify=["']true["']/, 'Netlify form detection attribute is required');
assert.match(html, /netlify-honeypot=/, 'Netlify honeypot is required');

const baselineScenario = intelligenceCoreApi.calculateScenario({
  operations: 1200,
  minutes: 8,
  reduction: 35,
  hourlyValue: 10000,
  users: 8,
  branches: 1,
  errorRate: 6,
  reworkRate: 10,
  growthRate: 2,
  softwareCost: 60000,
  handoffs: 3,
  spreadsheets: 4,
  systems: 2,
});

assert.equal(baselineScenario.metrics.baseManualHours, 160, 'Base monthly effort calculation changed unexpectedly');
assert.equal(baselineScenario.metrics.adjustedManualHours, 187, 'Friction-adjusted effort calculation changed unexpectedly');
assert.equal(baselineScenario.metrics.potentialHoursReleased, 65.5, 'Potential released-hours calculation changed unexpectedly');
assert.equal(baselineScenario.metrics.annualCapacityValue, 7855680, 'Annual capacity-value calculation changed unexpectedly');
assert.equal(baselineScenario.metrics.annualSoftwareCost, 720000, 'Annual software baseline calculation changed unexpectedly');
assert.equal(baselineScenario.metrics.projectedMonthlyOperations, 1522, 'Compound monthly-growth calculation changed unexpectedly');
assert.equal(baselineScenario.complexity.label, 'Medium', 'Baseline complexity classification changed unexpectedly');
assert.match(baselineScenario.infrastructure.tier, /Tier 2/, 'Baseline infrastructure recommendation should remain managed-MVP scale');
assert.ok(baselineScenario.mvpScope.includes('Import one controlled spreadsheet template'), 'Spreadsheet input must affect MVP recommendations');
assert.ok(baselineScenario.adoptionPlan.some((item) => item.includes('3 representative users')), 'Adoption plan must derive a controlled pilot size');

const clampedScenario = intelligenceCoreApi.calculateScenario({
  operations: -50,
  minutes: -2,
  reduction: 300,
  hourlyValue: -100,
  users: 0,
  branches: 0,
  errorRate: 200,
  reworkRate: 200,
  growthRate: -4,
  softwareCost: -1,
  handoffs: -1,
  spreadsheets: -3,
  systems: 0,
});

assert.equal(clampedScenario.input.operations, 0, 'Negative operations must clamp to zero');
assert.equal(clampedScenario.input.reduction, 95, 'Reduction scenarios must be capped below total elimination');
assert.equal(clampedScenario.input.users, 1, 'A scenario must preserve at least one user');
assert.equal(clampedScenario.input.branches, 1, 'A scenario must preserve at least one operating site');
assert.equal(clampedScenario.input.errorRate, 100, 'Rates must not exceed 100 percent');
assert.equal(clampedScenario.metrics.annualCapacityValue, 0, 'Zero-volume scenario must not create artificial value');

for (const source of [app, enhancementApp, strategyApp, storiesApp, dashboardApp, intelligenceCore, intelligenceApp]) {
  assert.doesNotMatch(source, /(sk-[A-Za-z0-9_-]{20,}|password\s*=\s*["'][^"']+["'])/i, 'Potential secret found in browser code');
}

console.log('Crohnoz Forge static and calculation quality checks passed.');
