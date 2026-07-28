---
name: hehehe
description: Use this skill when the user wants a Codex-first automated development workflow that turns ideas, specs, bugs, UI requests, maintenance drift, or pull-request failures into implemented and verified code while using Claude only as an optional independent reviewer, evaluator, challenger, or security critic.
---

# hehehe

## Purpose

hehehe is a Codex-first development pipeline. Codex is the main operator: it reads the codebase, plans the change, edits files, runs checks, fixes failures, and decides what is ready to ship. Claude is a secondary evaluator used only when an independent outside pass is useful.

Use this skill for:

- turning a rough idea into a scoped implementation
- building a feature from a spec
- resolving a bug with verification
- reviewing and hardening an existing change
- checking whether code matches a roadmap or done criteria
- auditing codebase drift and preparing a focused maintenance change
- reconciling CI failures and review feedback until a PR reaches its authorized terminal state

## Operating Model

Codex owns the critical path.

- Codex performs code search, architecture reading, implementation, test fixes, and final integration.
- Reason internally in English.
- Always write the final response to the user in Korean.
- Claude is optional and advisory. Use it for second-opinion evaluation, skeptical review, security review, or UX critique.
- Claude findings are input, not authority. Codex must verify them against the code before changing anything.
- Do not delegate blocking implementation work to Claude when Codex can do it directly.
- Do not let Claude rewrite the plan from scratch unless the user explicitly asks for a second architecture proposal.

## Workspace Files

Use `.hehehe/` for pipeline state when the task is more than a small one-off fix.

- `.hehehe/current.json`: pointer to the latest active or completed run
- `.hehehe/runs/<run-id>/state.json`: goal, phase, next step, status, and artifact paths
- `.hehehe/runs/<run-id>/done-criteria.md`: the concrete success criteria Codex will verify
- `.hehehe/runs/<run-id>/build-log.md`: implementation notes and commands run
- `.hehehe/runs/<run-id>/checks.md`: typecheck, lint, test, build, and browser validation results
- `.hehehe/runs/<run-id>/claude-review.md`: advisory Claude findings, if Claude was used
- `.hehehe/runs/<run-id>/final-report.md`: final summary, risks, and remaining gaps
- `.hehehe/architecture-policy.json`: optional fixed or bounded architecture-profile policy
- `.hehehe/architecture-profile.json`: generated project score, selected profile, evidence, and coupling thresholds
- `.hehehe/knowledge.json`: repository knowledge documents, evidence paths, verification times, and source fingerprints
- `.hehehe/maintenance-policy.json`: optional bounds for scheduled fixes and draft maintenance PRs
- `.hehehe/pr-policy.json`: optional push, iteration, approval, and auto-merge bounds
- `.hehehe/workspaces/<workspace-id>/`: task-scoped local logs or runtime evidence when used

Keep these files concise. They are coordination artifacts, not documentation dumps.
Use `hehehe:resume` as the unified task lifecycle. Its deterministic scripts select or create the task branch and worktree, assign runtime identity, initialize or resume matching run state, inspect or advance progress, complete verified runs, and explicitly retire preserved workspaces. Preserve legacy singleton `.hehehe/*.md` files as history and do not append new runs to them.

Use `hehehe:repository-knowledge` as the common analysis and maintenance baseline in maintained repositories, independent of the selected architecture profile. Its default mode initializes, synchronizes, and checks automatically; `init`, `sync`, `check`, and `status` remain explicitly invocable.

Use `hehehe:observability` as the task-adaptive runtime evidence baseline. Its automatic mode reuses browser, application, and test output without installing a monitoring stack. Backend/API work applies stable error codes, safe client responses, structured logs, and request correlation; a Docker logs-metrics-traces stack requires explicit `full` mode.

Use `hehehe:maintain-codebase` for proactive periodic drift checks, evidence-backed garbage collection, and one-target maintenance changes. Do not turn `hehehe:clean`, which is local to the current implementation, into an unbounded repository refactor.

Use `hehehe:pr-loop` when an existing pull request must absorb review feedback or CI fixes. It may update or merge only the exact PR and head SHA within current user and committed repository-policy authority.

Use `hehehe:resume` before new non-trivial code work. Task identity owns one stable branch, registered worktree, runtime identity, and matching run; a date may label the directory but never creates a new identity for resumed work. Keep dirty source changes in place unless the user separately authorizes a preservation strategy.

## Pipeline

### 1. Workspace and Intake

Clarify the task only when a risky ambiguity cannot be resolved from the repo. Otherwise make a conservative assumption and proceed. Use `hehehe:resume` in automatic mode to reuse the current matching task workspace or select an isolated task branch and worktree when parallel work, unrelated dirty changes, task risk, task duration, or runtime collisions justify it. It then initializes or resumes matching run-scoped state inside that workspace.

Write `done-criteria.md` in the active run directory with:

- user goal
- task branch, worktree, committed base, and runtime identity
- files or subsystems likely affected
- expected behavior
- verification commands
- known constraints

### 2. Plan Gate

Before editing, require a decision-complete plan when the task touches auth or security, migrations or backfills, destructive or billable effects, public API contracts, or multiple deployable subsystems. Confirm invariants, scope, integration points, dependencies, acceptance criteria, and verification. Skip this gate for a small, well-understood change.

### 3. Architecture Gate

Before editing non-trivial application code:

- use `hehehe:backend-architecture` for backend work
- use `hehehe:frontend-architecture` for frontend work
- use both for cross-stack work

Use `hehehe:architecture-metrics` as their shared profile selector and coupling gate. Generate the project profile report first. Record the project score, selected Lite/Standard/Strict profile, profile-specific coupling thresholds, responsibility boundaries, data-access or state/API ownership, and styling decisions in the active run's `done-criteria.md` or implementation spec.

Skip this gate for documentation-only, configuration-only, generated-code-only, or obvious one-line changes.

### 4. Build

Codex implements the change directly.

- Prefer existing project patterns.
- For backend work, preserve the architecture contract chosen at the Architecture Gate. Do not add layers or generic abstractions without a concrete boundary they protect.
- For frontend work, use FSD and Tailwind by default. Explicit user requests override these defaults; established projects keep one coherent architecture and styling system unless migration is in scope.
- Treat security as a first-order coding priority: avoid data exposure, unsafe inputs, secret leakage, injection paths, and destructive actions while designing and editing code.
- For affected backend or API boundaries, apply `hehehe:observability` rather than returning raw exceptions or adding ad hoc logging.
- Keep edits scoped.
- Avoid unrelated refactors.
- Preserve user changes already present in the worktree.
- Add tests when the behavior or blast radius justifies them.

### 5. Build Gate

Run the strongest local checks that apply to the repo:

- typecheck
- lint
- unit tests
- integration tests
- production build
- framework-specific validation

Record command outcomes in the active run's `checks.md`. If checks fail, fix the underlying issue and rerun the relevant check.

### 6. Product Validation

For UI or browser-facing work, validate in a browser when available.

Check:

- the main workflow actually works
- no blank screens or console-breaking errors
- failed requests, status codes, safe error payloads, and relevant timings are understood
- browser/API and backend evidence share a request identifier when correlation is needed
- responsive layout does not overlap or clip
- loading and error states are usable

### 7. Claude Advisory Pass

Use Claude only when the task benefits from an independent pass.

Good Claude tasks:

- "Review this diff for correctness and missed edge cases."
- "Challenge whether this implementation satisfies the done criteria."
- "Look for security issues in these changed files."
- "Assess whether the UI behavior matches the requested workflow."

Bad Claude tasks:

- "Figure out the whole codebase and implement it."
- "Fix whatever you find."
- "Decide whether we are done without seeing checks."

When using Claude, provide a narrow prompt with:

- the goal
- done criteria
- changed files or diff summary
- verification already run
- the exact kind of critique requested

Then Codex must inspect each material finding before accepting it.

### 8. Fix Loop

For each confirmed issue:

1. Patch the smallest responsible area.
2. Rerun the check that would catch the issue.
3. Update the active run's `checks.md` or `claude-review.md`.

Stop when remaining issues are either resolved or explicitly documented as out of scope.

### 9. Final Report

End with a concise final response:

- what changed
- where it changed
- what verification passed
- any checks that could not be run
- any remaining risk

For non-trivial application work, run the applicable backend or frontend completion gate and record both the project profile result and the shared architecture-metrics coupling report in `checks.md`. Record the selected `observability` mode and runtime evidence for affected workflows. For maintained repositories, also record the final `repository-knowledge` freshness result. For maintenance or PR work, record the selected target, authority boundary, exact PR head SHA, and terminal `PASS`, `READY`, `MERGED`, or `BLOCKED` state as applicable.

Mark run state complete only after required evidence passes. Use `hehehe:resume` to continue an interrupted active run and `hehehe:doctor` to diagnose plugin or project setup problems.

Do not over-report internal pipeline files unless the user asks for them.

## Modes

Use these user-facing modes when helpful:

- `build`: use `full-resolve` for a feature, broad change, or multi-step end-to-end delivery
- `resolve`: reproduce and repair one focused bug, regression, or failing check
- `review`: review current changes, findings first
- `preflight`: compare implementation against done criteria
- `harden`: run review, security, and edge-case passes
- `docs`: update docs after code changes
- `observability`: apply or verify local runtime evidence and structured error handling
- `maintenance`: audit drift, prove garbage, or prepare one focused maintenance change with `maintain-codebase`
- `pr`: reconcile review and CI state to an authorized ready or merged state with `pr-loop`
- `doctor`: diagnose global plugin and project readiness without mutation
- `resume`: prepare, inspect, continue, complete, or explicitly retire the matching task workspace and durable run

If the user does not specify a mode, infer it from the request.

## Claude Use Policy

Claude is a sub-agent, not the main driver.

Use Claude when:

- the change is high risk
- the implementation touches security, auth, data loss, billing, or migrations
- the user asks for a second opinion
- the diff is large enough that an independent review is likely to catch issues

Skip Claude when:

- the task is a small typo or obvious one-line fix
- the next step is blocked on local code reading or implementation
- using Claude would duplicate work Codex already completed

Record Claude output as advisory. Never present it as verified until Codex has checked it.
