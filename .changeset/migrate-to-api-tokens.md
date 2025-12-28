---
"@pilatos/bitbucket-cli": major
---

**BREAKING CHANGE**: Migrate from app passwords to API tokens

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
