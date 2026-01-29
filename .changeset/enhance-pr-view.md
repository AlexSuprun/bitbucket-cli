---
"@pilatos/bitbucket-cli": minor
---

Enhance `bb pr view` command with additional PR metadata

The `bb pr view` command now displays more comprehensive pull request information:

- **Closer/Merger information**: Shows who closed or merged the PR (when not OPEN)
- **Merge commit hash**: Displays the merge commit for merged PRs
- **Close source branch indicator**: Shows whether the source branch will be closed on merge
- **Commit hashes**: Shows source and destination commit SHAs
- **Improved reviewer states**: Now distinguishes between "approved", "changes_requested", and "pending"
- **Visual improvements**: Added separators and colorized branch names for better readability

Example output:
```
#42 Fix login authentication [OPEN]
────────────────────────────────────────────────────────────
Branch:   feature/fix-auth → main
Commits:  a1b2c3d → e4f5g6h
Author:   John Doe
Close Src: ✓ (close source branch on merge)
Activity: 5 comments · 2 tasks

Reviewers:
  ✓ Alice Smith approved
  ✗ Bob Johnson changes requested
  ○ Carol White pending
```
