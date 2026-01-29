---
"@pilatos/bitbucket-cli": patch
---

Fix PR comments list showing "Unknown" author and empty content for deleted comments

- Fixed author field mapping: API returns user data under `user` field (not `author`), and uses `nickname` instead of `username`
- Deleted comments now display "[deleted]" instead of blank content
