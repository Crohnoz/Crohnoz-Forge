# Security policy

## Public demo scope

Crohnoz Forge is currently a public demonstration. It must not receive passwords, API keys, access tokens, private keys, health data, financial credentials, government identifiers, information about minors or confidential material without explicit authorization and an approved handling process.

## Reporting

Do not publish sensitive vulnerability details in a public issue. Contact Crohnoz Labs through the official channels listed at `https://crohnozlabs.cl` and identify the subject as **Crohnoz Forge security report**.

Include:

- affected URL or file;
- reproduction steps;
- expected and observed behavior;
- potential impact;
- suggested mitigation, when available.

## Implementation controls

- No secrets in source, history, fixtures or documentation.
- Minimal GitHub Actions permissions.
- Reproducible dependency installation.
- High-severity dependency audit.
- Content Security Policy and restrictive browser permissions.
- No external JavaScript in the public MVP.
- Explicit privacy consent before human-review submission.
- Publication consent independent and disabled by default.
