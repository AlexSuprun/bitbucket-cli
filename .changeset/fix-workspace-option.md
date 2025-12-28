---
"bitbucket-cli": patch
---

Fix workspace option conflict between global and subcommand options

- Global `-w/--workspace` and `-r/--repo` options now work correctly with all subcommands
- Added `withGlobalOptions` helper to properly merge CLI options
- Fixes issue where `bb repo list -w workspace` would fail with "No workspace specified"
