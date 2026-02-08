---
'@pilatos/bitbucket-cli': patch
---

Fix `bb config set` to parse and validate typed configuration values so
`skipVersionCheck` and `versionCheckInterval` are stored and returned as boolean
and number values. Add backward-compatible handling for legacy string values in
version checks and document typed config behavior.
