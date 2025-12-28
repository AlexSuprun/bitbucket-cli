---
"@pilatos/bitbucket-cli": patch
---

Add npm trusted publisher workflow for secure automated releases

- New `publish.yml` workflow triggered on GitHub release events
- Uses OIDC trusted publishing (no NPM_TOKEN secret required)
- Improved security: no long-lived tokens needed for npm publishing
