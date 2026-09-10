<div align="center">

<img src="https://raw.githubusercontent.com/Crohnoz/Crohnoz/main/brand/assets/logo-horizontal-dark.svg" alt="Crohnoz Labs" width="340" />

# Crohnoz Forge

### `L1 · Prototype / R&D`

**Ideas are raw material. Forge turns ambiguity into structured product decisions before implementation begins.**

[![Forge Quality](https://github.com/Crohnoz/Crohnoz-Forge/actions/workflows/quality.yml/badge.svg)](https://github.com/Crohnoz/Crohnoz-Forge/actions/workflows/quality.yml)

<a href="https://crohnoz-forge.netlify.app"><img src="https://img.shields.io/badge/TRY-PUBLIC_FORGE-EC4899?style=for-the-badge" height="34" alt="Try Public Forge" /></a>
<a href="https://crohnoz-forge.netlify.app/studio"><img src="https://img.shields.io/badge/OPEN-FORGE_STUDIO-8B5CF6?style=for-the-badge" height="34" alt="Open Forge Studio" /></a>
<a href="https://github.com/Crohnoz/Crohnoz/blob/main/evidence/forge.md"><img src="https://img.shields.io/badge/READ-ENGINEERING_CASE-3B82F6?style=for-the-badge" height="34" alt="Read engineering case" /></a>

**Raw → Discovery → Blueprint → Prototype → Testing → Outcome**

</div>

---

## Product role

Crohnoz Forge is the **product-reasoning R&D workspace** inside Crohnoz Labs. It explores how a vague operational problem can become an explicit product hypothesis, evidence set, scope, prototype and decision trail before engineering effort is committed blindly.

The project deliberately remains at `L1`. Its current value is proving the workflow, boundaries and decision model—not claiming sustained production use.

---

## What it proves at a glance

| Capability | Current evidence |
|---|---|
| **Structured discovery** | Plain-language problems become explicit users, workflows, risks, metrics and MVP hypotheses |
| **Evidence-driven progression** | Assumptions and observations are recorded rather than treated as facts |
| **Stage gates** | Studio blocks progression until the current learning criteria are satisfied |
| **Local-first privacy** | Work starts in memory; browser persistence requires explicit opt-in |
| **Portable handoff** | Projects can leave the tool as Markdown and `.forge.json` |
| **Product integrity** | The public generator is described accurately as deterministic/local rather than falsely marketed as connected AI |

---

## Two product surfaces

### Public Forge — `/`

A fast, browser-side exploratory blueprint surface for turning a problem statement into a first structured product view.

It includes sensitive-data warnings, optional operational context, fictional quick-start examples, deterministic blueprint generation, proposed users/workflows/features/screens/risks/metrics, explainable readiness signals, local export and an optional human review request.

### Forge Studio — `/studio`

A local-first workspace for carrying product reasoning through six explicit stages:

`Raw → Discovery → Blueprint → Prototype → Testing → Outcome`

Studio includes project search, stage gates, readiness guidance, assumptions, evidence, MVP scope, success metrics, prototype notes, observable tests, decision history, iteration milestones and outcome/learning notes.

---

## Privacy and persistence model

Persistence is **off by default**. Studio begins as in-memory session state until the visitor explicitly enables browser storage.

The public Forge does not automatically create accounts, upload idea text or persist project content remotely. A separate Forge Review submission is the only voluntary transmission path on the public surface.

Visitors are warned not to submit passwords, credentials, sensitive personal data or confidential information they are not authorized to share.

---

## Product integrity

Forge does **not** currently claim that an external AI model generates its blueprint. The public engine is deterministic and local, while Studio is a workflow and decision-support product.

If AI assistance is introduced later, the design contract requires a server-side boundary, secrets outside the public client, explicit model behavior and an updated privacy agreement.

That distinction matters: **capability should be described by what the system actually does, not by fashionable labels**.

---

## Engineering surface

`Semantic HTML` · `Responsive CSS` · `JavaScript / ES Modules` · `Local-first state` · `Netlify Forms` · `Security headers` · `Node validation` · `Tests` · `GitHub Actions`

No external JavaScript, tracking SDK or production database is required by the current public product.

<details>
<summary><strong>Quality gates and local development</strong></summary>

<br/>

```bash
npm audit --audit-level=high
npm run validate
npm test
npm run build
```

`npm run check` runs validation, tests and the reproducible build in sequence.

Local preview:

```bash
npm ci
npm run check
python -m http.server 8000 -d dist
```

Open:

- `http://localhost:8000/` — Public Forge
- `http://localhost:8000/studio` — Forge Studio

The validator checks privacy/publication contracts, persistence consent, lifecycle behavior, stage-gate and handoff capabilities, CSP compatibility, same-origin scripts, deployment routes, required assets and common secret patterns.

</details>

---

## Current maturity

<div align="center">

### `L0 IDEA → ● L1 PROTOTYPE → L2 PILOT → L3 PRODUCTION → L4 SCALE`

</div>

Forge has not yet demonstrated the sustained real-user usage, operational continuity and production evidence needed to advance to `L2`.

The next maturity gate is therefore **evidence of repeated use in real discovery workflows**, not more visual polish.

---

## Public surfaces

- **Public Forge:** https://crohnoz-forge.netlify.app
- **Forge Studio:** https://crohnoz-forge.netlify.app/studio
- **Privacy:** https://crohnoz-forge.netlify.app/privacy
- **Curated engineering case:** https://github.com/Crohnoz/Crohnoz/blob/main/evidence/forge.md

---

<div align="center">

### Crohnoz Labs

**Problem → System → Evidence → Scale**

<a href="https://github.com/Crohnoz"><img src="https://img.shields.io/badge/RETURN-ENRIQUE_FLORES_PROFILE-8B5CF6?style=for-the-badge" height="34" alt="Return to profile" /></a>
<a href="https://crohnozlabs.cl"><img src="https://img.shields.io/badge/ENTER-CROHNOZ_LABS-EC4899?style=for-the-badge" height="34" alt="Crohnoz Labs" /></a>

</div>
