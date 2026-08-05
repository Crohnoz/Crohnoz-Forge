# Crohnoz Forge browser review runbook

## Purpose

This runbook defines the manual verification required before any Crohnoz Forge pull request is marked ready, merged into `develop`, or represented as deployable. Automated checks remain necessary but do not replace this review.

The runbook applies to the complete dependent chain:

1. interactive Forge foundation;
2. strategic blueprint;
3. Forge Stories and internal dashboard demo;
4. Forge Intelligence operational simulator;
5. extended refinement engine;
6. local blueprint workspace and private analytics;
7. portable review packet builder.

## Review evidence

Create one review record per browser and viewport. Each record must contain:

- date and reviewer;
- branch and exact commit SHA;
- browser name and version;
- operating system;
- viewport dimensions;
- result for every required scenario;
- screenshots only where they do not reveal sensitive user-entered content;
- observed defects with reproduction steps;
- explicit pass, conditional pass, or fail decision.

A visual impression such as “looks good” is not sufficient evidence.

## Required browser matrix

| Platform | Browser | Required |
| --- | --- | --- |
| Windows 11 | Chrome current stable | Yes |
| Windows 11 | Edge current stable | Yes |
| Windows 11 | Firefox current stable | Yes |
| Android | Chrome current stable | Yes |
| macOS | Safari current stable | Before production release |
| iOS | Safari current stable | Before production release |

If a required platform is unavailable, record it as an unresolved release gate rather than silently omitting it.

## Required viewport matrix

| Name | Width × height | Purpose |
| --- | --- | --- |
| Narrow mobile | 320 × 568 | Minimum supported narrow layout |
| Standard mobile | 390 × 844 | Common mobile flow |
| Tablet portrait | 768 × 1024 | Breakpoint verification |
| Laptop | 1366 × 768 | Dense desktop constraints |
| Desktop | 1440 × 900 | Primary desktop review |
| Wide desktop | 1920 × 1080 | Maximum-content balance |

Also resize continuously between breakpoints. Passing only fixed screenshots does not prove responsive behavior.

## Test data rules

Use fictional information only.

Do not enter:

- real names;
- real organizations without authorization;
- email addresses or phone numbers;
- credentials or secrets;
- regulated or sensitive information;
- confidential client problems;
- production identifiers;
- real financial or health records.

Recommended fictional scenario:

> A regional warehouse records damaged deliveries across spreadsheets and private messages. Staff need a mobile evidence workflow, accountable ownership, an exception timeline, and a controlled pilot before broader implementation.

## 1. Page foundation

### Layout

- Header, hero, Forge input, workflow explanation, blueprint, simulator, stories, dashboard demo, workspace, privacy center, and review packet appear in a coherent reading order.
- No section overlaps another at any required viewport.
- No horizontal page scroll appears at 320 px width.
- Long tags, filenames, metrics, and generated text wrap without clipping.
- Fixed or sticky elements do not cover focused controls.
- Dynamic content does not cause destructive layout jumps.

### Typography and contrast

- Body copy remains readable at 200% browser zoom.
- Text does not disappear against gradients or cards.
- Status is never communicated by color alone.
- Muted text remains distinguishable from disabled controls.
- Focus indicators remain visible over every background.

### Motion

With `prefers-reduced-motion: reduce` enabled:

- progress and spark effects do not create distracting animation;
- scrolling is not forced to animate;
- toggles and progress bars remain understandable without transitions;
- no content becomes unavailable because animation was removed.

## 2. Idea intake and Forge generation

### Validation

- Empty input cannot generate a blueprint.
- Input shorter than the documented minimum receives an understandable error.
- A valid fictional problem generates successfully.
- Character count updates accurately through typing, pasting, deletion, and restore.
- Pasted multiline text remains usable after normalization.

### Progress

- The generation button becomes unavailable while processing.
- Progress labels update in the expected order.
- Repeated rapid clicks do not create duplicate blueprints.
- The completed blueprint is announced or reached without trapping keyboard focus.

### Output integrity

- Product name, tagline, users, features, assumptions, workflow, tags, preview, strategy, risks, and validation content agree with the selected scenario.
- All generated recommendations remain visibly exploratory.
- No guaranteed feasibility, savings, compliance, or commercial result appears.

## 3. Preview and refinement engine

### Base preview

- Overview, Capture, and Insights tabs are keyboard operable.
- `aria-selected` matches the visible tab.
- Each tab changes meaningful preview content.
- Preview content remains readable on mobile.

### Base refinements

Verify simpler, mobile-first, QR, AI, and SaaS independently and in combination.

For every refinement:

- pressed state matches selection;
- feature list changes visibly;
- assumptions change where relevant;
- tags update;
- validation questions update when required;
- repeated selection does not create duplicate generated items.

### Extended refinements

Verify payments, guest access, inventory, dashboards, multi-organization, accessibility-first, and visual direction.

Specific safeguards:

- payments show reconciliation, reversal, tax, and provider assumptions;
- guest access remains restricted to low-risk actions;
- multi-organization adds isolation questions;
- accessibility-first enlarges targets without breaking layout;
- AI remains human-controlled and auditable;
- visual direction cycles through Precision grid, Warm service, and Field utility without changing product purpose.

## 4. Strategic blueprint

Verify that the strategy layer presents:

- problem interpretation;
- suggested value proposition;
- MVP boundary;
- out-of-scope items;
- data requirements;
- likely integrations;
- technical, adoption, privacy, and regulatory risks;
- adoption considerations;
- discovery, prototype, pilot, and evidence-based scale phases.

Change audience, format, goal, current method, idea text, and refinements. Confirm that strategy output updates and remains internally consistent.

## 5. Forge Intelligence

### Input boundaries

Test minimum, typical, and maximum values for:

- monthly operations;
- minutes per operation;
- reduction scenario;
- hourly value;
- users and branches;
- error and rework rates;
- growth rate;
- software cost;
- handoffs, spreadsheets, and systems.

### Calculated output

- Zero operations produce zero capacity value.
- Increasing operations or minutes increases baseline effort.
- Increasing reduction cannot imply complete elimination beyond the configured cap.
- Complexity and infrastructure recommendations change when organizational and integration complexity rises.
- Currency and hour formatting remain readable at narrow widths.
- Calculated output is announced accessibly without excessive repeated announcements.
- Capacity value is never worded as guaranteed cash savings.

## 6. Forge Stories

- Every category filter changes the visible collection and result count.
- Each story opens through keyboard and pointer interaction.
- Dialog focus moves inside when opened and returns to the trigger when closed.
- Escape closes the dialog where supported.
- Timeline includes Raw idea, Discovery, Blueprint, Prototype, Testing, and Outcome.
- Anonymous and fictional labels remain visible.
- Non-success states such as validation pending or experiment discontinued remain represented.
- Publication controls distinguish identity, figures, screenshots, and approval.
- No submitted visitor idea appears automatically.

## 7. Internal dashboard demo

- Search works for fictional identifier, organization, industry, owner, and problem text.
- Status and privacy filters combine correctly.
- Empty-result states are understandable.
- Opportunity detail displays classification, reviewer, consent, eligibility, files, revisions, next step, internal notes, and audit history.
- Private, restricted, sensitive, and fictional states remain clearly distinguished.
- The interface never suggests that static demo changes are persisted or authenticated.

## 8. Local blueprint workspace

### Default state

Clear site data before testing.

- No blueprint is persisted automatically.
- Autosave is off.
- No restore offer appears.
- Export and copy actions do not claim publication.

### Explicit save

- Generate a blueprint and click **Save locally**.
- Confirm the saved state and timestamp update.
- Reload the page.
- Confirm a restore offer appears but restoration does not happen automatically.
- Dismiss the offer and confirm the current form is unchanged.
- Reload and restore; confirm the blueprint is regenerated from validated inputs.

### Autosave

- Enable autosave explicitly.
- Change idea context, refinements, review checks, and notes.
- Confirm the saved-state indicator changes from dirty to autosaved.
- Disable autosave and verify subsequent changes remain unsaved.
- Confirm disabling autosave does not falsely claim existing saves were deleted.

### Version history

- Create more than five distinct saves.
- Confirm only the five latest unique snapshots remain.
- Restore an older snapshot.
- Confirm base and extended refinements reset correctly before restoration.
- Confirm visual direction restores consistently.

### Storage unavailable

Test with browser storage blocked or unavailable where possible.

- Saving reports that local storage is unavailable.
- Export remains available.
- The application does not crash.
- No misleading saved state appears.

### Deletion

- Delete local workspace data.
- Confirm latest snapshot, history, restore offer, and autosave preference are cleared.
- Confirm analytics data is not claimed to be deleted by the workspace action.

## 9. Blueprint import and export

### Valid export

- Export a blueprint.
- Confirm JSON contains schema identifier and version.
- Confirm metadata states local-only and no secrets.
- Confirm checksum exists.
- Import the file and verify product context, refinements, visual direction, review checks, and notes.

### Invalid files

Verify rejection of:

- invalid JSON;
- unrelated JSON;
- unsupported schema version;
- missing audience or format;
- problem shorter than the accepted minimum;
- file larger than 300 KB;
- manipulated normalized content with the original checksum;
- unknown refinements and visual directions.

The UI must report failure without partially overwriting the current valid blueprint.

### Clipboard summary

- Copy the plain-text summary.
- Confirm it includes problem, audience, format, outcome, method, refinements, features, workflow, assumptions, and validation questions.
- Confirm it contains no `undefined` or `null` placeholders.
- Confirm it preserves the exploratory disclaimer.

## 10. Private local analytics

### Consent boundary

Clear analytics storage before testing.

- Analytics is off by default.
- Interactions before opt-in do not increment counts.
- Enabling analytics clearly states local aggregate collection.
- Disabling stops future counting.
- Disabling does not falsely claim previous counts were deleted.

### Data minimization

After opt-in, interact with Forge generation, samples, previews, stories, dashboard filters, simulator, workspace actions, and review checks.

Export the analytics dataset and confirm it contains only:

- schema and version;
- timestamps and retention;
- aggregate event counts;
- broad allowlisted identifiers;
- local-storage and no-network indicators.

Confirm it does not contain:

- idea text;
- problem description;
- blueprint output;
- names or organizations;
- email or phone;
- messages or review notes;
- imported file content;
- form submissions.

### Retention and deletion

- Confirm the UI documents thirty-day retention.
- Delete analytics data.
- Confirm all counts reset.
- Confirm workspace saves remain intact.

### Network inspection

With browser developer tools open:

- clear the Network panel;
- exercise all analytics-supported interactions;
- confirm no analytics endpoint, beacon, XHR, fetch, WebSocket, or third-party SDK request appears.

## 11. Review packet builder

### Internal mode

- Generate with all sections selected.
- Confirm raw problem may be included.
- Confirm internal notes remain excluded unless explicitly selected.
- Confirm scope, decisions, risks, validation, delivery, evidence, sign-off, next decision, and disclaimer appear.

### Client mode

- Confirm raw problem can be included.
- Confirm internal review notes cannot be included.
- Confirm classification says client review draft.

### Public-safe mode

- Confirm raw problem is removed and the control is disabled.
- Confirm current method is removed.
- Confirm internal review notes are removed.
- Confirm the artifact explicitly states publication approval is still required.
- Confirm public-safe does not mean approved or published.

### Gates

- Mark and unmark each human review checkbox.
- Regenerate and confirm privacy, accessibility, evidence, and ownership gates change.
- Confirm deployment always remains `pending-environment-verification` until actual environment review is completed.
- Confirm problem, scope, and validation gates reflect blueprint completeness rather than human approval.

### Export

- Copy Markdown.
- Export `.md` and JSON.
- Confirm the selected disclosure mode and sections are preserved.
- Confirm analytics data is absent.
- Confirm filenames remain safe when product names contain spaces or punctuation.

## 12. Keyboard-only review

Starting at the browser address bar, complete these tasks without a pointer:

1. reach and fill the idea form;
2. generate a blueprint;
3. operate all preview tabs;
4. select and deselect refinements;
5. operate every simulator control;
6. open and close a Forge Story;
7. search and filter the dashboard;
8. save and export the workspace;
9. toggle review checks;
10. enable and disable local analytics;
11. generate and export a review packet.

Verify:

- focus order follows visual and semantic order;
- no focus trap exists outside modal dialogs;
- focused controls remain visible;
- disabled controls are understandable;
- dynamic status updates do not unexpectedly steal focus.

## 13. Screen-reader smoke test

At minimum, use one available screen reader on desktop and one mobile platform before production release.

Verify:

- headings provide a usable outline;
- labels identify every input;
- tabs expose role and selection state;
- dialogs have an accessible name;
- status regions announce meaningful outcomes without excessive noise;
- sliders expose name, value, minimum, and maximum;
- decorative sparks and visual effects are not announced;
- review gates and checklists are understandable without color;
- exported-content controls have specific names.

## 14. Forms and Netlify

These checks require a real deploy preview or production-like Netlify deployment.

- Netlify detects the Forge Review form.
- Honeypot remains present and hidden from normal users.
- Valid submission is received once.
- Invalid and incomplete submissions are blocked accessibly.
- Duplicate rapid submission does not create accidental multiple records.
- Confirmation state is understandable.
- Submitted content is not inserted into Forge Stories.
- Sensitive fields are not exposed in URLs, console output, or client-side analytics.

Until these checks are completed, forms and deployment remain unresolved gates.

## 15. Security and privacy inspection

- Browser console contains no secrets, tokens, credentials, stack traces, or sensitive form values.
- Source files contain no production credentials.
- Imported JSON is rendered through escaped text, not executable markup.
- Long or adversarial strings do not break the UI.
- Download filenames are normalized.
- The static dashboard does not pretend to provide RBAC.
- Public-safe packet generation cannot reveal internal notes through hidden elements, exported JSON, or Markdown.
- Workspace deletion and analytics deletion remain separate and accurately described.

## 16. Release decision

A branch may be considered ready for integration only when:

- GitHub Actions is green on the exact reviewed commit;
- all required desktop and mobile scenarios pass;
- unresolved defects have severity and owner;
- Netlify deploy preview is available and reviewed;
- forms are verified in the deployed environment;
- accessibility smoke tests are recorded;
- privacy and publication controls are reviewed;
- the review packet identifies no unresolved blocking gate;
- rollback or revert strategy is understood.

Do not mark the PR ready, merge it, or describe the site as deployed while any blocking item remains unresolved.
