---
name: full-resolve
description: "Run the complete Codex-first implementation and release-readiness pipeline for a feature, broad change, or multi-step request: workspace/run setup, architecture and build gates, browser and observability validation, review, fix loop, cleanup, repository knowledge, and final evidence. Use when the user wants end-to-end delivery rather than one narrowly scoped bug fix."
---

# hehehe:full-resolve

Use this for end-to-end implementation from a spec, issue, prompt, or `.hehehe/implementation-spec.md`. Use `hehehe:resolve` instead for one reproducible bug or failing check that needs a focused repair loop.

## Pipeline

1. **Workspace + Run Gate**: use `hehehe:resume` in automatic mode before editing. It reuses or selects the task branch and worktree, assigns the runtime identity, then resumes a matching run or initializes one inside that worktree. Never move dirty source changes to prepare isolation.
2. **Intake**: read the request, selected workspace, active run artifacts, and repository. Use `hehehe:repository-knowledge` in `check` mode to load the project index and record its initial freshness; a missing baseline schedules automatic initialization at the docs phase but does not block implementation by itself.
3. **Plan Gate**: require a decision-complete plan before editing when the task touches auth or security, migrations or backfills, destructive or billable effects, public API contracts, or more than one deployable subsystem. Record invariants, scope, affected integration points, dependencies, acceptance criteria, and verification. Stop for user input only when an unresolved decision changes scope or authority. Skip this gate for a small, well-understood change.
4. **Architecture Gate**: for non-trivial backend work, use `hehehe:backend-architecture`; for non-trivial frontend work, use `hehehe:frontend-architecture`; use both for cross-stack work. Use `hehehe:architecture-metrics` to generate the project profile report, then record the profile score, selected Lite/Standard/Strict profile, profile-specific coupling thresholds, responsibility boundaries, data/state/API ownership, and styling choice in the implementation spec or active run's `done-criteria.md`. Skip for documentation-only, configuration-only, generated-code-only, or obvious one-line changes.
5. **Build**: Codex implements the change directly in the selected task worktree, treating security as a first-order coding priority, preserving chosen boundaries without mechanical layers/classes, and using FSD plus Tailwind for new frontend work unless the user requests otherwise. For affected backend or API boundaries, use `hehehe:observability` in automatic mode to preserve or add stable error codes, safe client responses, structured logs, and request correlation without installing a monitoring stack.
6. **Build Gate**: run typecheck, lint, tests, build, and framework checks that apply in the task worktree.
7. **Browser Validate**: for UI work, run or open the isolated app instance and inspect the workflow. Use `hehehe:observability` verification to capture page errors, new console errors, failed requests, status codes, and relevant response timing; correlate a failing request with its backend log when applicable.
8. **Evaluate**: optionally ask Claude for a narrow independent review.
9. **Fix Loop**: Codex verifies each real issue, patches, and reruns checks.
10. **Simplify**: remove duplication and accidental complexity introduced by the change.
11. **Review**: perform Codex review first; for non-trivial application work, rerun the applicable backend/frontend completion gate and `hehehe:architecture-metrics` against the actual diff. Review affected error responses and logs for stable codes, correlation, duplicate logging, and sensitive-data exposure.
12. **Challenge**: ask whether the diff actually satisfies the done criteria.
13. **Security Review**: check auth, data exposure, injections, secrets, and destructive actions.
14. **Clean + Docs**: use `hehehe:clean` for change-local hygiene, update relevant user-facing docs, and remove temporary artifacts. For a maintained repository, run `hehehe:repository-knowledge` with its default automatic mode so it initializes a missing baseline, synchronizes structural or durable operational knowledge, records verified fingerprints, and performs the final freshness check. Skip only for disposable/generated/vendor work and record why. Route periodic repository-wide drift or garbage-collection requests to `hehehe:maintain-codebase` instead of expanding ordinary cleanup.
15. **PR Delivery**: when the user requests PR delivery, use `hehehe:pr-loop` in `ready` or explicitly authorized `merge` mode. Reconcile review feedback and CI against the exact remote head SHA; do not broaden a local implementation request into commit, push, PR, or merge actions.
16. **Complete**: record the worktree decision and runtime identity, repository-knowledge result, observability mode and evidence, PR terminal state when applicable, plus the project profile score and selection, final coupling score, profile-specific decision, quantitative evidence, and hard-failure result in `checks.md` when applicable. Update the run report and mark the run complete with the `hehehe:resume` run-state script only after required evidence passes. Do not automatically remove the worktree or delete its branch.

For non-trivial work, write concise artifacts under the active `.hehehe/runs/<run-id>/` directory. Preserve legacy singleton `.hehehe/*.md` files but do not append new runs to them.

Codex owns final judgment. Do not ship solely because Claude approved.

For user-requested or repository-configured integrated delivery, use `hehehe:resume`'s integration-delivery lifecycle after implementation. The lead integrates all task/worker commits, resolves conflicts and verifies the aggregate in one fixed review checkout. Scoped local commits needed to freeze that candidate are within the authorized delivery workflow; push/publish authority is separate. Report `awaiting_approval` with one path and exact candidate, then perform local main delivery only after the user approves it. Verify the same checkout on main before reporting `merged`; implementation completion alone never implies main was updated.

Completion authority comes from the operator-pinned verification policy described in `hehehe:resume`, not from AI-authored done criteria. Run its `verify` command before `complete`. Do not delete, skip or weaken mandatory tests, commands or policy. Propose necessary baseline changes for independent review; missing trust, failed or unexecuted checks, expired evidence and changed source are blockers, not exceptions the implementation agent may approve.
