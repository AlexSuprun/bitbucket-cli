# AGENTS.md

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Run CLI in development mode
bun run build        # Build for production
bun test             # Run all tests
bun test <file>      # Run single test file (e.g., bun test tests/commands/repo.test.ts)
bun run lint         # Type-check with TypeScript (tsc --noEmit)
bun run format       # Format all files with Prettier
bun run format:check # Check formatting without modifying files
bun run generate:api # Regenerate API client from OpenAPI spec
```

## Code Style Guidelines

### Imports

- All imports must use `.js` extensions (ES modules)
- Import local modules first, then third-party packages
- Use `import type { X }` for type-only imports
- Example: `import { BBError } from "../types/errors.js"`

### Formatting

- Use Prettier (no explicit config - default settings)
- 2-space indentation
- No trailing whitespace
- Single quotes for strings

### Types

- Always use explicit return types on functions, especially public methods
- Use standard Promises and throw BBError for operations that can fail
- Type-only exports: `export type { Options }` or `import type { Options }`
- Use interfaces for public APIs, types for internal data structures
- Avoid `any` - use `unknown` for truly dynamic values
- Use `Array.from()` to convert Set to Array when working with generated API responses

### Naming Conventions

- Classes: PascalCase (e.g., `ConfigService`, `ListReposCommand`)
- Functions/Methods: camelCase (e.g., `execute`, `getConfig`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- Interfaces: PascalCase with `I` prefix (e.g., `IConfigService`)
- Private members: prefix with underscore (e.g., `private readonly _cache`)
- Type parameters: Single uppercase letter (e.g., `T`, `E`, `R`)

### Error Handling

- Never throw errors in business logic - return `Result.err()`
- Use `Result.ok()` for success, `Result.err()` for failure
- Use `Result.isOk()` and `Result.isErr()` to check results
- Use `ErrorCode` enum from `src/types/errors.ts` for error codes
- Always handle Result types before proceeding
- Only throw errors in truly exceptional circumstances (e.g., unexpected system failures)

### Error Handling

- Use standard Promises with try/catch for error handling
- Throw `BBError` instances with appropriate `ErrorCode` for expected failures
- Use `ErrorCode` enum from `src/types/errors.ts` for error codes
- Handle errors at the CLI level (commands throw, CLI catches and displays)
- Use `handleError()` method in commands for consistent error output

### Command Pattern

- Extend `BaseCommand<TOptions, TResult>` for all CLI commands
- Implement `name`, `description`, and `execute()` methods
- Inject dependencies via constructor
- Use `handleError()` for consistent error handling
- Use `requireOption()` for option validation
- Return `Promise<TResult>` from execute()

### Dependency Injection

- Register all services/commands in `bootstrap.ts`
- Use `ServiceTokens` string constants for registration keys
- Resolve dependencies from container
- Services are singletons by default

### File Organization

- Commands: `src/commands/<category>/<action>.command.ts`
- Services: `src/services/<name>.service.ts`
- Generated API: `src/generated/` (auto-generated from OpenAPI spec)
- Types: `src/types/<name>.ts`
- Tests: Mirror src structure in `tests/` directory

### Testing

- Use Bun test runner
- Mock factories in `tests/setup.ts`
- Reset DI container before/after each test (automatic in setup.ts)
- Test files: `<name>.test.ts` or `<name>.expanded.test.ts`
- Use descriptive test names that explain what is being tested

### Async/Await

- Always use async/await instead of Promise chains
- Mark async methods explicitly
- Handle errors with try/catch, not Result type

### Comments

- Only add comments when necessary - prefer self-documenting code
- No inline comments that explain what code does (only why)
- JSDoc comments for public APIs

### Security

- Never log or commit secrets (API tokens, passwords)
- Use 0o600 file permissions for config files containing secrets
- Sensitive data in config should never be exposed to logs
