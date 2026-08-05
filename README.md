# Crohnoz Forge

**Ideas are raw material. Crohnoz Forge turns them into products.**

Crohnoz Forge is the public innovation branch of Crohnoz Labs. It invites people, teams, and organizations to describe unfinished ideas, unusual concepts, and recurring operational problems, then turns that input into exploratory product blueprints, interactive previews, validation plans, and accountable review artifacts.

The current repository contains a dependency-free static product demonstration. It does **not** yet provide production authentication, server persistence, confidential intake, or a completed Netlify deployment.

## Product vision

A visitor should be able to:

1. Describe an idea or problem in plain language.
2. Add audience, format, intended outcome, and current-process context.
3. **Strike the Forge** and receive an exploratory product blueprint.
4. Explore proposed users, workflows, features, screens, assumptions, risks, integrations, and MVP boundaries.
5. Refine the concept interactively and see the blueprint and preview change.
6. Model an operational scenario without presenting calculated capacity as guaranteed savings.
7. Keep or export the blueprint locally without creating an account.
8. Prepare an internal, client, or public-safe review packet.
9. Submit a separate private Forge Review request for accountable human evaluation.
10. Publish an eventual outcome only through explicit, granular consent.

## Implemented experiences

### Forge an Idea

- Plain-language problem intake.
- Fictional sample ideas.
- Audience, format, goal, and current-method discovery.
- Deterministic blueprint generation.
- Progress and transition states.

### Forge Blueprint

- Product name and value proposition.
- Proposed users.
- First-release features.
- Critical workflow.
- Open assumptions.
- Product tags.
- Interactive Overview, Capture, and Insights preview.

### Product strategy layer

- Problem interpretation.
- Suggested value proposition.
- MVP boundary and non-goals.
- Data requirements and likely integrations.
- Technical, adoption, privacy, and regulatory risks.
- Adoption considerations.
- Suggested discovery, prototype, pilot, and evidence-review phases.

### Refinement engine

Base refinements:

- Simpler.
- Mobile-first.
- QR-enabled.
- AI-assisted with human control.
- SaaS-ready.

Extended refinements:

- Payments.
- Low-risk guest access.
- Inventory.
- Dashboards.
- Multi-organization support.
- Accessibility-first requirements.
- Alternative visual direction.

Each refinement affects visible features, assumptions, tags, validation questions, impact explanations, and preview capabilities. Visual direction cycles through **Precision grid**, **Warm service**, and **Field utility**.

### Forge Intelligence

A reusable calculation core and browser workbench model:

- monthly operations;
- manual minutes per operation;
- potential process reduction;
- hourly capacity value;
- users and operating sites;
- errors and rework;
- expected growth;
- current software cost;
- handoffs, spreadsheets, and systems.

Outputs include baseline effort, friction-adjusted effort, potential capacity release, annual capacity-value scenario, error exposure, rework effort, projected volume, complexity, infrastructure tier, MVP boundaries, and adoption plan.

All outputs remain exploratory. Capacity value is not represented as guaranteed cash savings.

### Forge Stories

- Six clearly fictional case studies.
- Industry filters and result counts.
- Accessible story-detail dialog.
- Raw idea → Discovery → Blueprint → Prototype → Testing → Outcome timeline.
- Anonymous-publication examples.
- Evidence-source labels.
- Non-success outcomes, including validation pending and discontinued experiments.
- Granular identity, figure, screenshot, and approval controls.

Submitted visitor ideas are never added automatically.

### Internal dashboard demo

- Fictional opportunity pipeline.
- Search and status/privacy filters.
- Opportunity classification and review metadata.
- Commercial, technical, complexity, reuse, and SaaS indicators.
- Consent, story eligibility, files, revisions, next steps, notes, and audit history.

This is a static operational demonstration. It does not authenticate users, enforce real RBAC, persist changes, or process files.

### Local blueprint workspace

- Explicit **Save locally** action.
- Optional local autosave, disabled until enabled.
- Five-version local history.
- Versioned JSON export and import.
- Input normalization and import-size boundaries.
- Deterministic integrity checksum and tamper detection.
- Plain-text blueprint summary.
- Restore offer without automatic restoration.
- Separate local workspace deletion.
- Human privacy, accessibility, evidence, and ownership checks.
- Review-readiness checklist indicator.

The checksum detects content mismatch. It is not a cryptographic signature or proof of authorship.

### Private local analytics

- Off by default.
- Explicit visitor opt-in.
- Browser-local aggregate event counts only.
- Strict event and metadata allowlists.
- Sensitive-key rejection.
- Thirty-day retention boundary.
- Export and immediate deletion.
- No third-party analytics SDK.
- No network transmission in this implementation.

The analytics layer does not read or store idea text, problem descriptions, blueprint output, names, organizations, contact details, messages, review notes, imported file contents, or form submissions.

### Portable Review Packet Builder

Three disclosure modes:

- **Internal** — may include raw problem context and explicitly selected internal notes.
- **Client review** — may include raw problem context but always excludes internal notes.
- **Public-safe draft** — removes raw problem context, current method, and internal notes; publication approval remains required.

Configurable sections include scope, non-goals, decisions, risks, validation, delivery phases, evidence controls, review gates, and a sign-off matrix.

Packets can be copied or exported as Markdown and structured JSON. They do not include local analytics data and do not establish approval, feasibility, compliance, deployment readiness, publication consent, or commercial outcome.

## Architecture

The current application is intentionally dependency-free and browser-based.

| Layer | Main files | Responsibility |
| --- | --- | --- |
| Base experience | `index.html`, `styles.css`, `app.js` | Intake, core blueprint, progress, base simulator, asset loading |
| Interactive preview | `forge-v2.js`, `enhancements.css` | Discovery additions, tabs, validation, preview, value simulator |
| Strategy | `forge-strategy.js`, `strategy.css` | Problem, MVP, risks, integrations, adoption, delivery phases |
| Stories | `forge-stories.js`, `stories.css` | Fictional outcomes, filtering, dialog, consent model |
| Dashboard | `forge-dashboard.js`, `dashboard.css` | Fictional opportunity pipeline and detail |
| Intelligence | `forge-intelligence-core.js`, `forge-intelligence.js`, `intelligence.css` | Testable calculations and operational workbench |
| Refinements | `forge-refinements.js`, `refinements.css` | Extended capability and visual-direction controls |
| Workspace | `forge-workspace-core.js`, `forge-workspace-restore-guard.js`, `forge-workspace.js`, `workspace-privacy.css` | Local persistence, schema, checksum, import/export, review readiness |
| Local analytics | `forge-analytics-core.js`, `forge-analytics.js` | Opt-in aggregate browser-local product analytics |
| Review packet | `forge-review-packet-core.js`, `forge-review-packet.js`, `review-packet.css` | Disclosure modes, review gates, Markdown and JSON artifacts |

Core calculation and serialization modules support both browser globals and Node `require`, allowing dependency-free unit testing.

## Local development

Requirements:

- Node.js 20 or newer for checks.
- Any static HTTP server for browser interaction.

Run automated checks:

```bash
npm run check
```

Serve locally with any static server, for example:

```bash
python -m http.server 8080
```

Then open the local address shown by the server.

Do not test browser storage, downloads, clipboard, or forms only through `file://` URLs. Use an HTTP origin.

## Automated validation

The current check pipeline validates:

- JavaScript syntax for all modules;
- required assets and loader order;
- static UI integrity;
- Forge Intelligence calculations and input clamping;
- zero-volume value protection;
- responsive and reduced-motion rules;
- local workspace schema round-trip;
- checksum tamper detection;
- oversized and unrelated import rejection;
- analytics opt-in behavior;
- sensitive metadata exclusion;
- thirty-day analytics expiry;
- absence of network APIs in local workspace, analytics, and packet modules;
- internal, client, and public-safe packet separation;
- public-safe disclosure redaction;
- Markdown and JSON output integrity;
- common browser-secret patterns.

Automated checks do not replace browser, accessibility, deployment, or form verification.

## Manual review

Use [`docs/browser-review-runbook.md`](docs/browser-review-runbook.md) for the required browser, viewport, keyboard, screen-reader, storage, import/export, privacy, forms, and security matrix.

Use issue **#9 — Release gate: connect Netlify and execute browser review runbook** as the single source of truth for environment-dependent release work.

## Privacy architecture

See [`docs/local-workspace-and-privacy.md`](docs/local-workspace-and-privacy.md) for:

- browser storage keys;
- blueprint schema and import controls;
- analytics event allowlist;
- explicit exclusions;
- retention and deletion;
- local threat model;
- requirements for a future authenticated workspace.

Sensitive or regulated information should not be entered into the public demonstration.

## Branch and review strategy

- `main` — stable production branch.
- `develop` — integrated development branch.
- `feature/*` — isolated product increments.
- `deploy/*` — deployment-specific preparation.

Current dependent review chain:

```text
PR #8 → PR #7 → PR #6 → PR #4 → PR #3 → PR #1 → develop
```

Each PR remains draft until its own checks and all dependent environment gates are complete. Do not merge a later PR independently of its base chain.

## Current status

- Static product functionality: implemented through version `0.8.0` on the current feature chain.
- Automated quality checks: green on the current chain head documented in PR #8.
- Netlify project record: exists.
- GitHub-to-Netlify deployment: not completed.
- Deploy preview review: pending.
- Netlify Forms verification: pending.
- Browser/mobile/accessibility review: pending.
- Production readiness: not claimed.

## Delivery principles

- Safe Practices from the first commit.
- Privacy, data minimization, and explicit publication consent by default.
- Clear separation between supplied data, calculations, assumptions, and human decisions.
- No automatic promises about feasibility, delivery dates, confidentiality, ownership, savings, or commercial outcomes.
- Accessible, mobile-first, low-friction interfaces.
- Fictional demo data until production integrations and data handling are approved.
- Small, reviewable, reversible increments.
- Automated checks plus recorded human review.

---

Crohnoz Forge is a Crohnoz Labs initiative. All rights reserved.
