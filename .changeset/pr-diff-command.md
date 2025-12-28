---
"@pilatos/bitbucket-cli": minor
---

Add `bb pr diff` command to view pull request diffs from the CLI

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
