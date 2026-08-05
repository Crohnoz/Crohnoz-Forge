import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const workspaceCore = require('../forge-workspace-core.js');
const analyticsCore = require('../forge-analytics-core.js');
const root = new URL('../', import.meta.url);

const [
  app,
  workspaceApp,
  workspaceGuard,
  analyticsApp,
  workspaceCoreSource,
  analyticsCoreSource,
  workspacePrivacyCss,
] = await Promise.all([
  readFile(new URL('app.js', root), 'utf8'),
  readFile(new URL('forge-workspace.js', root), 'utf8'),
  readFile(new URL('forge-workspace-restore-guard.js', root), 'utf8'),
  readFile(new URL('forge-analytics.js', root), 'utf8'),
  readFile(new URL('forge-workspace-core.js', root), 'utf8'),
  readFile(new URL('forge-analytics-core.js', root), 'utf8'),
  readFile(new URL('workspace-privacy.css', root), 'utf8'),
]);

for (const asset of [
  './workspace-privacy.css',
  './forge-workspace-restore-guard.js',
  './forge-workspace-core.js',
  './forge-workspace.js',
  './forge-analytics-core.js',
  './forge-analytics.js',
]) {
  assert.ok(app.includes(asset), `The application loader must reference ${asset}`);
}

assert.ok(
  app.indexOf('./forge-workspace-restore-guard.js') < app.indexOf('./forge-workspace-core.js'),
  'The restoration guard must load before the workspace core',
);
assert.ok(
  app.indexOf('./forge-workspace-core.js') < app.indexOf('./forge-workspace.js'),
  'The workspace core must load before the workspace interface',
);
assert.ok(
  app.indexOf('./forge-workspace.js') < app.indexOf('./forge-analytics-core.js'),
  'Workspace events must be available before analytics starts listening',
);
assert.ok(
  app.indexOf('./forge-analytics-core.js') < app.indexOf('./forge-analytics.js'),
  'The analytics core must load before the analytics interface',
);

const completeSnapshot = workspaceCore.normalizeSnapshot({
  createdAt: '2026-08-05T12:00:00.000Z',
  updatedAt: '2026-08-05T12:30:00.000Z',
  product: {
    idea: 'A warehouse team records damaged deliveries in several spreadsheets and needs an accountable evidence workflow.',
    audience: 'small businesses',
    format: 'web application',
    goal: 'reduce errors and uncertainty',
    currentMethod: 'spreadsheets and messages',
    refinements: ['mobile', 'qr', 'payments', 'not-allowed', 'mobile'],
    visualDirection: 'field-utility',
  },
  blueprint: {
    name: 'ProofFlow\u0000 Demo',
    tagline: 'Trace delivery exceptions with controlled evidence.',
    summary: 'An exploratory blueprint.',
    users: ['Warehouse operator', 'Team coordinator', 'Team coordinator'],
    features: ['Evidence capture', 'Exception queue', 'Audit timeline'],
    assumptions: ['Users have connected devices.', 'Evidence policy is defined.'],
    workflow: ['Capture event', 'Classify issue', 'Notify owner', 'Resolve case'],
    validationQuestions: ['How often does the issue occur?', 'Which evidence is sufficient?'],
  },
  review: {
    privacyReviewed: true,
    accessibilityReviewed: true,
    evidenceReviewed: true,
    ownerAssigned: true,
    notes: 'Run a controlled pilot with representative users.',
  },
  metadata: { appVersion: '0.7.0' },
});

assert.equal(completeSnapshot.schema, 'crohnoz-forge-blueprint');
assert.equal(completeSnapshot.schemaVersion, 1);
assert.deepEqual(completeSnapshot.product.refinements, ['mobile', 'qr', 'payments']);
assert.equal(completeSnapshot.product.visualDirection, 'field-utility');
assert.equal(completeSnapshot.blueprint.name, 'ProofFlow Demo', 'Control characters must be removed from exported text');
assert.deepEqual(completeSnapshot.blueprint.users, ['Warehouse operator', 'Team coordinator'], 'Export lists must be deduplicated');
assert.equal(completeSnapshot.metadata.localOnly, true);
assert.equal(completeSnapshot.metadata.containsSecrets, false);
assert.match(completeSnapshot.checksum, /^fnv1a-[a-f0-9]{8}$/);

const serialized = workspaceCore.serializeSnapshot(completeSnapshot);
const parsed = workspaceCore.parseSnapshot(serialized);
assert.equal(parsed.valid, true, parsed.errors.join(' '));
assert.equal(parsed.snapshot.checksum, completeSnapshot.checksum);

const tampered = JSON.parse(serialized);
tampered.product.idea += ' Hidden change';
const tamperedResult = workspaceCore.validateSnapshot(tampered);
assert.equal(tamperedResult.valid, false, 'A modified export must fail checksum validation');
assert.ok(tamperedResult.errors.some((error) => error.includes('checksum')));

const wrongSchema = workspaceCore.parseSnapshot(JSON.stringify({ schema: 'other-file', schemaVersion: 1 }));
assert.equal(wrongSchema.valid, false, 'Unrelated JSON must not be accepted as a Forge blueprint');
const oversized = workspaceCore.parseSnapshot('x'.repeat(300001));
assert.equal(oversized.valid, false, 'Oversized imports must be rejected before JSON parsing');

const readiness = workspaceCore.calculateReadiness(completeSnapshot);
assert.equal(readiness.score, 100);
assert.equal(readiness.classification, 'Review-ready');
assert.equal(readiness.completeCount, readiness.total);

const exploratory = workspaceCore.calculateReadiness({
  product: {
    idea: 'A short idea that is valid enough to normalize.',
    audience: 'consumers',
    format: 'web application',
  },
});
assert.ok(exploratory.score < 50, 'Incomplete blueprints must remain exploratory');
assert.equal(exploratory.classification, 'Still exploratory');

const plainSummary = workspaceCore.buildPlainTextSummary(completeSnapshot);
assert.match(plainSummary, /^# ProofFlow Demo/m);
assert.match(plainSummary, /Exploratory output\. Human validation is required/);
assert.doesNotMatch(plainSummary, /undefined|null/);

let analyticsState = analyticsCore.clearState(false, Date.parse('2026-08-05T12:00:00.000Z'));
analyticsState = analyticsCore.recordEvent(analyticsState, 'forge_started', {}, Date.parse('2026-08-05T12:01:00.000Z'));
assert.equal(analyticsCore.summarize(analyticsState).totalEvents, 0, 'Analytics must not record before explicit consent');

analyticsState = analyticsCore.setConsent(analyticsState, true, Date.parse('2026-08-05T12:02:00.000Z'));
analyticsState = analyticsCore.recordEvent(
  analyticsState,
  'preview_opened',
  { screen: 'insights', idea: 'This text must be rejected', email: 'private@example.com' },
  Date.parse('2026-08-05T12:03:00.000Z'),
);
analyticsState = analyticsCore.recordEvent(
  analyticsState,
  'refinement_changed',
  { count: 4, visualDirection: 'field-utility', description: 'Sensitive text' },
  Date.parse('2026-08-05T12:04:00.000Z'),
);
analyticsState = analyticsCore.recordEvent(
  analyticsState,
  'not_allowlisted',
  { screen: 'overview' },
  Date.parse('2026-08-05T12:05:00.000Z'),
);

const analyticsSummary = analyticsCore.summarize(analyticsState);
assert.equal(analyticsSummary.totalEvents, 2);
assert.equal(analyticsSummary.eventCounts.preview_opened, 1);
assert.equal(analyticsSummary.eventCounts.refinement_changed, 1);
assert.equal(analyticsSummary.previewScreens.insights, 1);
assert.equal(analyticsSummary.networkTransmission, false);
assert.equal(analyticsSummary.storage, 'local-browser-only');
assert.equal(analyticsState.lastVisualDirection, 'field-utility');
assert.equal(Object.prototype.hasOwnProperty.call(analyticsState, 'idea'), false);
assert.equal(Object.prototype.hasOwnProperty.call(analyticsState, 'email'), false);

const sanitized = analyticsCore.sanitizeMetadata('preview_opened', {
  screen: 'overview',
  idea: 'forbidden',
  organization: 'forbidden',
  message: 'forbidden',
});
assert.deepEqual(sanitized, { screen: 'overview' });

const analyticsRoundTrip = analyticsCore.parseState(analyticsCore.serializeState(analyticsState));
assert.equal(analyticsCore.summarize(analyticsRoundTrip).totalEvents, 2);
assert.equal(analyticsCore.isExpired(
  analyticsRoundTrip,
  Date.parse('2026-09-10T12:00:00.000Z'),
), true, 'Local analytics must expire after the documented retention window');

for (const phrase of [
  'LOCAL BLUEPRINT WORKSPACE',
  'Enable local autosave',
  'Last five explicit saves',
  'Human review readiness',
  'Exporting does not publish the idea',
]) {
  assert.ok(workspaceApp.includes(phrase), `Missing workspace safeguard or interface copy: ${phrase}`);
}

for (const phrase of [
  'PRIVATE ANALYTICS CENTER',
  'No network transmission',
  'Never stored',
  'Enable local product analytics',
  'Delete analytics data',
]) {
  assert.ok(analyticsApp.includes(phrase), `Missing analytics privacy control: ${phrase}`);
}

assert.ok(workspaceApp.includes('core.validateSnapshot'), 'Imported blueprints must pass core validation');
assert.ok(workspaceApp.includes('file.size > 300000'), 'The browser import path must enforce the file-size boundary');
assert.ok(workspaceApp.includes('MAX_HISTORY = 5'), 'Local version history must remain bounded');
assert.ok(workspaceGuard.includes('event.isTrusted'), 'The restoration guard must affect only programmatic regeneration');
assert.ok(workspaceGuard.includes('data-extended-refinement'), 'Extended refinements must reset during restore');
assert.ok(analyticsCoreSource.includes('FORBIDDEN_KEY_PATTERN'), 'Analytics must keep an explicit sensitive-key rejection rule');
assert.ok(analyticsCoreSource.includes('networkTransmission: false'), 'Analytics exports must preserve the no-network boundary');
assert.doesNotMatch(analyticsApp, /querySelector\(['"]#idea-input/, 'Analytics must not read the idea input');

for (const forbiddenNetworkApi of [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /new\s+WebSocket/]) {
  assert.doesNotMatch(workspaceApp, forbiddenNetworkApi, 'Workspace code must not introduce network transmission');
  assert.doesNotMatch(analyticsApp, forbiddenNetworkApi, 'Analytics code must not introduce network transmission');
}

assert.ok(workspacePrivacyCss.includes('@media (max-width: 760px)'), 'Workspace and privacy center require mobile adaptation');
assert.ok(workspacePrivacyCss.includes('@media (prefers-reduced-motion: reduce)'), 'Workspace and privacy center require reduced-motion behavior');
assert.ok(workspacePrivacyCss.includes(':focus-visible'), 'Workspace and privacy controls require visible keyboard focus');

for (const source of [workspaceApp, workspaceGuard, analyticsApp, workspaceCoreSource, analyticsCoreSource]) {
  assert.doesNotMatch(source, /(sk-[A-Za-z0-9_-]{20,}|password\s*=\s*["'][^"']+["'])/i, 'Potential secret found in workspace or analytics code');
}

console.log('Crohnoz Forge local workspace and privacy analytics checks passed.');
