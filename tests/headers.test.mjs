import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const headers = await readFile(new URL('../_headers', import.meta.url), 'utf8');

for (const directive of [
  "default-src 'self'",
  "script-src 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  'upgrade-insecure-requests',
]) assert.ok(headers.includes(directive), `Missing CSP directive: ${directive}`);

for (const header of [
  'Referrer-Policy: strict-origin-when-cross-origin',
  'X-Content-Type-Options: nosniff',
  'X-Frame-Options: DENY',
  'Permissions-Policy:',
  'Cross-Origin-Opener-Policy: same-origin',
  'Cross-Origin-Resource-Policy: same-origin',
]) assert.ok(headers.includes(header), `Missing deployment header: ${header}`);

assert.ok(headers.includes('https://fonts.googleapis.com'), 'Google Fonts stylesheet origin must be explicitly allowed');
assert.ok(headers.includes('https://fonts.gstatic.com'), 'Google Fonts asset origin must be explicitly allowed');
assert.ok(headers.includes('Cache-Control: no-cache'), 'HTML must remain revalidated');
assert.ok(headers.includes('max-age=3600, must-revalidate'), 'Unfingerprinted assets must not receive immutable long-term caching');
assert.doesNotMatch(headers, /unsafe-eval/i, 'CSP must not allow unsafe-eval');
assert.doesNotMatch(headers, /\*\s*;/, 'CSP must not contain wildcard source directives');

console.log('Crohnoz Forge deployment header checks passed.');
