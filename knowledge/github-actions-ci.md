---
id: github-actions-ci
description: Pinned actions, OIDC, and explicit workflow permissions
tags: ["ci", "security"]
file_patterns: [".github/workflows/**/*.yml", ".github/workflows/**/*.yaml"]
global: false
---

# GitHub Actions

Pin third-party actions to a commit SHA. Do not deploy with a long-lived cloud key. Use OIDC.

List `permissions` on the workflow or job. Do not grant write to every scope.

Deploys set a `concurrency` group so two runs cannot race. Never echo a secret, including in a debug step.

```yaml
# Bad
permissions: write-all
- uses: some/action@v3

# Good
permissions:
  id-token: write
  contents: read
- uses: some/action@0123abcd
```
