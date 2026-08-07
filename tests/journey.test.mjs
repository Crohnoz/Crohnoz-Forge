import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = (file) => readFileSync(resolve(root, file), 'utf8');
const journey = read('forge-journey.js');
const css = read('journey.css');
const app = read('app.js');
const pkg = JSON.parse(read('package.json'));

assert.match(app, /\.\/journey\.css/);
assert.match(app, /\.\/forge-journey\.js/);
assert.match(pkg.scripts['check:syntax'], /forge-journey\.js/);
assert.match(pkg.scripts.test, /journey\.test\.mjs/);

for (const stage of ['Describe', 'Shape', 'Validate', 'Deliver']) assert.match(journey, new RegExp(stage));
for (const selector of ['#forge', '#blueprint', '#forge-evidence, #intelligence', '#forge-workspace, .review-section']) assert.ok(journey.includes(selector));

assert.match(journey, /MIN_IDEA_LENGTH = 18/);
assert.match(journey, /event\.ctrlKey \|\| event\.metaKey/);
assert.match(journey, /MutationObserver/);
assert.match(journey, /IntersectionObserver/);
assert.match(journey, /aria-live/);
assert.doesNotMatch(journey, /\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/);

assert.match(css, /:focus-visible/);
assert.match(css, /@media \(max-width: 760px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /min-height: 48px/);

console.log('Forge journey quality checks passed.');
