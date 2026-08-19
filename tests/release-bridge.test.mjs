import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const publicForge = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const studio = await readFile(new URL('../forge-studio.js', import.meta.url), 'utf8');

const transferKey = 'crohnoz-forge.transfer.v1';

test('public Forge exposes Studio as a first-class continuation', () => {
  assert.match(publicForge, /Abrir Forge Studio/);
  assert.match(publicForge, /Continuar en Studio/);
  assert.match(publicForge, /window\.location\.assign\('\/studio\?from=blueprint'\)/);
});

test('blueprint transfer is same-origin and temporary', () => {
  assert.match(publicForge, new RegExp(transferKey.replaceAll('.', '\\.')));
  assert.match(publicForge, /sessionStorage\.setItem/);
  assert.doesNotMatch(publicForge, /localStorage\.setItem\(STUDIO_TRANSFER_KEY/);
  assert.doesNotMatch(publicForge, /URLSearchParams\([^)]*latestBlueprint/);
});

test('Studio consumes and removes the one-time transfer', () => {
  assert.match(studio, new RegExp(transferKey.replaceAll('.', '\\.')));
  assert.match(studio, /sessionStorage\.getItem\(TRANSFER_KEY\)/);
  assert.match(studio, /sessionStorage\.removeItem\(TRANSFER_KEY\)/);
  assert.match(studio, /createProject\(\{ \.\.\.payload\.project, stageIndex: 0 \}\)/);
});

test('received blueprints still start behind the Raw gate', () => {
  assert.match(studio, /Sigue en Raw/);
  assert.match(studio, /stageIndex: 0/);
});
