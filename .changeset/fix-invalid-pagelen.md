---
"@pilatos/bitbucket-cli": patch
---

This fixes \`Invalid pagelen\` error when running \`bb pr diff\` without a PR ID.

The issue was that command was requesting \`pagelen=100\` which exceeds Bitbucket Cloud's maximum of 50 for pull requests.

**Changes:**

- Added \`src/constants.ts\` with API pagination limits
- Added validation to \`PullRequestRepository.list()\` to cap limit at 50
- Fixed \`diff.command.ts\` to use \`DEFAULT_PAGELEN.PULL_REQUESTS\` (25)
- Fixed \`edit.command.ts\` to use explicit default limit
- Added tests for pagelen validation

**Testing:**

- All 432 tests pass
- TypeScript linter passes

Fixes #42
