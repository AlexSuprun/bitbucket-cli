---
"@pilatos/bitbucket-cli": patch
---

Improve login command feedback on authentication failure

- Display error message when authentication fails instead of silently exiting
- Users now see "Authentication failed: <reason>" when credentials are invalid
- Helps users debug issues with invalid or expired tokens
