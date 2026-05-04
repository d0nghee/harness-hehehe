---
name: hehehe
description: Use this skill when the user wants a Codex-first automated development workflow that turns ideas, specs, bugs, or UI requests into implemented, verified code while using Claude only as an optional independent reviewer, evaluator, challenger, or security critic.
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

## Operating Model

Codex owns the critical path.

- Codex performs code search, architecture reading, implementation, test fixes, and final integration.
- Claude is optional and advisory. Use it for second-opinion evaluation, skeptical review, security review, or UX critique.
- Claude findings are input, not authority. Codex must verify them against the code before changing anything.
- Do not delegate blocking implementation work to Claude when Codex can do it directly.
- Do not let Claude rewrite the plan from scratch unless the user explicitly asks for a second architecture proposal.

## Workspace Files

Use `.hehehe/` for pipeline state when the task is more than a small one-off fix.

- `.hehehe/done-criteria.md`: the concrete success criteria Codex will verify
- `.hehehe/build-log.md`: implementation notes and commands run
- `.hehehe/checks.md`: typecheck, lint, test, build, and browser validation results
- `.hehehe/claude-review.md`: advisory Claude findings, if Claude was used
- `.hehehe/final-report.md`: final summary, risks, and remaining gaps

Keep these files concise. They are coordination artifacts, not documentation dumps.

## Pipeline

### 1. Intake

Clarify the task only when a risky ambiguity cannot be resolved from the repo. Otherwise make a conservative assumption and proceed.

Write `.hehehe/done-criteria.md` for non-trivial work with:

- user goal
- files or subsystems likely affected
- expected behavior
- verification commands
- known constraints

### 2. Build

Codex implements the change directly.

- Prefer existing project patterns.
- Keep edits scoped.
- Avoid unrelated refactors.
- Preserve user changes already present in the worktree.
- Add tests when the behavior or blast radius justifies them.

### 3. Build Gate

Run the strongest local checks that apply to the repo:

- typecheck
- lint
- unit tests
- integration tests
- production build
- framework-specific validation

Record command outcomes in `.hehehe/checks.md`. If checks fail, fix the underlying issue and rerun the relevant check.

### 4. Product Validation

For UI or browser-facing work, validate in a browser when available.

Check:

- the main workflow actually works
- no blank screens or console-breaking errors
- responsive layout does not overlap or clip
- loading and error states are usable

### 5. Claude Advisory Pass

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

### 6. Fix Loop

For each confirmed issue:

1. Patch the smallest responsible area.
2. Rerun the check that would catch the issue.
3. Update `.hehehe/checks.md` or `.hehehe/claude-review.md`.

Stop when remaining issues are either resolved or explicitly documented as out of scope.

### 7. Final Report

End with a concise final response:

- what changed
- where it changed
- what verification passed
- any checks that could not be run
- any remaining risk

Do not over-report internal pipeline files unless the user asks for them.

## Modes

Use these user-facing modes when helpful:

- `build`: implement from a request or spec
- `resolve`: investigate and fix a bug
- `review`: review current changes, findings first
- `preflight`: compare implementation against done criteria
- `harden`: run review, security, and edge-case passes
- `docs`: update docs after code changes

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
