---
name: full-resolve
description: "Run the complete Codex-first implementation and release-readiness pipeline for a feature, broad change, or multi-step request: workspace/run setup, architecture and build gates, browser and observability validation, review, fix loop, cleanup, repository knowledge, and final evidence. Use when the user wants end-to-end delivery rather than one narrowly scoped bug fix."
---

# hehehe:full-resolve

Use this for end-to-end implementation from a spec, issue, prompt, or `.hehehe/implementation-spec.md`. Use `hehehe:resolve` instead for one reproducible bug or failing check that needs a focused repair loop.

Scale the pipeline to the change. Each step states when it applies; skip a step that does not apply and say so in `checks.md` rather than performing it as ceremony.

## Pipeline

1. **Workspace and run**: use `hehehe:resume` in automatic mode before editing. It selects or reuses the task branch and worktree, assigns the runtime identity, and resumes or initializes the matching run. Never move dirty source changes to prepare isolation.
2. **Intake**: read the request, the selected workspace, the active run artifacts, and the repository. Write `done-criteria.md` in the run directory: user goal, affected files or subsystems, expected behavior, verification commands, and known constraints. If resume returned `memory_context`, treat it as unverified history and check it against current sources with `hehehe:experience-memory`. In a maintained repository, run `hehehe:repository-knowledge` in `check` mode to load the project index; a missing baseline does not block implementation.
3. **Plan gate**: require a decision-complete plan before editing when the task touches auth or security, migrations or backfills, destructive or billable effects, public API contracts, or more than one deployable subsystem. Record invariants, scope, integration points, acceptance criteria, and verification. Stop for user input only when an unresolved decision changes scope or authority. Skip for a small, well-understood change.
4. **Architecture gate**: for non-trivial backend work use `hehehe:backend-architecture`; for non-trivial frontend work use `hehehe:frontend-architecture`; use both for cross-stack work. Use `hehehe:architecture-metrics` to select the project profile and record its thresholds and the chosen boundaries in `done-criteria.md` or the implementation spec. Skip for documentation-only, configuration-only, generated-code-only, or obvious one-line changes.
5. **Build**: implement the change directly in the task worktree. Treat security as a first-order coding priority, preserve the chosen boundaries without adding mechanical layers, and use FSD plus Tailwind for new frontend work unless the user requests otherwise. For affected backend or API boundaries, apply `hehehe:observability` in automatic mode instead of returning raw exceptions or adding ad hoc logging. Add tests when the behavior or blast radius justifies them.
6. **Build gate**: run the typecheck, lint, tests, build, and framework checks that apply. Record outcomes in `checks.md`. Fix the underlying issue and rerun when a check fails.
7. **Browser validation**: for UI or browser-facing work, use `hehehe:browser-validate` against the isolated app instance. Capture page errors, new console errors, failed requests, and status codes, and correlate a failing request with its backend log when applicable.
8. **Review and fix loop**: review the actual diff in one pass that covers correctness against the done criteria, security (auth, data exposure, injection, secrets, destructive actions), accidental complexity or duplication introduced by the change, and, for non-trivial application work, the backend/frontend completion gate plus `hehehe:architecture-metrics`. For a high-risk change, optionally ask Claude for a narrow independent review under the policy in `hehehe:hehehe`. Verify each finding, patch the smallest responsible area, and rerun the check that would catch it. Stop when remaining issues are resolved or explicitly documented as out of scope.
9. **Clean and docs**: use `hehehe:clean` for change-local hygiene, update relevant user-facing docs, and remove temporary artifacts. In a maintained repository, run `hehehe:repository-knowledge` in its default automatic mode. Route repository-wide drift or garbage-collection requests to `hehehe:maintain-codebase` instead of expanding ordinary cleanup.
10. **Complete**: record the verification results, the worktree decision, and any skipped steps with reasons in `checks.md`, then verify and complete the run through `hehehe:resume`. Write the final report. Do not automatically remove the worktree or delete its branch.

## Delivery

Implementation completion never implies that anything was committed, pushed, merged, or published.

- **Pull request**: only when the user requests PR delivery, use `hehehe:pr-loop` in `ready` or explicitly authorized `merge` mode.
- **Integrated local delivery and release**: when the user requests it or the repository has it configured, follow `hehehe:resume`. It owns the candidate, approval, and main-update rules and the release handoff.

Completion authority, the verification policy, and what blocks completion are defined in `hehehe:resume`. Codex owns final judgment; do not ship solely because Claude approved.
