---
name: clean
description: Clean up codebase hygiene after implementation without unrelated refactors.
---

# hehehe:clean

Use after a build or before handoff for hygiene introduced or exposed by the current change. Use `hehehe:maintain-codebase` for periodic repository-wide drift checks, garbage collection, hotspot selection, or targeted maintenance PRs.

Look for:

- dead code introduced by the change
- unused imports and dependencies
- duplicated helpers
- stale temporary files
- obvious naming or formatting drift
- accidental cross-layer imports, infrastructure leakage, or responsibility mixing introduced by backend changes
- FSD layer/slice violations, feature logic in shared UI, or parallel styling systems introduced by frontend changes
- abstractions, wrappers, interfaces, and classes that do not protect a real boundary

For non-trivial application changes, use the hotspot triggers in the applicable backend/frontend architecture skill. Extract only when doing so improves responsibility, testing, or change locality.

Run checks after cleanup. Do not perform broad refactors or mechanically split files unless needed for correctness or to pass an applicable architecture gate.

Do not remove a task worktree, delete its branch, stop user-owned processes, or delete Compose volumes as ordinary cleanup. Use the explicit retirement gate in `hehehe:resume` only when the user requests it.
