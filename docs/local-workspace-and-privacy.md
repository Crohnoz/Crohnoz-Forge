# Crohnoz Forge local workspace and privacy architecture

## Status

This document describes the static-browser implementation introduced in version `0.7.0`. It is an architectural boundary, not a claim that the current public site has authentication, server persistence, or production analytics.

## Design goals

The local workspace exists so a visitor can keep, review, export, import, and compare a Forge Blueprint without creating an account or sending the idea to a remote service.

The local analytics module exists to demonstrate a privacy-conscious product measurement model. It is disabled by default and counts only allowlisted interaction categories after explicit opt-in.

## Storage boundaries

Three browser-local datasets are used:

| Dataset | Purpose | Default state | Maximum scope |
| --- | --- | --- | --- |
| `crohnoz-forge:workspace:v1` | Latest explicitly saved blueprint | Absent | One normalized snapshot |
| `crohnoz-forge:workspace-history:v1` | Local version history | Absent | Five snapshots |
| `crohnoz-forge:analytics:v1` | Aggregate interaction counts | Disabled | Thirty-day local dataset |

No module in this increment uses `fetch`, `XMLHttpRequest`, `sendBeacon`, WebSocket, or a third-party analytics SDK.

## Blueprint export schema

Exports use the marker:

```json
{
  "schema": "crohnoz-forge-blueprint",
  "schemaVersion": 1
}
```

The schema contains:

- structured product inputs;
- an allowlisted refinement set;
- normalized blueprint output;
- human review checkboxes and optional notes;
- local-only metadata;
- a deterministic FNV-1a integrity checksum.

The checksum detects accidental or unsanctioned modification of normalized content. It is not a cryptographic signature and must never be represented as proof of authorship, authenticity, or legal integrity.

### Import controls

Imports are rejected when:

- the file is larger than 300 KB;
- the file is not valid JSON;
- the schema identifier is wrong;
- the schema version is unsupported;
- the idea is below the minimum viable length;
- required product context is missing;
- the supplied checksum does not match normalized content.

Unknown refinements and visual directions are discarded. Strings and arrays are bounded, control characters are removed, and duplicate list entries are collapsed.

## Persistence consent

Local workspace persistence is never automatic on first use.

A visitor may:

- click **Save locally**;
- explicitly enable local autosave;
- export a portable JSON file without saving locally;
- copy a plain-text summary;
- import a previously exported blueprint;
- delete all local workspace data.

A saved blueprint may be offered for restoration, but it is not restored automatically.

## Review readiness

The readiness score is a checklist completion indicator, not a feasibility score or approval decision. It evaluates whether the current snapshot contains:

1. a sufficiently specific problem statement;
2. audience, format, outcome, and current method;
3. a visible critical workflow and first-release features;
4. assumptions and validation questions;
5. explicit human privacy review;
6. explicit human accessibility review;
7. explicit human evidence review;
8. a named owner for the next experiment.

No score authorizes implementation, publication, commercial claims, or handling of sensitive information.

## Local analytics allowlist

Only these event categories may be counted:

- `forge_started`
- `forge_completed`
- `sample_selected`
- `refinement_changed`
- `preview_opened`
- `story_opened`
- `dashboard_filtered`
- `simulator_changed`
- `workspace_saved`
- `workspace_exported`
- `workspace_imported`
- `review_check_changed`

The core rejects unknown event names.

### Allowed metadata

Metadata is restricted by event type. Examples include:

- preview screen identifier;
- number of active refinements;
- selected visual-direction identifier;
- broad fictional story category;
- dashboard status or privacy filter;
- imported schema version;
- review-check identifier and boolean completion state.

### Explicit exclusions

The analytics module must not read or store:

- idea text;
- problem descriptions;
- blueprint output;
- product names;
- person or organization names;
- email addresses;
- phone numbers;
- messages;
- review notes;
- imported file content;
- form submissions.

A sensitive-key rejection pattern is enforced in the calculation core, and the browser analytics module does not query the idea input.

## Retention and deletion

The local analytics dataset has a thirty-day retention boundary. An expired dataset resets on the next evaluation. The visitor can disable future collection without deleting previous counts, export the aggregate dataset, or delete it immediately.

Disabling and deleting are intentionally separate actions so the interface does not pretend data was removed when collection was merely paused.

## Threat model

This local-only model reduces network and third-party exposure, but it does not protect against:

- another person using the same browser profile;
- browser extensions with storage access;
- malware or compromised devices;
- exported files copied to unsafe locations;
- screenshots or clipboard history;
- deliberate editing of an export followed by checksum removal;
- localStorage eviction or browser-data clearing.

Sensitive or regulated information should not be entered into the public Forge demonstration.

## Future authenticated workspace

A future server-backed workspace must not reuse browser-local assumptions without review. It will require:

- authentication and session security;
- multi-organization isolation;
- explicit RBAC;
- field-level authorization where necessary;
- encrypted transport and managed secrets;
- retention and deletion policies;
- audit logging separated from product analytics;
- consent records and publication controls;
- data-subject and contractual review;
- backup and recovery procedures;
- production observability with a documented event dictionary;
- migration tooling for schema-version changes.

The static implementation is a product prototype and architectural reference, not a substitute for those controls.
