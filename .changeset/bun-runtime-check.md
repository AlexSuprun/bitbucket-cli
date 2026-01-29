---
"@pilatos/bitbucket-cli": patch
---

Add Bun runtime check and update documentation

- Added runtime check in `src/index.ts` to provide clear error message when CLI is run with Node.js instead of Bun
- Updated `package.json` engines field from `node: ">=20"` to `bun: ">=1.0"`
- Updated all documentation to clarify that Bun runtime is required to execute the CLI
- Updated CI/CD examples to use Bun images and installation steps
- Updated troubleshooting guide to check `bun --version` instead of `node --version`
