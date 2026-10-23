# One review location and approval-bound local delivery

Use this lifecycle when the user requests integrated delivery or enables it for the repository. The lead owns integration, conflict resolution and integrated verification. The user inspects one fixed worktree, not each worker's checkout. Do not call implementation, verified review, user approval and main delivery the same state.

## Ownership and paths

- One task's subagents normally share its task worktree with exclusive file ownership. Separate task branches are allowed for genuinely independent work, but the lead integrates their exact committed SHAs.
- The first delivery pins a target branch and absolute review path in `<git-common-dir>/hehehe-delivery/state.json`. Subsequent deliveries reuse them. Do not generate another date-labelled user review path.
- Keep unrelated dirty changes in their original checkout. Inspect the diff and commit only the authorized task changes before preparing a candidate. Only known hehehe run artifacts may remain uncommitted and are excluded from the candidate; source changes cannot be silently omitted.
- Integration happens in a disposable detached staging worktree. Conflicts abort that staging merge without moving main or the existing review candidate. The staging checkout is internal scratch, not another user handoff.
- The managed review branch is `integration/hehehe-review`. A candidate is published to the fixed review path, tested there, then frozen while awaiting user approval. Do not edit files there to continue implementation. To replace it after requested revisions, supply the exact old candidate with `--replace-candidate`; the new request invalidates prior approval.
- If the target is already checked out, use that checkout as the fixed review path. Never force-switch an unrelated or dirty checkout, stash user work, or create a second checkout of main.

## Commands

Resolve `scripts/delivery.mjs` relative to `resume/SKILL.md`.

```text
node <delivery-script> prepare --project <task-root> --target main --review-path <fixed-review-root> --source <task-commit-or-branch> --json
node <delivery-script> prepare --project <task-root> --source <first-agent-branch> --source <second-agent-branch> --json
node <delivery-script> status --project <any-repository-worktree> --json
node <delivery-script> verify --project <any-repository-worktree> --json
node <delivery-script> merge --project <any-repository-worktree> --json
node <delivery-script> finish --project <any-repository-worktree> --json
```

The second prepare example applies after the path and target are configured. Source refs are resolved to immutable commits; dirty implementation files must be committed by the lead first. Preparing an already pending review requires `--replace-candidate <old-full-sha>`. Neither preparation nor verification moves main.

## Verification and bootstrap

Ordinary delivery requires the externally supplied `HEHEHE_VERIFICATION_BASE` from the completion policy. It executes the policy's required checks against the integrated review checkout and preserves signed source/HEAD-bound receipts and logs in the Git common directory. Failed, missing, tampered, expired or source-stale evidence blocks merge. `verify` refreshes evidence for the same unchanged candidate and approval request; changed source or target requires reintegration and a new request.

After a trusted delivery is `merged`, `verify` may also refresh that exact approved candidate for delayed baseline promotion. The fixed checkout must remain clean on the target branch, with both its HEAD and the target still equal to the delivered candidate. The old baseline and any exact-head protected-input approval remain required. Reverification preserves `merged`, the delivery request and approvals; it never moves main or grants baseline approval. A failed or interrupted refresh invalidates old passing evidence and blocks promotion until all original checks pass again.

The first introduction of verification has no policy in the target. Only then may `prepare --bootstrap-review` execute every check in the proposed candidate policy. This produces **provisional** evidence and an approval request, never an approved trust baseline. The flag is rejected once the target has a policy. A missing ordinary baseline cannot silently fall back to the candidate.

## User approval and main

After verification, report the fixed review path, candidate SHA, target base SHA, request ID, test evidence and whether initial policy approval is also required. Pause for the user's explicit approval of that result. A trusted caller supplies:

- `HEHEHE_DELIVERY_APPROVED_HEAD`: the exact reviewed candidate SHA;
- `HEHEHE_DELIVERY_APPROVED_TARGET`: the exact main SHA captured in that request;
- `HEHEHE_DELIVERY_APPROVAL_ID`: its unique request ID;
- for first adoption only, `HEHEHE_DELIVERY_BOOTSTRAP_APPROVED`: the same request ID, after explicit approval of the initial policy as well.

These values must come from the actual user decision or trusted approval integration. The implementation agent must not create them in advance or infer approval from passing tests. Environment assertions and Git-local metadata do not cryptographically authenticate the human caller against a process with unrestricted same-account access; enforce stronger separation in a trusted launcher or protected CI when required.

`merge` rechecks approval identity, evidence integrity/expiry, review cleanliness, candidate HEAD and unchanged main. First-adoption approval additionally runs the now-approved baseline's checks again before changing main. The main update is a compare-and-swap fast-forward to the already tested integrated commit, followed by switching the **same review directory** to main and verifying its HEAD and clean status. No force push, reset of user work, remote push, publishing, branch deletion or task worktree retirement occurs.

If main moved, reintegrate and obtain approval for the new candidate. If evidence expired, reverify the unchanged candidate before merging. An `approved_update_pending` journal is written before the ref update. If main already equals the approved candidate, `finish` reconciles the same clean checkout. If the journal exists but the ref did not move, ordinary trusted delivery requires the original exact external approval and fresh evidence before its compare-and-swap update. An interrupted first-adoption ref update must go through `verify` and `merge` again with its explicit bootstrap approval. Recovery never overwrites dirty files or accepts a different target/candidate.

After a protected-input update lands, use the separate baseline-promotion procedure in [verification-policy.md](verification-policy.md) before the next ordinary task. Main delivery approval does not itself authorize changing the verification baseline.

## Reported states

| State | Meaning |
| --- | --- |
| `integrated` | Candidate published; verification not yet successful |
| `verification_failed` | Main unchanged; fix the responsible task and prepare a revised candidate |
| `awaiting_approval` | Integrated checks passed; fixed candidate awaits the user's decision |
| `approved_update_pending` | Exact approval was validated and journaled; ref may or may not have advanced |
| `main_updated_checkout_pending` | Approved ref update succeeded; use safe checkout recovery |
| `merged` | Exact candidate is on local main and the same review path checks out main |

Local main delivery does not claim remote CI success, remote push, npm release or deployment. Those remain separate authorized operations and must respect platform protections.
