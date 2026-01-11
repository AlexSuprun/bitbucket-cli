---
"@pilatos/bitbucket-cli": patch
---

Fix approve/decline PR commands failing with Bad Request error

Bug fix for issue #41:

- Fixed `approve()` method to send empty JSON object `{}` as request body
- Fixed `decline()` method to send empty JSON object `{}` as request body
- Enhanced mock HTTP client to capture and verify request bodies in tests
- Added tests to verify approve/decline send correct body format

The Bitbucket Cloud API requires POST requests to approve/decline endpoints to have a request body. Previously, the body was `undefined`, causing 400 Bad Request errors.
