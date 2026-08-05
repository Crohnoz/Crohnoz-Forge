# Crohnoz Forge

**Ideas are raw material. Crohnoz Forge turns them into products.**

Crohnoz Forge is the public innovation branch of Crohnoz Labs. The MVP transforms a plain-language problem or idea into an editable, exploratory product blueprint without requiring an account or automatically publishing the supplied information.

## Public experience

- Three-step idea intake with sensitive-data warnings.
- Browser-side blueprint generation.
- Proposed users, workflow, MVP features, screens, risks and metrics.
- Transparent labels separating supplied data, assumptions and inferred risks.
- Scope, automation and integration controls.
- Efficiency simulator using user-entered assumptions.
- Fictional Forge Stories clearly marked as demonstrations.
- Human Forge Review request through Netlify Forms.
- Independent privacy policy and publication consent disabled by default.

## Privacy model

The idea intake is processed locally in the browser. This MVP does not create accounts or automatically persist the idea. Information is only submitted when the visitor separately completes the Forge Review form.

Visitors are warned not to enter passwords, credentials, personal sensitive data or confidential material they are not authorized to share. A generated blueprint is exploratory and does not guarantee feasibility, price, delivery time, confidentiality or intellectual-property terms.

## Technology

The public MVP intentionally uses a small static architecture:

- semantic HTML;
- responsive CSS;
- dependency-free JavaScript;
- Netlify Forms;
- Netlify redirects and security headers;
- Node validation and reproducible static build;
- GitHub Actions quality gate and preview artifact.

No external JavaScript, tracking SDK or production database is included.

## Local development

```bash
npm ci
npm run check
python -m http.server 8000 -d dist
```

Open `http://localhost:8000`.

## Quality gates

```bash
npm audit --audit-level=high
npm run validate
npm run build
```

The validator checks the privacy and publication contracts, security headers, SPA fallback, local rendering approach and common secret patterns.

## Branch strategy

- `main` — stable production branch.
- `develop` — integrated development branch when required.
- `feat/*` — isolated product work.
- `fix/*` — corrective work.

All production changes should use a pull request and a Netlify Deploy Preview.

## Production

- Public URL: `https://crohnoz-forge.netlify.app`
- Privacy: `https://crohnoz-forge.netlify.app/privacy`

---

Crohnoz Forge is a Crohnoz Labs initiative. All rights reserved.
