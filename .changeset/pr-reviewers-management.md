---
"@pilatos/bitbucket-cli": minor
---

Add PR Reviewers Management commands

New commands for managing reviewers on pull requests to enable reviewer assignment and management from CLI:

- **`bb pr reviewers add <id> <username>`** - Add a reviewer to a pull request by username
- **`bb pr reviewers remove <id> <username>`** - Remove a reviewer from a pull request by username  
- **`bb pr reviewers list <id>`** - List all reviewers on a pull request

Example usage:

```bash
# Add a reviewer to PR #123
bb pr reviewers add 123 johndoe

# Remove a reviewer from PR #123
bb pr reviewers remove 123 johndoe

# List all reviewers on PR #123
bb pr reviewers list 123
```

Features:
- Supports `--json` flag for programmatic consumption
- Automatically looks up user UUID from username via `/users/{username}` endpoint
- Uses UUID for all reviewer comparisons (not deprecated username field)
- Displays reviewers in a formatted table (display name and account ID)
- Shows helpful message when no reviewers are assigned

Note: Due to Bitbucket Cloud GDPR changes, the `username` field is deprecated. The commands use UUID for identification and display `account_id` in list output.
