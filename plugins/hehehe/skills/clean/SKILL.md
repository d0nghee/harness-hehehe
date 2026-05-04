---
name: clean
description: Clean up codebase hygiene after implementation without unrelated refactors.
---

# hehehe:clean

Use after a build or before handoff.

Look for:

- dead code introduced by the change
- unused imports and dependencies
- duplicated helpers
- stale temporary files
- obvious naming or formatting drift

Run checks after cleanup. Do not perform broad refactors unless needed for correctness.
