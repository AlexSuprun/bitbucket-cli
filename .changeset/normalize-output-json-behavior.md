---
'@pilatos/bitbucket-cli': minor
---

Normalize CLI output behavior by adding global JSON support to all commands,
introducing global `--no-color` handling, and routing command formatting through
`IOutputService` helpers instead of direct `chalk` usage.
