---
"@pilatos/bitbucket-cli": patch
---

Add comprehensive test coverage for API client, completion command, and base command

Improvements to test infrastructure:

- Added `tests/api/client.test.ts` with 397 lines of tests for the API client
- Added `tests/commands/completion.test.ts` with 179 lines of completion command tests  
- Added `tests/core/base-command.test.ts` with 280 lines of base command tests
- Enhanced `tests/repositories/pullrequest.repository.test.ts` with 50 additional lines
- Enhanced `tests/services/http.client.test.ts` with 151 additional lines
- Updated `src/api/client.ts` with minor improvements (+5 lines)

Total: 1060 test additions and improvements
