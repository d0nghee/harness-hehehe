# Trusted completion verification

The run-state `complete` command is fail-closed. It accepts evidence only from `verify`, bound to an externally supplied reviewed Git commit. `checks.md`, `done-criteria.md`, and the workspace copy of `verification.json` are explanatory artifacts, not approval or pass signals.

## Authority and first adoption

The repository owner establishes `.hehehe/verification-policy.json` in a reviewed commit. A trusted launcher supplies its full 40-character SHA as `HEHEHE_VERIFICATION_BASE`. Do not derive this value from the working branch, an AI-authored approval field, or an arbitrary CLI override. No HEAD fallback, force-complete flag, automatic skip, or weaker legacy completion path exists.

An existing run can be inspected and planned without a policy. `verify` and `complete` cannot succeed until an operator establishes the baseline. The base is pinned in run state on initialization when supplied, or on the first verification attempt. Changing it during a run is rejected. A changed policy or existing protected verification input requires independent review; the implementation agent must not authorize it for itself.

For a reviewed policy/test/tool update, a trusted launcher or repository administrator may supply `HEHEHE_VERIFICATION_APPROVED_HEAD` with the exact reviewed commit SHA (CI reads the administrator-controlled repository variable of that name). It authorizes protected changes committed at that SHA, never later uncommitted edits. The current run still executes the OLD baseline's checks and thresholds, even when the proposed policy is approved. The changed policy becomes authoritative only after landing in the protected baseline for subsequent runs. No approval field or skip switch in working files can substitute for this external decision. Clear the repository variable after the reviewed update; a different HEAD cannot reuse it.

First introduction of this feature necessarily changes the gate and creates the policy. A pre-feature base commit has neither. The CI job deliberately fails on that base rather than trusting the PR's new policy/runner. A maintainer must review and land the initial baseline through the repository's authorized adoption process; subsequent PRs use the protected base commit automatically. This implementation does not create a baseline approval, alter branch protection, or bypass existing checks.

## Policy

The schema rejects unknown fields, duplicate IDs, undefined required IDs, empty mandatory check sets, invalid paths and invalid limits. The repository's own policy is a working example; project owners choose their own commands and behavioral contracts.

```json
{
  "schema_version": 1,
  "max_age_seconds": 3600,
  "checks": [
    {
      "id": "tests",
      "command": ["$node", "--test", "--test-reporter=tap"],
      "kind": "node-test",
      "minimum_tests": 1,
      "timeout_ms": 300000
    }
  ],
  "always_required": ["tests"],
  "change_rules": [],
  "protected_paths": ["tests/**", "package.json", ".github/workflows/**"]
}
```

- `$node` resolves to the current Node executable. Commands are argv arrays executed without a shell. Use a cross-platform script for package-manager commands; do not rely on shell-specific `npm.cmd` behavior.
- `exit` requires exit code zero with no spawn failure, signal, timeout, or output-buffer failure.
- `node-test` additionally requires one unambiguous TAP summary, a positive minimum test count, and zero failed, cancelled, skipped, and TODO tests. Zero exit alone is insufficient. TAP summaries validate execution, not the correctness of test assertions; approved tests and their inputs remain essential.
- `max_age_seconds` is mandatory and limited to one week. The same source hash cannot keep an old receipt valid indefinitely.
- `change_rules` entries contain `paths` and `required` arrays. Their required checks are unioned with `always_required`. Patterns support `*` within one path segment and `**` across segments. `src/auth/**` includes nested files beneath `src/auth/`.
- Without external exact-head review, the working policy must match the trusted policy (normalizing CRLF only), and existing baseline files matching `protected_paths` cannot be edited, deleted, renamed, or weakened. Additional test files may be added. Owners must list test fixtures, package scripts, test configuration, vulnerability exceptions, and transitive verification helpers they depend on; no scanner can infer every trusted input.

## Execution and completion

```text
node <resume>/scripts/run-state.mjs init --project <root> --goal "<goal>"
node <resume>/scripts/run-state.mjs verify --project <root> --json
node <resume>/scripts/run-state.mjs complete --project <root> --json
```

Both verification and completion re-read the policy from the externally pinned commit and check protected inputs. Source identity includes HEAD and the contents and executable bits of tracked and non-ignored untracked regular files. Run records, the current-run pointer, the mutation lock, and task runtime logs are excluded to permit evidence updates. Ignored dependency directories and machine/environment state are not part of this source fingerprint; lockfiles and environment controls must cover those inputs where needed. Source symlinks, junction-like non-regular entries, and submodule entries fail closed rather than escaping the snapshot.

`verify` invalidates the previous authoritative receipt before executing checks. It records command, times, exit code, TAP totals, output digest, policy digest, required IDs and source identity. Source changes during verification make the entire attempt fail. Logs are stored in the run directory; the authoritative receipt and local integrity key are stored in the Git common directory, outside the source tree. `complete` checks receipt integrity, run/policy binding, age, required results, log digests and source identity. The workspace JSON cannot grant completion. A blocked run must first resolve its blocker and return to an active phase.

State mutations use an exclusive `.hehehe/run-state.lock`. Concurrent mutations fail. If a process is killed, investigate and stop that exact process before manually removing its stale lock; automatic lock stealing is intentionally absent.

These controls resist accidental bypass and modifications confined to the worktree. A process with the same unrestricted filesystem identity can rewrite the gate, trust environment, Git objects, state and integrity key. HMAC is local integrity checking, not independent human approval or protection from that process. Hard authority boundaries require a trusted CI runner/launcher and platform protections outside the implementation agent's control.

## CI

`.github/workflows/verification.yml` uses the PR base SHA and executes the adapter and runner from that base. It checks out the exact PR head, uses read-only repository permissions, persists no Git credentials and supplies no publication secrets. Manual dispatch requires an operator-configured `HEHEHE_VERIFICATION_BASE` repository variable containing a reviewed ancestor commit.

Require the `completion-gate` job using branch protection or rulesets, protect the workflow and policy owners, and do not allow the implementation agent to change those protections or approve its own policy changes. Workflow files proposed in a PR are not an external trust boundary by themselves. Do not use `pull_request_target` with secrets to execute head-controlled tests.

The CI adapter creates an isolated run identity, restores the prior run pointer and exits nonzero on missing baseline, missing tools, failed verification or rejected completion. A green local run never implies remote CI success. Head changes require another CI run. Merge-queue users also need the corresponding integration-commit workflow and protection configuration; this workflow targets PR heads only.
