import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const workspaceCore = require('../forge-workspace-core.js');
const packetCore = require('../forge-review-packet-core.js');
const root = new URL('../', import.meta.url);

const [app, packetApp, packetCoreSource, packetCss] = await Promise.all([
  readFile(new URL('app.js', root), 'utf8'),
  readFile(new URL('forge-review-packet.js', root), 'utf8'),
  readFile(new URL('forge-review-packet-core.js', root), 'utf8'),
  readFile(new URL('review-packet.css', root), 'utf8'),
]);

for (const asset of ['./review-packet.css', './forge-review-packet-core.js', './forge-review-packet.js']) {
  assert.ok(app.includes(asset), `The application loader must reference ${asset}`);
}
assert.ok(
  app.indexOf('./forge-analytics.js') < app.indexOf('./forge-review-packet-core.js'),
  'The privacy center must initialize before the review packet builder',
);
assert.ok(
  app.indexOf('./forge-review-packet-core.js') < app.indexOf('./forge-review-packet.js'),
  'The review packet core must load before its interface',
);

const snapshot = workspaceCore.normalizeSnapshot({
  product: {
    idea: 'A regional logistics operator records damaged deliveries through private messages and disconnected spreadsheets, causing slow claims and weak accountability.',
    audience: 'small businesses',
    format: 'web application',
    goal: 'reduce errors and uncertainty',
    currentMethod: 'spreadsheets and messages',
    refinements: ['mobile', 'qr', 'multi-org', 'accessible'],
    visualDirection: 'field-utility',
  },
  blueprint: {
    name: 'ProofFlow',
    tagline: 'A shared evidence workflow for delivery exceptions.',
    summary: 'A proposed operational product for logistics teams.',
    features: ['Mobile evidence capture', 'Exception classification', 'Role-based notification', 'Searchable timeline'],
    workflow: ['Capture event', 'Classify issue', 'Notify owner', 'Resolve and audit'],
    assumptions: ['Users have connected devices.', 'Evidence policies can be defined.'],
    validationQuestions: ['How often do exceptions occur?', 'Which evidence is sufficient for a claim?'],
    deliveryPhases: ['Discovery confirmation', 'Prototype test', 'Controlled pilot'],
  },
  review: {
    privacyReviewed: true,
    accessibilityReviewed: true,
    evidenceReviewed: false,
    ownerAssigned: true,
    notes: 'Internal note: confirm contractual retention with counsel.',
  },
});

const internalPacket = packetCore.buildReviewPacket(snapshot, {
  mode: 'internal',
  audience: 'implementation-handoff',
  sections: packetCore.SECTIONS,
  includeRawProblem: true,
  includeReviewNotes: true,
});

assert.equal(internalPacket.schema, 'crohnoz-forge-review-packet');
assert.equal(internalPacket.schemaVersion, 1);
assert.equal(internalPacket.mode, 'internal');
assert.equal(internalPacket.product.rawProblem, snapshot.product.idea);
assert.equal(internalPacket.product.currentMethod, snapshot.product.currentMethod);
assert.equal(internalPacket.reviewNotes, snapshot.review.notes);
assert.match(internalPacket.sourceBoundary, /No analytics dataset is included/);
assert.ok(internalPacket.sections.decisions.some((item) => item.includes('tenant isolation')));
assert.ok(internalPacket.sections.decisions.some((item) => item.includes('keyboard')));
assert.ok(internalPacket.sections.scope.nonGoals.some((item) => item.includes('guaranteed savings')));
assert.ok(internalPacket.sections.risks.some((item) => item.includes('Isolation risk')));
assert.equal(internalPacket.sections.signoff.length, 6);

const gates = internalPacket.sections.delivery.gates;
assert.equal(gates.find((gate) => gate.key === 'privacy').status, 'confirmed');
assert.equal(gates.find((gate) => gate.key === 'accessibility').status, 'confirmed');
assert.equal(gates.find((gate) => gate.key === 'evidence').status, 'pending');
assert.equal(gates.find((gate) => gate.key === 'deployment').status, 'pending-environment-verification');

const clientPacket = packetCore.buildReviewPacket(snapshot, {
  mode: 'client',
  audience: 'client-workshop',
  includeRawProblem: true,
  includeReviewNotes: true,
});
assert.equal(clientPacket.product.rawProblem, snapshot.product.idea);
assert.equal(clientPacket.reviewNotes, null, 'Client mode must never include internal review notes');
assert.equal(clientPacket.confidentiality, 'Client review draft');

const publicPacket = packetCore.buildReviewPacket(snapshot, {
  mode: 'public-safe',
  audience: 'client-workshop',
  includeRawProblem: true,
  includeReviewNotes: true,
});
assert.equal(publicPacket.product.rawProblem, null, 'Public-safe mode must remove the raw problem');
assert.equal(publicPacket.product.currentMethod, null, 'Public-safe mode must remove the current operating method');
assert.equal(publicPacket.reviewNotes, null, 'Public-safe mode must remove internal notes');
assert.doesNotMatch(JSON.stringify(publicPacket), /contractual retention with counsel/);
assert.doesNotMatch(JSON.stringify(publicPacket), /private messages and disconnected spreadsheets/);
assert.match(publicPacket.confidentiality, /approval still required/);
assert.match(publicPacket.disclaimer, /does not establish feasibility/);

const scopeOnly = packetCore.buildReviewPacket(snapshot, {
  mode: 'internal',
  sections: ['scope'],
});
assert.ok(scopeOnly.sections.scope);
assert.equal(scopeOnly.sections.decisions, null);
assert.equal(scopeOnly.sections.risks, null);
assert.equal(scopeOnly.sections.validation, null);
assert.equal(scopeOnly.sections.delivery, null);
assert.equal(scopeOnly.sections.evidence, null);
assert.equal(scopeOnly.sections.signoff, null);

const normalizedOptions = packetCore.normalizeOptions({
  mode: 'invalid-mode',
  audience: 'invalid-audience',
  sections: ['scope', 'unknown', 'scope'],
});
assert.equal(normalizedOptions.mode, 'internal');
assert.equal(normalizedOptions.audience, 'internal-review');
assert.deepEqual(normalizedOptions.sections, ['scope']);

const markdown = packetCore.packetToMarkdown(internalPacket);
assert.match(markdown, /^# ProofFlow — Forge Review Packet/m);
assert.match(markdown, /## Risk register/);
assert.match(markdown, /## Sign-off matrix/);
assert.match(markdown, /\| Role \| Responsibility \| Status \|/);
assert.match(markdown, /> Exploratory review artifact/);
assert.doesNotMatch(markdown, /undefined|null/);

const publicMarkdown = packetCore.packetToMarkdown(publicPacket);
assert.doesNotMatch(publicMarkdown, /Problem context/);
assert.doesNotMatch(publicMarkdown, /Internal review notes/);

const serialized = packetCore.serializePacket(publicPacket);
assert.deepEqual(JSON.parse(serialized), publicPacket);

for (const phrase of [
  'PORTABLE REVIEW PACKET',
  'Public-safe draft',
  'Generate review packet',
  'Export .md',
  'Export JSON',
  'Analytics data is never included',
  'does not establish approval',
]) {
  assert.ok(packetApp.includes(phrase), `Missing review packet interface or safeguard: ${phrase}`);
}

assert.ok(packetApp.includes("mode !== 'public-safe'"), 'Public-safe mode must disable raw-problem inclusion');
assert.ok(packetApp.includes("mode === 'internal'"), 'Internal notes must be limited to internal mode');
assert.ok(packetCoreSource.includes('pending-environment-verification'), 'Deployment must remain a separate environment gate');
assert.ok(packetCoreSource.includes('Do not publish submitted ideas'), 'Publication controls must remain visible');
assert.ok(packetCoreSource.includes('does not establish feasibility'), 'Review packets must retain the exploratory disclaimer');
assert.doesNotMatch(packetApp, /CrohnozForgeAnalyticsCore|crohnoz-forge:analytics/, 'The packet builder must not read analytics state');

for (const forbiddenNetworkApi of [/\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /new\s+WebSocket/]) {
  assert.doesNotMatch(packetApp, forbiddenNetworkApi, 'Review packet generation must not introduce network transmission');
}

assert.ok(packetCss.includes('@media (max-width: 760px)'), 'Review packet UI requires mobile adaptation');
assert.ok(packetCss.includes('@media (prefers-reduced-motion: reduce)'), 'Review packet UI requires reduced-motion behavior');
assert.ok(packetCss.includes(':focus-visible'), 'Review packet controls require visible keyboard focus');

for (const source of [packetApp, packetCoreSource]) {
  assert.doesNotMatch(source, /(sk-[A-Za-z0-9_-]{20,}|password\s*=\s*["'][^"']+["'])/i, 'Potential secret found in review packet code');
}

console.log('Crohnoz Forge review packet checks passed.');
