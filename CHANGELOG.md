# Changelog

## 1.1.0

### Minor Changes

- [#36](https://github.com/0pilatos0/bitbucket-cli/pull/36) [`c470d86`](https://github.com/0pilatos0/bitbucket-cli/commit/c470d86ac90a8b80101a6d8a2e32e398b27ea1e9) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Add `bb pr edit` command to edit pull request title and description

  - Update title with `--title` / `-t` flag
  - Update description with `--body` / `-b` flag
  - Read description from file with `--body-file` / `-F` flag
  - Auto-detect PR from current branch when ID is omitted
  - Support JSON output with `--json` flag

### Patch Changes

- [#34](https://github.com/0pilatos0/bitbucket-cli/pull/34) [`8613233`](https://github.com/0pilatos0/bitbucket-cli/commit/861323343607f7ea62dada578df0de2f89e06fe2) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Fix "Body already used" error when API requests fail (e.g., `pr approve`, `pr decline`)

## 1.0.0

### Major Changes

- [#29](https://github.com/0pilatos0/bitbucket-cli/pull/29) [`df9a3e7`](https://github.com/0pilatos0/bitbucket-cli/commit/df9a3e76013b16a171d8ccb52ba41242dc19e732) Thanks [@0pilatos0](https://github.com/0pilatos0)! - **BREAKING CHANGE**: Migrate from app passwords to API tokens

  As of September 9, 2025, Bitbucket has deprecated app passwords in favor of API tokens. All existing app passwords will be disabled on June 9, 2026.

  ## Breaking Changes

  - Configuration field `appPassword` renamed to `apiToken`
  - Environment variable `BB_APP_PASSWORD` renamed to `BB_API_TOKEN`
  - All references to "app password" updated to "API token" in docs and CLI output

  ## Migration Guide

  After upgrading, users will need to:

  1. Create a new API token at https://bitbucket.org/account/settings/api-tokens/
  2. Re-authenticate using `bb auth login -u your-username -p your-api-token`

  The authentication mechanism (HTTP Basic Auth) remains unchanged - only the terminology and configuration field names have changed.

  ## Documentation Updates

  - Updated authentication guide with API token creation instructions
  - Updated all command documentation references
  - Added deprecation notices about app passwords

### Minor Changes

- [#30](https://github.com/0pilatos0/bitbucket-cli/pull/30) [`dc169ff`](https://github.com/0pilatos0/bitbucket-cli/commit/dc169fff1211b279f4aadb025a893a4ae22c7544) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Add `bb pr diff` command to view pull request diffs from the CLI

  Implements issue #20 by adding a new `bb pr diff` command that allows users to view pull request diffs directly from the command line without opening the web interface.

  Features:

  - View full unified diff for a specified PR or current branch
  - `--stat` flag to show diffstat (files changed, insertions, deletions)
  - `--name-only` flag to show only names of changed files
  - `--color` flag to control colored output (auto, always, never)
  - `--web` flag to open PR diff in web browser
  - Automatic PR detection based on current git branch when no ID provided
  - Full unit test coverage for command and repository methods
  - Supports all global options (--workspace, --repo, --json)

### Patch Changes

- [#26](https://github.com/0pilatos0/bitbucket-cli/pull/26) [`d3e14e2`](https://github.com/0pilatos0/bitbucket-cli/commit/d3e14e2820d3da314dd4d7dcddbd33a00a67ae8c) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Comprehensive documentation improvements addressing #25

  - Add missing global options (--workspace, --repo, --json) to all command documentation
  - Fix config key naming inconsistency (defaultWorkspace → workspace)
  - Document all available config keys (username, appPassword, workspace, repo)
  - Add detailed explanations for auth command behavior and requirements
  - Enhance command examples with more use cases
  - Add comprehensive repository context resolution guide
  - Fix Node.js version requirement (v18+ → v20+)
  - Add notes about command behavior (e.g., PR checkout branch naming)
  - Document JSON output support across all commands
  - Add security warnings and best practices throughout

## 0.3.2

### Patch Changes

- [#22](https://github.com/0pilatos0/bitbucket-cli/pull/22) [`5fa1bf3`](https://github.com/0pilatos0/bitbucket-cli/commit/5fa1bf3ac7a182e8bf810001db4ec08438d505fa) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Fix commands not displaying error messages when validation fails. Commands now properly show error messages and exit with code 1 when required arguments are missing or validation fails.

## 0.3.1

### Patch Changes

- [#18](https://github.com/0pilatos0/bitbucket-cli/pull/18) [`e7970f0`](https://github.com/0pilatos0/bitbucket-cli/commit/e7970f07b676d66a975e9d02970f3446d02fd182) Thanks [@0pilatos0](https://github.com/0pilatos0)! - Add npm trusted publisher workflow for secure automated releases

  - New `publish.yml` workflow triggered on GitHub release events
  - Uses OIDC trusted publishing (no NPM_TOKEN secret required)
  - Improved security: no long-lived tokens needed for npm publishing

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
