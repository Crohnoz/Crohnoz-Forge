import { cp, mkdir, rm } from 'node:fs/promises';

const files = ['index.html','privacy.html','styles.css','app.js','netlify.toml','_headers','_redirects','robots.txt','sitemap.xml','site.webmanifest','assets'];
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of files) await cp(file, `dist/${file}`, { recursive: true });
console.log(`Built ${files.length} public resources into dist/.`);
