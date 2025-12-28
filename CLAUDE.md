# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
bun install          # Install dependencies
bun run dev          # Run CLI in development mode (bun run src/index.ts)
bun run build        # Build for production (outputs to dist/)
bun run test         # Run all tests
bun test <file>      # Run a single test file (e.g., bun test tests/commands/repo.test.ts)
bun run lint         # Type-check with TypeScript (tsc --noEmit)
bun run generate:api # Regenerate API client from OpenAPI spec
```

Documentation site (Astro-based, in `docs/`):

```bash
bun run docs:dev     # Run docs site locally
bun run docs:build   # Build docs site
```

## Architecture Overview

This is a CLI for Bitbucket Cloud, inspired by GitHub's `gh` CLI. Built with Bun, TypeScript, and Commander.js.

### Layer Structure

```
src/
├── index.ts         # Entry point - just calls cli.parse()
├── cli.ts           # Commander.js setup, routes to commands
├── bootstrap.ts     # DI container wiring - registers all services
├── commands/        # Command implementations (auth/, repo/, pr/, config/, completion/)
├── services/        # Business logic (ConfigService, GitService, ContextService, etc.)
├── repositories/    # API data access (UserRepository, RepoRepository, PullRequestRepository)
├── core/            # DI container, base command class, interfaces
├── types/           # TypeScript types, Result type, error codes
├── generated/       # Auto-generated Bitbucket API models (excluded from lint)
└── lib/             # Utility modules (legacy, being migrated to services/)
```

### Key Patterns

**Dependency Injection**: Uses a simple IoC container (`src/core/container.ts`). All services and commands are registered in `bootstrap.ts` and resolved via `ServiceTokens`.

**Result Type**: Operations return `Result<T, BBError>` instead of throwing. Use `Result.ok()`, `Result.err()`, `Result.isOk()`, `Result.isErr()`. Located in `src/types/result.ts`.

**BaseCommand**: Commands extend `BaseCommand<TOptions, TResult>` which provides:

- `handleResult()` - outputs success/error appropriately
- `requireOption()` - validates required options
- Constructor injection of `IOutputService`

**Context Resolution**: `ContextService` automatically detects workspace/repo from git remote URL or config. Commands use `requireRepoContext()` for context-dependent operations.

### Adding a New Command

1. Create command file in appropriate subdirectory (e.g., `src/commands/pr/new.command.ts`)
2. Extend `BaseCommand` and implement `execute()` returning `Result<T, BBError>`
3. Add `ServiceToken` in `src/core/container.ts`
4. Register in `src/bootstrap.ts` with dependencies
5. Wire up in `src/cli.ts` with Commander

### Testing

Tests use Bun's test runner with mock factories from `tests/setup.ts`:

- `createMockConfigService()` - config with optional defaults
- `createMockOutputService()` - captures output in `.logs` array
- `createMockGitService()` - git operations with configurable state
- `createMockHttpClient()` - HTTP responses by path
- Mock data: `mockUser`, `mockRepository`, `mockPullRequest`

Tests reset the DI container before/after each test automatically.

## Contribution Requirements

1. **Write unit tests** for all new functionality
2. **Update documentation** in both README.md and the docs site (`docs/src/content/docs/`)
3. **Add a changeset** for all PRs affecting the package: `bun changeset`
4. Run `bun run test` and `bun run lint` before submitting
5. follow the CONTRIBUTING.md guidelines

## Error Codes

Error codes are defined in `src/types/errors.ts`. Ranges:

- 1xxx: Auth errors
- 2xxx: API errors
- 3xxx: Git errors
- 5xxx: Validation errors
- 6xxx: Context errors
