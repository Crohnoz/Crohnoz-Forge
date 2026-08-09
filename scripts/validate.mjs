import { readFile } from 'node:fs/promises';

const errors = [];
const requiredFiles = ['index.html','privacy.html','styles.css','forge-v2.css','app.js','netlify.toml','_headers','_redirects','README.md','SECURITY.md'];
const contents = Object.fromEntries(await Promise.all(requiredFiles.map(async (file) => [file, await readFile(file, 'utf8')])));
const requireText = (file, value, reason) => { if (!contents[file].includes(value)) errors.push(`${file}: ${reason} (${value}).`); };

requireText('index.html', 'data-netlify="true"', 'missing Netlify form declaration');
requireText('index.html', 'name="privacy_consent"', 'missing explicit privacy consent');
requireText('index.html', 'No autorizo publicación', 'publication must remain disabled by default');
requireText('index.html', 'No escribas contraseñas', 'missing sensitive-data warning');
requireText('index.html', 'no garantiza factibilidad', 'missing exploratory-result warning');
requireText('index.html', 'id="copy-blueprint"', 'missing blueprint copy action');
requireText('index.html', 'id="download-blueprint"', 'missing blueprint download action');
requireText('index.html', 'id="edit-blueprint"', 'missing blueprint edit action');
requireText('index.html', '/forge-v2.css', 'missing v2 product stylesheet');
requireText('privacy.html', 'no guarda automáticamente', 'missing local-processing disclosure');
requireText('privacy.html', 'no autoriza su publicación', 'missing independent publication consent');
requireText('_headers', 'Content-Security-Policy', 'missing CSP header');
requireText('_redirects', '/* /index.html 200', 'missing SPA fallback');
requireText('netlify.toml', 'publish = "dist"', 'wrong publish directory');
requireText('app.js', 'textContent', 'dynamic output must use safe text rendering');
requireText('app.js', 'navigator.clipboard', 'missing clipboard export capability');
requireText('app.js', 'new Blob', 'missing local download capability');
requireText('README.md', 'processed locally in the browser', 'missing local-processing documentation');
requireText('SECURITY.md', 'No secrets in source', 'missing secret-handling policy');

if (contents['index.html'].includes('La IA propone')) errors.push('index.html: must not imply an AI model is connected when generation is deterministic/local.');

const ids = [...contents['index.html'].matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length) errors.push(`Duplicate HTML ids: ${[...new Set(duplicateIds)].join(', ')}.`);
for (const asset of ['/styles.css','/forge-v2.css','/app.js','/assets/forge-mark.svg','/site.webmanifest']) if (!contents['index.html'].includes(asset)) errors.push(`index.html: missing required local asset ${asset}.`);

for (const source of Object.values(contents)) {
  const patterns = [/sk-[A-Za-z0-9_-]{20,}/,/ghp_[A-Za-z0-9]{20,}/,/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,/SUPABASE_SERVICE_ROLE_KEY\s*=\s*\S+/];
  for (const pattern of patterns) if (pattern.test(source)) errors.push(`Possible secret detected by ${pattern}.`);
}
const externalScripts = [...contents['index.html'].matchAll(/<script[^>]+src=["'](https?:\/\/[^"']+)/g)];
if (externalScripts.length) errors.push('External JavaScript is not allowed in the public MVP.');

if (errors.length) {
  console.error(`Forge validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Forge validation passed: privacy, consent, product actions, security headers, local processing and static delivery are documented.');
