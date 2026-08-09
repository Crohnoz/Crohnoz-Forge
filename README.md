# Crohnoz Forge

**Ideas are raw material. Crohnoz Forge turns them into decisions before they become software.**

Crohnoz Forge is the public innovation workspace of Crohnoz Labs. The current product transforms a plain-language problem or idea into an exploratory blueprint without requiring an account or automatically publishing or persisting the supplied information.

## Public experience

- Single-workspace idea intake with required sensitive-data warnings.
- Optional advanced context for volume, data sensitivity and constraints.
- Quick-start examples that populate the workspace without submitting data.
- Browser-side deterministic blueprint generation.
- Proposed users, workflow, MVP features, screens, risks, metrics and recommended next step.
- Explainable readiness snapshot for potential impact and relative complexity.
- Copy-to-clipboard and local `.txt` download actions.
- Ability to return to the original idea and forge another iteration.
- Fictional examples clearly marked as demonstrations.
- Human Forge Review request through Netlify Forms.
- Independent privacy policy and publication consent disabled by default.

## Product integrity

The public version uses a deterministic local exploration engine; it does **not** claim that an external AI model is connected. If an AI-assisted generation layer is introduced later, it must run through a secure server-side boundary with secrets outside the public client and with the privacy contract updated accordingly.

## Privacy model

The idea intake is processed locally in the browser. This product does not create accounts or automatically persist the idea. Information is only submitted when the visitor separately completes the Forge Review form.

Visitors are warned not to enter passwords, credentials, personal sensitive data or confidential material they are not authorized to share. A generated blueprint is exploratory and does not guarantee feasibility, price, delivery time, confidentiality or intellectual-property terms.

## Technology

The public product intentionally uses a small static architecture:

- semantic HTML;
- responsive CSS with a separate Forge v2 product layer;
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

The validator checks privacy and publication contracts, security headers, SPA fallback, local rendering, blueprint export controls, required assets and common secret patterns.

## Branch strategy

- `main` — stable production branch.
- `develop` — integrated development branch when required.
- `feat/*` / `product/*` — isolated product work.
- `fix/*` — corrective work.

All production changes should use a pull request and a Netlify Deploy Preview.

## Production

- Public URL: `https://crohnoz-forge.netlify.app`
- Privacy: `https://crohnoz-forge.netlify.app/privacy`

---

Crohnoz Forge is a Crohnoz Labs initiative. All rights reserved.
