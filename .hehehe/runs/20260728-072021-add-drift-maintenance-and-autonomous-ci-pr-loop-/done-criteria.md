# Done Criteria

## Goal

Add proactive codebase drift/garbage-collection maintenance and a continuous CI/review/PR repair loop to hehehe.

## Workspace

- Reuse `C:\Users\user\Desktop\hehehe` on `agent/subagent-resolve` because the existing dirty changes are the directly related cumulative hehehe enhancement set.
- Do not commit, stash, copy, discard, merge, push, or retire a worktree as part of implementation.

## Required behavior

- Add a dedicated maintenance skill for scheduled or on-demand drift checks, evidence-based garbage collection, and one-target-at-a-time refactoring PR preparation.
- Provide a deterministic dependency-free audit script that works across common web, hybrid, Go, and other source trees without installing a monitoring platform.
- Keep `clean` as a change-local reactive cleanup step and make the new maintenance skill the proactive repository-wide lifecycle.
- Add a dedicated PR loop skill that continuously reconciles unresolved review feedback and CI failures, verifies fixes, and can update or merge a PR only within explicit user or repository policy authority.
- Never bypass branch protection, use admin merge, force-push, dismiss review feedback, or merge an unverified head SHA.
- Integrate both skills into `full-resolve`, the main hehehe router, docs, catalog, and plugin prompts.
- Add PR validation and scheduled quality checks for the hehehe repository itself.
- Synchronize package/plugin versions at `0.3.12`.

## Verification

- New skill folders pass `quick_validate.py`.
- Audit script syntax and fixture behavior pass automated tests.
- Catalog exactly matches skill directories.
- `npm run validate` passes.
- `npm pack --dry-run` passes.
- Repository knowledge finishes `FRESH`.
- Global plugin source, marketplace target, and versioned cache match by path and hash.

## Completion

- Record what is automatic, what requires policy or explicit authority, and when the loop stops.
- Do not claim a PR was created or merged during this implementation.
