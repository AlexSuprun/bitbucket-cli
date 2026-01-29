## Problem
The Bitbucket CLI is built with Bun features (Bun.spawn, Bun's ASCII encoding) and is built with `--target bun`. However, when users try to run the CLI with Node.js, it crashes with a cryptic error:

```
ReferenceError: Bun is not defined
    at GitService.exec (file:///.../dist/index.js:33530:18)
```

This happens because:
1. The `engines` field in package.json says `node: ">=20"`, implying Node.js support
2. Documentation mentions "Node.js 20+" as a prerequisite
3. There's no runtime check to provide a helpful error message

## Expected Behavior
- Users should get a clear error message explaining that Bun runtime is required
- Documentation should accurately reflect the Bun requirement
- The `engines` field should specify Bun, not Node.js

## Proposed Solution
1. Add a runtime check at startup that detects if Bun is available
2. Update package.json `engines` to require Bun
3. Update all documentation to clarify that while you can install via npm/pnpm/bun, Bun runtime is required to execute

## Affected Files
- package.json
- src/index.ts (add runtime check)
- README.md
- All documentation in docs/ directory

## Version Impact
This is a documentation and error-handling improvement. Should be a patch release.
