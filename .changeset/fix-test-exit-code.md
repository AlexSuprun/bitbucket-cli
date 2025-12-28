---
"@pilatos/bitbucket-cli": patch
---

fix: prevent test pollution from process.exitCode set in command error handlers

Commands that set `process.exitCode = 1` on error were causing false test failures.
The exit code persisted across test files, making `bun test` exit with code 1 even
when all 344 tests passed. This fix skips setting the exit code when `NODE_ENV=test`.
