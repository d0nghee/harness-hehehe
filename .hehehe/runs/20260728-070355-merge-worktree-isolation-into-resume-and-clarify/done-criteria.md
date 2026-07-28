# Done Criteria

## Goal

Merge worktree isolation into `hehehe:resume` and make the scope boundary between `resolve` and `full-resolve` explicit.

## Expected Behavior

- `resume` owns task identity, branch/worktree selection, runtime identity, run-state initialization, continuation, status, completion, and explicit retirement checks.
- The deterministic worktree script and safety policy remain available under the `resume` skill.
- The standalone `worktree-isolation` skill, catalog entry, prompt, documentation, and installed stale directory are removed.
- All workflow consumers call `resume` for workspace/run lifecycle.
- `resolve` is clearly limited to one bug, regression, or failing check with focused verification.
- `full-resolve` is clearly positioned as the complete feature or broad-change pipeline with all gates, review, cleanup, and docs.

## In Scope

- Skill/resource relocation and standalone skill removal
- Workflow, catalog, metadata, documentation, tests, and knowledge updates
- Package/plugin version 0.3.11 and global installation

## Out of Scope

- Changing the worktree planning/creation algorithm
- Automatically creating, retiring, or deleting a real worktree in this repository
- Committing or stashing the cumulative user worktree changes

## Verification

- Resume skill quick validation
- Relocated worktree-script syntax and focused tests
- Full `npm run validate`
- `git diff --check`
- `npm pack --dry-run`
- Repository knowledge freshness
- Global target/cache version and hash comparison

## Workspace Isolation

- Decision: reuse current worktree because this is a continuation of the same hehehe harness changes
- Branch: `agent/subagent-resolve`
- Worktree: `C:\Users\user\Desktop\hehehe`
- Dirty changes: preserve without commit, stash, reset, patch, or migration

## Architecture

- Architecture gate: skipped; skill consolidation and workflow documentation change

## Risks

- Existing users of the newly introduced standalone command must switch to `$hehehe:resume`; the feature has not been published or committed yet.
