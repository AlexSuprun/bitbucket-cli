# Changelog

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
