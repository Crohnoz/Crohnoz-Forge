import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const intelligenceCoreApi = require('../forge-intelligence-core.js');
const workspaceCoreApi = require('../forge-workspace-core.js');
const root = new URL('../', import.meta.url);
const files = [
  'index.html','app.js','forge-v2.js','forge-strategy.js','forge-stories.js','forge-dashboard.js',
  'forge-intelligence-core.js','forge-intelligence.js','forge-refinements.js','forge-workspace-core.js','forge-workspace.js',
  'styles.css','enhancements.css','strategy.css','stories.css','dashboard.css','intelligence.css','refinements.css','workspace.css',
];
const content = Object.fromEntries(await Promise.all(files.map(async (file) => [file, await readFile(new URL(file, root), 'utf8')])));
const html = content['index.html'];
const app = content['app.js'];

for (const id of ['idea-input','forge-button','blueprint','operations-slider','review-title']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `Missing required HTML id: ${id}`);
}

for (const asset of [
  './enhancements.css','./forge-v2.js','./strategy.css','./forge-strategy.js','./stories.css','./forge-stories.js',
  './dashboard.css','./forge-dashboard.js','./intelligence.css','./forge-intelligence-core.js','./forge-intelligence.js',
  './refinements.css','./forge-refinements.js','./workspace.css','./forge-workspace-core.js','./forge-workspace.js',
]) assert.ok(app.includes(asset), `The loader must reference ${asset}`);

assert.ok(app.indexOf('./forge-intelligence-core.js') < app.indexOf('./forge-intelligence.js'), 'Intelligence core must load before its interface');
assert.ok(app.indexOf('./forge-workspace-core.js') < app.indexOf('./forge-workspace.js'), 'Workspace core must load before its interface');

const featureChecks = {
  'forge-v2.js':['INTERACTIVE PREVIEW','VALIDATE BEFORE BUILDING','annual-value','copy-to-review'],
  'forge-strategy.js':['PRODUCT STRATEGY LAYER','MVP BOUNDARY','DATA & INTEGRATIONS','RISK REGISTER','SUGGESTED DELIVERY PHASES'],
  'forge-stories.js':['FORGED OUTCOME','RAW IDEA → OUTCOME','PUBLICATION CONSENT MODEL','FICTIONAL DEMO'],
  'forge-dashboard.js':['INTERNAL FORGE DASHBOARD','OPPORTUNITY RECORD','AUDIT HISTORY','No real submissions'],
  'forge-intelligence.js':['OPERATIONAL SCENARIO WORKBENCH','COMPLEXITY & INFRASTRUCTURE','RECOMMENDED MVP SCOPE','ADOPTION PLAN','User-supplied','Calculated'],
  'forge-intelligence-core.js':['calculateScenario','frictionMultiplier','infrastructureRecommendation','capacity value','not a guaranteed efficiency gain'],
  'forge-refinements.js':['Include payments','Remove mandatory registration','Add inventory','Add dashboards','Multi-organization','Accessibility-first','Change visual direction','VISIBLE REFINEMENT IMPACT','forge:refinement-change'],
  'forge-workspace.js':['PRIVATE LOCAL WORKSPACE','Save locally','Export JSON','Export Markdown','Import JSON','Clear local data','No account, tracking vendor, or automatic upload'],
  'forge-workspace-core.js':['crohnoz-forge-blueprint','validateImport','MAX_SNAPSHOTS','MAX_EVENTS','summarizeEvents','toMarkdown'],
};
for (const [file, features] of Object.entries(featureChecks)) {
  for (const feature of features) assert.ok(content[file].includes(feature), `Missing ${feature} in ${file}`);
}

assert.ok(content['forge-stories.js'].includes('showModal'), 'Story details must use an accessible dialog');
assert.ok(content['forge-stories.js'].includes('Anonymous public version'), 'Anonymous publication must remain represented');
assert.ok(content['forge-dashboard.js'].includes('Private-by-default model'), 'Dashboard must communicate private-by-default handling');
assert.ok(content['forge-dashboard.js'].includes('Role-based access planned'), 'Dashboard must communicate the RBAC boundary');
assert.ok(content['forge-dashboard.js'].includes('Experiment discontinued'), 'Dashboard must represent honest non-success outcomes');
assert.ok(content['forge-intelligence.js'].includes('aria-live="polite"'), 'Calculated outputs must be announced accessibly');
assert.ok(content['forge-refinements.js'].includes('aria-pressed="false"'), 'New refinement buttons must expose pressed state');
assert.ok(content['forge-workspace.js'].includes('aria-live="polite"'), 'Workspace status must be announced accessibly');
assert.ok(content['forge-workspace.js'].includes('Local storage is off by default'), 'Local storage must remain opt-in');
assert.ok(content['forge-workspace.js'].includes('Raw ideas are never included in usage counters'), 'Workspace must communicate analytics minimization');
assert.ok(content['forge-workspace.js'].includes('file.size > 300000'), 'Workspace imports must enforce a size limit');
assert.ok(content['forge-workspace.js'].includes('window.confirm'), 'Destructive local clearing must require confirmation');

for (const css of ['enhancements.css','strategy.css','stories.css','dashboard.css','intelligence.css','refinements.css','workspace.css']) {
  assert.ok(content[css].includes('@media (max-width: 760px)'), `${css} requires mobile adaptation`);
}
for (const css of ['strategy.css','stories.css','dashboard.css','intelligence.css','refinements.css','workspace.css']) {
  assert.match(content[css], /prefers-reduced-motion/, `${css} requires reduced-motion support`);
}
for (const direction of ['precision-grid','warm-service','field-utility']) {
  assert.ok(content['refinements.css'].includes(`preview-direction-${direction}`), `Missing preview direction ${direction}`);
}
assert.match(content['styles.css'], /prefers-reduced-motion/, 'Base reduced-motion support must remain');
assert.match(html, /data-netlify=["']true["']/, 'Netlify form detection is required');
assert.match(html, /netlify-honeypot=/, 'Netlify honeypot is required');

const baselineScenario = intelligenceCoreApi.calculateScenario({
  operations:1200,minutes:8,reduction:35,hourlyValue:10000,users:8,branches:1,errorRate:6,reworkRate:10,growthRate:2,softwareCost:60000,handoffs:3,spreadsheets:4,systems:2,
});
assert.equal(baselineScenario.metrics.baseManualHours,160);
assert.equal(baselineScenario.metrics.adjustedManualHours,187);
assert.equal(baselineScenario.metrics.potentialHoursReleased,65.5);
assert.equal(baselineScenario.metrics.annualCapacityValue,7855680);
assert.equal(baselineScenario.metrics.annualSoftwareCost,720000);
assert.equal(baselineScenario.metrics.projectedMonthlyOperations,1522);
assert.equal(baselineScenario.complexity.label,'Medium');
assert.match(baselineScenario.infrastructure.tier,/Tier 2/);
assert.ok(baselineScenario.mvpScope.includes('Import one controlled spreadsheet template'));
assert.ok(baselineScenario.adoptionPlan.some((item)=>item.includes('3 representative users')));

const clampedScenario = intelligenceCoreApi.calculateScenario({operations:-50,minutes:-2,reduction:300,hourlyValue:-100,users:0,branches:0,errorRate:200,reworkRate:200,growthRate:-4,softwareCost:-1,handoffs:-1,spreadsheets:-3,systems:0});
assert.equal(clampedScenario.input.operations,0);
assert.equal(clampedScenario.input.reduction,95);
assert.equal(clampedScenario.input.users,1);
assert.equal(clampedScenario.input.branches,1);
assert.equal(clampedScenario.input.errorRate,100);
assert.equal(clampedScenario.metrics.annualCapacityValue,0);

const rawBlueprint = {
  schema:'crohnoz-forge-blueprint',version:1,id:'demo-1',title:'  Field Proof  ',idea:'  Capture delivery evidence safely  ',audience:'businesses',format:'web app',
  users:['Driver','Coordinator','Driver'],features:['Evidence capture','Audit timeline'],assumptions:['Connectivity exists'],workflow:['Capture','Review'],refinements:['mobile','qr','mobile'],savedAt:123,
};
const normalized = workspaceCoreApi.normalizeBlueprint(rawBlueprint);
assert.equal(normalized.title,'Field Proof');
assert.equal(normalized.idea,'Capture delivery evidence safely');
assert.deepEqual(normalized.refinements,['mobile','qr']);
assert.equal(normalized.schema,'crohnoz-forge-blueprint');

const validImport = workspaceCoreApi.validateImport(rawBlueprint);
assert.equal(validImport.valid,true);
assert.equal(workspaceCoreApi.validateImport({schema:'wrong',version:1,title:'X',idea:'Y'}).valid,false);
assert.equal(workspaceCoreApi.validateImport({schema:'crohnoz-forge-blueprint',version:9,title:'X',idea:'Y'}).valid,false);
assert.equal(workspaceCoreApi.validateImport(null).valid,false);

let snapshots=[];
for (let index=0;index<20;index+=1) snapshots=workspaceCoreApi.addSnapshot(snapshots,{...rawBlueprint,id:`id-${index}`,title:`Blueprint ${index}`});
assert.equal(snapshots.length,workspaceCoreApi.MAX_SNAPSHOTS,'Snapshot history must remain bounded');
snapshots=workspaceCoreApi.addSnapshot(snapshots,{...rawBlueprint,id:'id-19',title:'Updated'});
assert.equal(snapshots.filter((item)=>item.id==='id-19').length,1,'Saving an existing ID must replace it');
assert.equal(workspaceCoreApi.removeSnapshot(snapshots,'id-19').some((item)=>item.id==='id-19'),false);

const safeEvent = workspaceCoreApi.createEvent('refinement_changed',{refinement:'payments',selected:true,idea:'sensitive',email:'person@example.com',display_name:'Private person'} ,456);
assert.equal(safeEvent.type,'refinement_changed');
assert.equal(safeEvent.timestamp,456);
assert.equal(safeEvent.metadata.refinement,'payments');
assert.equal('idea' in safeEvent.metadata,false);
assert.equal('email' in safeEvent.metadata,false);
assert.equal('display_name' in safeEvent.metadata,false);
assert.equal(workspaceCoreApi.createEvent('unknown_event',{}),null);
let events=[];for(let index=0;index<100;index+=1)events=workspaceCoreApi.addEvent(events,workspaceCoreApi.createEvent('workspace_saved',{count:index}));
assert.equal(events.length,workspaceCoreApi.MAX_EVENTS,'Local event history must remain bounded');
assert.equal(workspaceCoreApi.summarizeEvents(events).workspace_saved,workspaceCoreApi.MAX_EVENTS);
const markdown=workspaceCoreApi.toMarkdown(rawBlueprint);
assert.match(markdown,/# Field Proof/);
assert.match(markdown,/exploratory blueprint/i);
assert.match(markdown,/require human validation/i);

for (const file of ['app.js','forge-v2.js','forge-strategy.js','forge-stories.js','forge-dashboard.js','forge-intelligence-core.js','forge-intelligence.js','forge-refinements.js','forge-workspace-core.js','forge-workspace.js']) {
  assert.doesNotMatch(content[file],/(sk-[A-Za-z0-9_-]{20,}|password\s*=\s*["'][^"']+["'])/i,`Potential secret found in ${file}`);
}

console.log('Crohnoz Forge static, calculation, refinement, and local workspace checks passed.');
