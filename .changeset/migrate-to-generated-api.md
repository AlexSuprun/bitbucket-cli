---
"@pilatos/bitbucket-cli": minor
---

Migrate to generated axios API client

This is a significant internal refactoring that migrates the CLI from manual API types to a fully generated axios-based API client:

**Changes:**
- Switch OpenAPI generator from `typescript-fetch` to `typescript-axios`
- Generate API client from Bitbucket OpenAPI spec (54,302 lines of generated code)
- Remove manual type definitions (`src/types/api.ts`)
- Remove Result pattern and replace with standard Promises
- Delete repository layer (`src/repositories/`)
- Delete custom HTTP client (`src/services/http.client.ts`)
- Update all 32+ commands to use generated APIs
- Fix all TypeScript errors (0 errors)
- Update all 298 tests to work with new architecture
- Update documentation (CONTRIBUTING.md, AGENTS.md)

**Technical Details:**
- Collections returned as `Set<T>` are converted to arrays using `Array.from()`
- API request bodies include required `type` fields
- Uses axios interceptors for authentication and error handling
- All services now use standard Promise-based error handling

Closes #53