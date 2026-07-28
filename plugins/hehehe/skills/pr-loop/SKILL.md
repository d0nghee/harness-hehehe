---
name: pr-loop
description: Continuously reconcile a pull request through review feedback and CI failures to a verified ready or merged state. Use when Codex should inspect an existing PR, address actionable review threads, diagnose and fix failed checks, commit and push authorized fixes, recheck the updated head, enable auto-merge, or merge after all required protections pass.
---

# hehehe:pr-loop

Drive one exact pull request to the terminal state authorized by the user and repository policy. Use the connected GitHub tools when available and `gh` for repository-local checks or operations they do not expose.

Read [references/pr-policy.md](references/pr-policy.md) completely before any commit, push, review-thread mutation, auto-merge, or merge.

## Modes

Infer the first explicit mode; use `status` when no mutation is requested.

- `status`: read-only PR, head SHA, checks, reviews, threads, mergeability, and policy summary.
- `repair`: fix verified CI or review findings locally and run required checks; do not push unless the user asked to update the PR.
- `ready`: continue through verified fixes, intentional commits, authorized pushes, and rechecks until the PR is ready to merge.
- `merge`: perform the `ready` loop, then enable normal auto-merge or merge only under explicit current-request or committed policy authority.
- `watch`: monitor changing checks and reviews without editing.

## Loop

1. Use `hehehe:resume` to select the PR branch/worktree and matching run. Never repair a PR from a different or detached head accidentally.
2. Resolve one exact repository, PR number, base branch, head branch, and head SHA.
3. Read applicable `AGENTS.md`, branch protection, ownership rules, PR template, committed `.hehehe/pr-policy.json`, and the policy reference.
4. Fetch current PR metadata, required checks, failed-job logs, review decisions, and every unresolved actionable thread. Do not rely on a stale summary.
5. Record an iteration ledger in the active run: iteration, head SHA, check or thread identifier, verified cause, action, local evidence, pushed SHA, and resulting state.
6. Verify each finding against actual code, lines, logs, and tests. Ignore advisory noise only with recorded evidence; never dismiss another reviewer’s thread merely to make the PR green.
7. Apply the smallest coherent fix. Run the failing check locally when reproducible, then nearby and repository-required gates.
8. In an authorized update mode, review the exact diff, create an intentional commit, and push without force. Re-read the remote head SHA.
9. Monitor checks to a terminal state, then reload reviews and threads because a new push may create new findings.
10. Repeat only when new evidence or a changed head justifies another iteration.

## Ready Gate

Declare `READY` only when all apply:

- the remote head SHA equals the locally verified and pushed SHA
- every required check is successful, skipped by policy, or explicitly non-blocking
- no active review requests changes
- all actionable threads are resolved through a verified fix or reviewer-confirmed disposition
- the PR is mergeable without conflict
- required approvals, ownership, security, migration, and deployment gates are satisfied
- final diff and required tests were reviewed at the exact head SHA

Flaky reruns are evidence only when the failure is classified and no code change is needed. Do not rerun the same unchanged failure more than twice without a new hypothesis.

## Merge Gate

Merge only when the user explicitly requests `merge` for the exact PR in the current task, or a committed policy permits auto-merge and the user requested the autonomous PR loop. Revalidate the ready gate immediately before the merge call.

Never use admin bypass, force push, delete another person’s branch, weaken required checks, forge approvals, dismiss reviews, or merge a different head SHA. Prefer platform auto-merge when checks or approvals are still legitimately pending.

After merging, verify the PR reports merged, record the merge commit and method, and report any post-merge check. Preserve the worktree and branch until a separate `hehehe:resume retire` request.

## Stop Conditions

Record `BLOCKED` with the exact next action when progress requires a product decision, new external permission, missing secret, unavailable required reviewer, persistent infrastructure failure, conflicted ownership, or a repository-protection change. An unchanged external state is expected while monitoring and is not itself a failure.
