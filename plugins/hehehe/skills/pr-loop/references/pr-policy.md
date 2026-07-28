# Pull Request Loop Policy

Use committed `.hehehe/pr-policy.json` to make repeatable PR automation narrower and predictable.

```json
{
  "schema_version": 1,
  "allow_push": false,
  "allow_auto_merge": false,
  "allowed_merge_methods": [
    "squash"
  ],
  "require_resolved_threads": true,
  "minimum_approvals": 1,
  "max_fix_iterations": 5,
  "delete_branch_after_merge": false
}
```

Missing fields use the safe values shown above. Repository policy cannot override the current user request, `AGENTS.md`, platform permissions, branch protection, code-owner requirements, or safety instructions.

## Authority

- Reading PR state, checks, logs, reviews, and threads is allowed in every mode.
- Local edits are allowed only when the user requested a fix or an applicable workflow already authorizes implementation.
- Commit and push require a request to update, ready, or merge the exact PR, or `allow_push: true` in an applicable committed policy.
- Merge requires explicit current-request authority for the exact PR, or `allow_auto_merge: true` plus a request to execute the autonomous PR loop.
- `delete_branch_after_merge` never deletes a local worktree or branch. Branch cleanup remains separately authorized and must follow `hehehe:resume retire`.

## Failure classification

Classify a failed check before editing:

- `code`: reproducible failure caused by the PR; fix and verify.
- `test`: incorrect or missing test expectation caused by an intended behavior change; verify the contract before changing it.
- `flaky`: nondeterministic failure with prior evidence; rerun at most twice without a new hypothesis.
- `infrastructure`: runner, registry, network, permission, quota, or external service failure; retry only when state changes or an approved fallback exists.
- `unrelated`: base-branch or external failure also present without the PR; prove it and report rather than hiding it.

Never change code merely because a check is red.

## Iteration and merge evidence

For every iteration record:

- PR number and repository
- base and head branch
- inspected and pushed head SHA
- required-check name, run URL or identifier, and terminal result
- review thread or finding identifier
- verified root cause and changed files
- focused and full verification commands
- remaining risks or blockers

Immediately before merge, reload the PR and verify all ready conditions against the same head SHA.
