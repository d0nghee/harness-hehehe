# Done Criteria

## Goal

Add task-scoped Git branch, worktree, and local runtime isolation to hehehe without moving or overwriting existing user changes.

## Expected Behavior

- `$hehehe:worktree-isolation` uses task identity as the durable key; dates only disambiguate generated paths.
- Automatic mode reuses a matching worktree for resumed work and isolates non-trivial parallel, unrelated-dirty, long-lived, or high-risk work.
- New edits occur on the task branch checked out in the selected worktree.
- Dirty source changes are never silently committed, stashed, patched, or copied into a new worktree.
- A deterministic script plans, creates, and inspects worktrees with validated arguments and machine-readable output.
- Each isolated task receives deterministic runtime identifiers for ports, logs, Compose, and optional local databases.
- Removal is never automatic and cannot delete dirty or unmerged task work by default.

## In Scope

- New worktree isolation skill, safety reference, and deterministic script
- Script tests using temporary Git repositories
- Integration with full-resolve, resume, preflight, clean, subagent, main workflow, templates, docs, catalog, and plugin metadata
- Version 0.3.10 validation and global installation

## Out of Scope

- Moving the current uncommitted cumulative hehehe changes to another branch or worktree
- Automatically committing, stashing, merging, pushing, or opening a pull request
- Creating databases, starting applications, or launching Docker stacks during workspace preparation

## Verification

- Skill quick validation
- Script syntax and focused temporary-repository tests
- `npm run validate`
- `git diff --check`
- `npm pack --dry-run`
- Repository knowledge freshness
- Global install and source/install/cache hash comparison

## Workspace Isolation

- Current branch: `agent/subagent-resolve`
- Current worktree: `C:\Users\user\Desktop\hehehe`
- Decision: reuse current worktree because this request continues the same cumulative hehehe modification set
- Existing dirty changes: preserve; do not commit, stash, reset, or migrate

## Architecture

- Architecture gate: skipped; plugin workflow and Git safety tooling change

## Risks

- Port allocation is deterministic metadata and must still be checked for actual availability before starting a process.
- Git branch relationships and merge state require final verification before any explicit cleanup.
