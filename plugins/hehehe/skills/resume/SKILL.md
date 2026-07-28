---
name: resume
description: Manage the complete task workspace and durable run-state lifecycle for hehehe. Use when starting non-trivial work, selecting or creating a task branch and Git worktree, isolating local ports/logs/Compose/database identities, resuming after interruption or compaction, inspecting status, recording progress or blockers, completing a verified run, or explicitly retiring a preserved task workspace.
---

# hehehe:resume

Use task identity as the single key for both its physical Git workspace and logical hehehe run. A date may label a generated directory but never defines a new task or forces a new worktree.

Resolve both scripts relative to this `SKILL.md`:

- `scripts/worktree-isolation.mjs`: read-only planning/status and safe task-worktree creation
- `scripts/run-state.mjs`: the only writer for `.hehehe/current.json` and run `state.json`

Read [references/isolation-policy.md](references/isolation-policy.md) before creating or retiring a worktree.

## Modes

Infer the first explicit mode; use `auto` when none is supplied.

- `auto`: reuse a matching workspace and run, or prepare a justified workspace and initialize a new run.
- `init`: select the workspace first, then initialize run state inside it.
- `resume`: confirm task/workspace identity and continue from the recorded next step.
- `status`: report Git/worktree/runtime identity plus active run state without mutation.
- `advance`: record a verified phase transition or actionable blocker.
- `complete`: complete the run only after required evidence passes; preserve its worktree.
- `retire`: after explicit user intent, verify clean and integrated state before removing a worktree; never delete its branch automatically.

`status` is read-only. `auto` does not require a new worktree for a small continuation in the current matching workspace.

## Deterministic Commands

Workspace:

```text
node scripts/worktree-isolation.mjs plan --project <root> --task "<identity>" [--json]
node scripts/worktree-isolation.mjs create --project <root> --task "<identity>" [--base <ref>] [--json]
node scripts/worktree-isolation.mjs status --project <root> [--task "<identity>"] [--json]
```

Run state:

```text
node scripts/run-state.mjs init --project <selected-worktree> --goal "<goal>"
node scripts/run-state.mjs status --project <selected-worktree> --json
node scripts/run-state.mjs advance --project <selected-worktree> --phase <phase> --next "<next step>"
node scripts/run-state.mjs advance --project <selected-worktree> --phase blocked --status blocked --next "<actionable blocker>"
node scripts/run-state.mjs complete --project <selected-worktree>
```

Optional workspace overrides are `--branch`, `--path`, `--date YYYYMMDD`, `--port-base`, and `--port-span`. `create` requires `--allow-dirty-source` when the source worktree is dirty. Supply it only after verifying those changes are unrelated and recording that they will be excluded.

The scripts do not commit, stash, patch, merge, push, start services, create databases, remove worktrees, or delete branches.

## Workspace Decision

Reuse the current or registered task worktree when the request continues its active branch and changes.

Resolve a matching task in this order: exact recorded task identity and branch; exact active-run goal plus recorded branch/worktree; then the current active run only when the user explicitly asks to continue it. Do not select by a merely similar name. If more than one candidate remains, report their task identity, branch, worktree, and run phase and require a choice before mutation.

Create or reuse a dedicated task worktree when any apply:

- another implementation may proceed in parallel
- the current worktree contains unrelated uncommitted changes
- the task is non-trivial, long-lived, high-risk, or likely to need review as one branch
- application, test, log, Compose, or development-database processes could collide

Never create another date-labelled worktree when the task branch is already registered.

## Automatic Lifecycle

1. Read applicable `AGENTS.md`, run workspace `status`, inspect the current diff, and identify whether this is the same task.
2. Run workspace `plan` and record the branch, worktree, committed base, dirty source paths, and runtime identity.
3. If isolation is justified, inspect every dirty path and run workspace `create` from the intended committed base. Never move source changes silently.
4. Change into the selected worktree before reading, initializing, or updating run state.
5. Read run status. Resume only when the goal, branch, and worktree match; otherwise initialize a new run.
6. Read done criteria, build log, checks, and final report. Verify recorded claims against files and command output.
7. Continue from `next_step` and advance state after each material phase transition.
8. Keep apps, logs, Compose projects, and optional development databases scoped to the recorded runtime identity. Probe the suggested port before binding.
9. Complete only when required evidence passes. Preserve the workspace for review, commit, merge, or an explicit retirement request.

For `hehehe:subagent-resolve`, select one task worktree before spawning agents. Agents share it unless the user explicitly requests a separate multi-branch integration strategy.

## Retirement Gate

Never retire automatically. When the user explicitly requests it:

1. Verify the exact registered path and branch with `git worktree list --porcelain`.
2. Verify the worktree is clean.
3. Verify required commits are merged, pushed, or otherwise preserved according to the stated workflow.
4. Stop only task-owned processes and Compose projects.
5. Remove the worktree without `--force`.
6. Delete the branch only under separate explicit authority.

Preserve the workspace when any condition is uncertain.

## Completion Record

Record the workspace decision, task branch and path, committed base, excluded dirty paths, runtime identifiers, run ID and phase, verification location, final status, and retirement status.
