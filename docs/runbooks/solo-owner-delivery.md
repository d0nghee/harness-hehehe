# Solo-owner delivery and verification baseline

The repository has one human owner. A second GitHub reviewer is not required: the owner reviews one frozen candidate in the fixed checkout, then approves its exact identities. An AI using the same unrestricted administrator credentials cannot be distinguished from the human by GitHub. These procedures prevent ordinary accidental bypass; stronger adversarial separation requires separately controlled credentials or a trusted launcher.

## Required remote configuration

Inspect the intended protection payload and actual settings:

```text
node scripts/repository-protection.mjs plan
node scripts/repository-protection.mjs check --repo d0nghee/harness-hehehe
```

Main requires the GitHub Actions `completion-gate` check and strict up-to-date verification, including administrators. Force pushes and deletion are disabled. Quality and Trusted verification workflows must be active. Successful tests after a push do not retroactively satisfy a missing pre-update gate. With these settings a new unchecked commit cannot be pushed to main; obtain the check on the exact candidate through a PR first. Main push, publication and deployment still require the user's corresponding authority.

No independent review count is configured because the sole owner cannot approve their own PR as a separate reviewer. The owner must inspect policy, test, command and workflow changes before granting exact-head review. Required-check settings alone do not make a head-controlled workflow immutable, prevent an administrator changing settings, or authenticate an AI's claim of human consent. Keep approval-setting operations in the operator-controlled UI/launcher when a stronger boundary is needed.

Workflow execution requires an externally reviewed baseline. Manual CI uses the `HEHEHE_VERIFICATION_BASE` repository variable; PR CI loads the tools and policy from the protected base commit. `HEHEHE_VERIFICATION_APPROVED_HEAD` authorizes only an independently reviewed exact PR head with protected changes. Do not set it to a branch name, an unreviewed HEAD, or a future candidate, and clear it after use. CI permissions remain read-only; do not execute untrusted head code in a privileged `pull_request_target` workflow.

## One candidate and two distinct approvals

1. Implement and run `npm run validate` in one task workspace. Preserve unrelated source changes. Review the full diff and freeze intentional commits.
2. Run delivery `prepare`. The fixed review directory remains `C:/Users/user/Desktop/hehehe-review`. If protected inputs differ, the trusted gate correctly blocks pending exact-head input review. Report the blocked gate and general test evidence honestly; do not claim a verified approval request yet.
3. Present the candidate SHA, target base, delivery request ID, protected diff, tests and any baseline-promotion plan. Obtain the user's exact protected-input/main approval. Re-run the old pinned checks with the operator's exact-head approval before changing main. A failing or stale result still blocks delivery.
4. For remote delivery, validate the same remote candidate through PR CI and obtain its required check before updating remote main. Do not use admin bypass to accommodate the new protection settings. If integration changes the SHA, verify and approve the new candidate again.
5. Complete approval-bound local delivery and confirm the same review directory is clean on main at the approved SHA. An `approved_update_pending` journal permits recovery across the ref-update boundary; use `finish` without overwriting user edits.
6. **Separately** request promotion from the old pinned verification SHA to the delivered candidate. The user must approve both full SHAs and the `baseline-...` request ID. General merge approval is insufficient.
7. Run the baseline `promote` command with the matching external FROM/TO/request approval and fresh delivery evidence. It records the transition under the Git common directory and returns the next launcher's environment. Update the trusted launcher's pinned SHA and repository-specific instructions to that exact approved value for new runs. Update the CI variable only after the approved commit is available on the remote. Clear exact-head approval. Never repin an active run.

The root baseline remains unchanged until step 6 is explicitly approved. The baseline plan includes complete old and proposed policies, so a changed command, threshold or protected path is visible to the owner. Tests of the workflow must demonstrate both that a later ordinary task works under the approved new baseline and that a new unreviewed protected edit still fails.

## Existing task migration

New default task branches include a hash of the complete identity. Continue an older task by passing its existing `--branch` explicitly. Runtime identity is now computed from the canonical Git common directory and selected branch, so calling from another checkout does not change it. Before adopting a newly generated runtime label for an already running task, read its recorded port, database and Compose names; preserve existing resources until their task owner intentionally migrates them. The planner never starts services or renames databases.

## Installation and browser diagnosis

Doctor compares cached files with the selected source, rather than trusting the cache version directory. A modified working source can therefore correctly report a difference from the installed released plugin. Updating source does not silently update installed plugins or publish npm versions.

Browser diagnosis recognizes computer-use and legacy browser provider skills. A skill installed on disk does not guarantee live tools in the current chat. Inspect the session tool inventory and provider instructions before browser validation; do not reinstall the obsolete browser plugin merely because its former path is absent.
