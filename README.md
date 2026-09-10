# Crohnoz Forge

[![Forge Quality](https://github.com/Crohnoz/Crohnoz-Forge/actions/workflows/quality.yml/badge.svg)](https://github.com/Crohnoz/Crohnoz-Forge/actions/workflows/quality.yml)

**L1 · Prototype / R&D**

**Ideas are raw material. Crohnoz Forge turns them into decisions before they become software.**

Crohnoz Forge is the innovation workspace of Crohnoz Labs. It has two complementary surfaces: a fast public Forge that converts a plain-language problem into an exploratory blueprint, and **Forge Studio**, a local-first project workspace that carries the work from raw idea to evidence, prototype, testing and handoff.

The project is deliberately presented as **R&D**. Its current value is in validating the workflow, product boundaries and decision model rather than claiming production maturity.

## Product surfaces

### Public Forge — `/`

- Single-workspace idea intake with required sensitive-data warnings.
- Optional advanced context for volume, data sensitivity and constraints.
- Quick-start examples that populate the workspace without submitting data.
- Browser-side deterministic blueprint generation.
- Proposed users, workflow, MVP features, screens, risks, metrics and recommended next step.
- Explainable readiness snapshot for potential impact and relative complexity.
- Copy-to-clipboard and local `.txt` download actions.
- Fictional examples clearly marked as demonstrations.
- Human Forge Review request through Netlify Forms.
- Independent privacy policy and publication consent disabled by default.

### Forge Studio — `/studio`

Forge Studio turns the blueprint concept into an operational product workspace with a six-stage lifecycle:

`Raw → Discovery → Blueprint → Prototype → Testing → Outcome`

It includes:

- multiple local projects with search and active-project state;
- explicit stage gates that block advancement until the current learning criteria are met;
- Forge Readiness score and a concrete next-action recommendation;
- assumptions register with open / validated / rejected status;
- evidence ledger for observations, interviews, data, constraints and tests;
- MVP scope and success metrics;
- prototype notes and observable test scenarios;
- decision log and iteration milestones;
- outcome / learning notes;
- human-readable Markdown handoff packet;
- portable `.forge.json` import/export for moving work between browsers.

Persistence is **off by default**. Studio works in memory for the current session until the visitor explicitly enables local browser storage. No account, remote database, analytics SDK or automatic upload is required for the workspace.

## Product integrity

The public blueprint engine is deterministic and local; Crohnoz Forge does **not** claim that an external AI model is connected. Forge Studio is likewise a workflow and decision-support product, not an undisclosed AI service.

If an AI-assisted layer is introduced later, it must run through a secure server-side boundary with secrets outside the public client, explicit model behavior and an updated privacy contract.

## Privacy model

The idea intake is processed locally in the browser. The public Forge does not create accounts or automatically persist the idea. Information is only submitted when the visitor separately completes the Forge Review form.

Forge Studio also starts non-persistent. Local persistence requires explicit opt-in and stays on that browser. Projects can always be exported as Markdown or `.forge.json`; disabling persistence removes the stored browser copy while leaving the current in-memory session available until navigation/reload.

Visitors are warned not to enter passwords, credentials, personal sensitive data or confidential material they are not authorized to share. A generated blueprint, readiness score or stage gate is exploratory and does not guarantee feasibility, price, delivery time, confidentiality or intellectual-property terms.

## Technology

The current product intentionally uses a small static architecture:

- semantic HTML;
- responsive CSS with Forge v2 and Forge Studio product layers;
- dependency-free JavaScript and ES modules;
- localStorage only behind explicit Studio consent;
- Netlify Forms for voluntary human review;
- Netlify redirects and strict security headers;
- Node validation, tests and reproducible static build;
- GitHub Actions quality gate and preview artifact.

No external JavaScript, tracking SDK or production database is included.

## Local development

```bash
npm ci
npm run check
python -m http.server 8000 -d dist
```

Open:

- `http://localhost:8000/` — Public Forge
- `http://localhost:8000/studio` — Forge Studio

## Quality gates

```bash
npm audit --audit-level=high
npm run validate
npm test
npm run build
```

`npm run check` runs validation, tests and the reproducible build in sequence.

The validator checks public privacy/publication contracts, Studio persistence consent, the six-stage lifecycle, stage-gate/handoff capabilities, CSP compatibility, same-origin scripts, deployment routes, required assets and common secret patterns. The test suite covers lifecycle gates, readiness progression, stage advancement, iteration snapshots and portable handoff import/export.

## Branch strategy

- `main` — stable public branch.
- `develop` — integrated development branch when required.
- `feat/*` / `product/*` — isolated product work.
- `fix/*` — corrective work.

Changes intended for the public surface should use a pull request and a Netlify Deploy Preview.

## Current limits

Forge remains a prototype. It has not yet demonstrated the sustained real-user usage, operational continuity or production evidence required to move to L2.

`L0 IDEA → ● L1 PROTOTYPE → L2 PILOT → L3 PRODUCTION → L4 SCALE`

The maturity label moves only when evidence supports it.

## Public demo

- Public Forge: `https://crohnoz-forge.netlify.app`
- Forge Studio: `https://crohnoz-forge.netlify.app/studio`
- Privacy: `https://crohnoz-forge.netlify.app/privacy`

## Crohnoz Labs

Crohnoz Forge is part of the Crohnoz Labs product-engineering portfolio.

**Problem → System → Evidence → Scale**

- Crohnoz profile and public evidence: https://github.com/Crohnoz
- Crohnoz Labs: https://crohnozlabs.cl
