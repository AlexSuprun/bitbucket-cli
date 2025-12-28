# Changelog

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
