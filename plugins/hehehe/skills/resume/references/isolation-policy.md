# Task Workspace Isolation Policy

## Identity Model

Use three separate identities:

| Identity | Purpose | Lifetime |
| --- | --- | --- |
| Task branch, such as `task/order-error-contract` | Durable code history and review unit | Entire task |
| Worktree directory, such as `20260728-order-error-contract` | Physical file isolation | Until explicitly retired |
| hehehe run ID | One execution or resumed automation record | One workflow run |

The task branch is authoritative. The date is directory metadata only. A task continued tomorrow stays on the same branch and registered worktree.

## Dirty Source Rules

A new worktree starts from a committed Git object. Uncommitted source changes are not part of it.

- Never commit, stash, reset, patch, copy, or discard dirty changes merely to prepare isolation.
- Inspect dirty paths and determine whether the new task depends on them.
- If dependent, continue in the current worktree or obtain user direction for an explicit preservation strategy.
- If unrelated, record that they remain in the source worktree and may explicitly acknowledge their exclusion when creating from the committed base.
- Never imply that an isolated worktree includes dirty source changes when it does not.

## Branch and Path Rules

- Default branch: `task/<readable-task-label>-<full-task-identity-hash>`; the short hash includes the complete task string so mixed-language or truncated labels cannot share a branch by accident.
- Keep the branch stable across dates.
- Default directory: sibling `<repository>-worktrees/YYYYMMDD-<normalized-task-slug>`.
- Keep task worktrees outside the primary repository directory to prevent recursive scans and accidental packaging.
- Reuse a registered worktree when it already checks out the task branch.
- When continuing a pre-hash task branch, pass its exact existing `--branch`; do not create a replacement just because the default naming format changed. Explicit branch overrides are operator task selection.
- Do not check out one branch in two worktrees.
- Do not overwrite an existing non-empty directory or symbolic-link target.

## Runtime Isolation

The deterministic script returns stable values derived from the canonical Git common directory and task branch. Calling it from the source, task, or fixed review checkout therefore returns the same runtime identity:

- `workspace_id`
- `suggested_port`
- `log_directory`
- `compose_project`
- `database_name`

Treat these as local defaults, not permission to start or create resources.

- Probe `suggested_port` immediately before binding; choose and record another task-specific port if occupied.
- Put task logs under the returned directory or the active run directory.
- Pass the Compose name with `docker compose -p <compose_project>` so containers, networks, and volumes do not collide.
- Use a dedicated development database or schema only when database isolation is needed. Never derive or modify a production database.
- Do not share writable generated artifacts, caches with unsafe locking, or local upload directories across concurrent tasks.
- Reuse read-only dependency caches when the build tool supports concurrency safely.

## Base Selection

Use the committed branch or ref the task should be reviewed against:

- new feature: current agreed integration branch, often `main` or `develop`
- continuation: existing task branch and worktree
- stacked work: explicitly selected parent task branch

Do not guess a different base because its name looks conventional. Record the resolved commit. When a selected task branch already exists, `base_ref` and `base_commit` report that branch's current HEAD, including unregistered branches being checked out again. `requested_base_ref` and `requested_base_commit` preserve the caller's requested base separately. `--base` initializes new branches only; continuing an existing branch never resets or rebases it.

## Subagents

Subagents in one hehehe task share the lead task worktree and see edits immediately. Coordinate file ownership inside that workspace. Separate worktrees per subagent introduce merge overhead and require an explicit integration plan; do not create them by default.

## Safe Retirement

Retirement and branch deletion are separate actions.

- A clean worktree can still contain unmerged commits.
- A merged branch can still have task-owned running processes.
- Removing a worktree does not authorize deleting its branch.
- Never use forced removal to bypass dirty state in an automatic workflow.
- Preserve the workspace when merge, push, deployment, or ownership state is unclear.
