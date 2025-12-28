# Changelog

## 0.3.0

### Minor Changes

- [#6](https://github.com/0pilatos0/bitbucket-cli/pull/6) [`7201f22`](https://github.com/0pilatos0/bitbucket-cli/commit/7201f2214109801f6de3921a87955123aa08a4cb) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Add shell completion support for bash, zsh, and fish

  - New `bb completion install` command to set up tab completion
  - New `bb completion uninstall` command to remove completions
  - Completes commands, subcommands, and options
  - Auto-detects shell type during installation

### Patch Changes

- [#12](https://github.com/0pilatos0/bitbucket-cli/pull/12) [`852f0a3`](https://github.com/0pilatos0/bitbucket-cli/commit/852f0a34d36995f7b59aef8f3dadb07c800afb3d) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Improve login command feedback on authentication failure

  - Display error message when authentication fails instead of silently exiting
  - Users now see "Authentication failed: <reason>" when credentials are invalid
  - Helps users debug issues with invalid or expired tokens

- [#3](https://github.com/0pilatos0/bitbucket-cli/pull/3) [`f3a85cc`](https://github.com/0pilatos0/bitbucket-cli/commit/f3a85cc011f271c6a7db98bdb82e61bac120d707) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Add contribution guidelines and changeset enforcement

  - Added CONTRIBUTING.md with development setup, workflow, and release process
  - Added GitHub Action to require changesets on PRs (skips docs-only changes)

- [#14](https://github.com/0pilatos0/bitbucket-cli/pull/14) [`f682af6`](https://github.com/0pilatos0/bitbucket-cli/commit/f682af67254e02e547b363c5b9d7e68f1fda48f7) Thanks [@0pilatos0](https://github.com/0pilatos0)! - fix: prevent test pollution from process.exitCode set in command error handlers

  Commands that set `process.exitCode = 1` on error were causing false test failures.
  The exit code persisted across test files, making `bun test` exit with code 1 even
  when all 344 tests passed. This fix skips setting the exit code when `NODE_ENV=test`.

- [#8](https://github.com/0pilatos0/bitbucket-cli/pull/8) [`c0cd7f0`](https://github.com/0pilatos0/bitbucket-cli/commit/c0cd7f0d8d6ec57bd79faeaefa435d6f96623f14) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Fix workspace option conflict between global and subcommand options

  - Global `-w/--workspace` and `-r/--repo` options now work correctly with all subcommands
  - Added `withGlobalOptions` helper to properly merge CLI options
  - Fixes issue where `bb repo list -w workspace` would fail with "No workspace specified"

## 0.2.0

### Minor Changes

- [`0da57d4`](https://github.com/0pilatos0/bitbucket-cli/commit/0da57d4f65ef1b4fd335c1c0b781579364d22a1f) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Initial release with full CLI functionality

  - Authentication: login, logout, status, token commands
  - Repository management: clone, create, list, view, delete
  - Pull request operations: create, list, view, merge, approve, decline, checkout
  - Configuration management: get, set, list
  - Global options: --json output, --workspace, --repo flags
  - Enterprise architecture with dependency injection

All notable changes to this project will be documented in this file.

## [0.1.0] - Initial Release

### Added

- Initial CLI scaffold with Commander.js
- Enterprise architecture with dependency injection and command pattern
- Authentication commands: `bb auth login`, `bb auth logout`, `bb auth status`, `bb auth token`
- Repository commands: `bb repo clone`, `bb repo create`, `bb repo list`, `bb repo view`, `bb repo delete`
- Pull request commands: `bb pr create`, `bb pr list`, `bb pr view`, `bb pr merge`, `bb pr approve`, `bb pr decline`, `bb pr checkout`
- Configuration commands: `bb config get`, `bb config set`, `bb config list`
- Global options: `--json`, `--workspace`, `--repo`
- Comprehensive test coverage
