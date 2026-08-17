import { readFile } from 'node:fs/promises';

const errors = [];
const requiredFiles = [
  'index.html','studio.html','privacy.html','styles.css','forge-v2.css','forge-studio.css','app.js',
  'forge-studio-core.js','forge-studio.js','netlify.toml','_headers','_redirects','README.md','SECURITY.md',
];
const contents = Object.fromEntries(await Promise.all(requiredFiles.map(async (file) => [file, await readFile(file, 'utf8')])));
const requireText = (file, value, reason) => { if (!contents[file].includes(value)) errors.push(`${file}: ${reason} (${value}).`); };

// Public Forge contract.
requireText('index.html', 'data-netlify="true"', 'missing Netlify form declaration');
requireText('index.html', 'name="privacy_consent"', 'missing explicit privacy consent');
requireText('index.html', 'No autorizo publicación', 'publication must remain disabled by default');
requireText('index.html', 'No escribas contraseñas', 'missing sensitive-data warning');
requireText('index.html', 'no garantiza factibilidad', 'missing exploratory-result warning');
requireText('index.html', 'id="copy-blueprint"', 'missing blueprint copy action');
requireText('index.html', 'id="download-blueprint"', 'missing blueprint download action');
requireText('index.html', 'id="edit-blueprint"', 'missing blueprint edit action');
requireText('index.html', '/forge-v2.css', 'missing v2 product stylesheet');
requireText('app.js', 'textContent', 'dynamic output must use safe text rendering');
requireText('app.js', 'navigator.clipboard', 'missing clipboard export capability');
requireText('app.js', 'new Blob', 'missing local download capability');

// Forge Studio contract.
requireText('studio.html', 'CROHNOZ</strong><b>FORGE', 'missing Crohnoz Forge identity');
requireText('studio.html', 'id="storage-consent"', 'local persistence must require an explicit control');
requireText('studio.html', 'id="stage-timeline"', 'missing lifecycle visualization');
requireText('studio.html', 'id="gate-list"', 'missing stage gate');
requireText('studio.html', 'id="handoff-preview"', 'missing handoff packet preview');
requireText('studio.html', 'type="module" src="/forge-studio.js"', 'Studio must load through a local ES module');
requireText('forge-studio-core.js', "{ id: 'raw'", 'missing Raw lifecycle stage');
requireText('forge-studio-core.js', "{ id: 'discovery'", 'missing Discovery lifecycle stage');
requireText('forge-studio-core.js', "{ id: 'blueprint'", 'missing Blueprint lifecycle stage');
requireText('forge-studio-core.js', "{ id: 'prototype'", 'missing Prototype lifecycle stage');
requireText('forge-studio-core.js', "{ id: 'testing'", 'missing Testing lifecycle stage');
requireText('forge-studio-core.js', "{ id: 'outcome'", 'missing Outcome lifecycle stage');
requireText('forge-studio.js', "crohnoz-forge.studio-consent.v1", 'missing versioned persistence consent');
requireText('forge-studio.js', 'localStorage', 'missing local workspace persistence boundary');
requireText('forge-studio-core.js', 'serializeProject', 'missing portable project export');
requireText('forge-studio-core.js', 'parseProjectImport', 'missing portable project import');
requireText('forge-studio-core.js', 'toMarkdown', 'missing human-readable handoff');
if (/\sonclick\s*=|\sonchange\s*=|javascript:/i.test(contents['studio.html'])) errors.push('studio.html: inline JavaScript is forbidden by the production CSP.');

// Privacy and deployment contract.
requireText('privacy.html', 'no guarda automáticamente', 'missing local-processing disclosure');
requireText('privacy.html', 'no autoriza su publicación', 'missing independent publication consent');
requireText('_headers', 'Content-Security-Policy', 'missing CSP header');
requireText('_headers', "script-src 'self'", 'scripts must remain same-origin only');
requireText('_redirects', '/studio /studio.html 200', 'missing Forge Studio route');
requireText('_redirects', '/* /index.html 200', 'missing SPA fallback');
requireText('netlify.toml', 'publish = "dist"', 'wrong publish directory');
requireText('README.md', 'processed locally in the browser', 'missing local-processing documentation');
requireText('SECURITY.md', 'No secrets in source', 'missing secret-handling policy');

if (contents['index.html'].includes('La IA propone') || contents['studio.html'].includes('La IA propone')) {
  errors.push('UI must not imply an AI model is connected when generation is deterministic/local.');
}

for (const page of ['index.html', 'studio.html']) {
  const ids = [...contents[page].matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${page}: duplicate HTML ids: ${[...new Set(duplicateIds)].join(', ')}.`);
  const externalScripts = [...contents[page].matchAll(/<script[^>]+src=["'](https?:\/\/[^"']+)/g)];
  if (externalScripts.length) errors.push(`${page}: external JavaScript is not allowed.`);
}

for (const asset of ['/styles.css','/forge-v2.css','/app.js','/assets/forge-mark.svg','/site.webmanifest']) {
  if (!contents['index.html'].includes(asset)) errors.push(`index.html: missing required local asset ${asset}.`);
}
for (const asset of ['/styles.css','/forge-v2.css','/forge-studio.css','/forge-studio.js','/assets/forge-mark.svg']) {
  if (!contents['studio.html'].includes(asset)) errors.push(`studio.html: missing required local asset ${asset}.`);
}

for (const source of Object.values(contents)) {
  const patterns = [/sk-[A-Za-z0-9_-]{20,}/,/ghp_[A-Za-z0-9]{20,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/];
  for (const pattern of patterns) if (pattern.test(source)) errors.push(`Possible secret detected by ${pattern}.`);
}

if (errors.length) {
  console.error(`Forge validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Forge validation passed: public blueprint + Studio lifecycle, privacy, CSP, local persistence, handoff and static delivery are documented.');
