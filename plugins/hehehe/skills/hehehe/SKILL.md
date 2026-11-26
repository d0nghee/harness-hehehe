---
name: hehehe
description: Use this skill when the user wants a Codex-first automated development workflow that turns ideas, specs, bugs, UI requests, maintenance drift, or pull-request failures into implemented and verified code while using Claude only as an optional independent reviewer, evaluator, challenger, or security critic.
---

# hehehe

hehehe is a Codex-first development pipeline. This skill is the entry point: it states the operating model and routes the request to the skill that owns the work. Do not restate another skill's procedure here; read that skill.

## Operating Model

- Codex owns the critical path: code search, architecture reading, implementation, test fixes, integration, and the decision about what is ready to ship.
- Reason internally in English.
- Always write the final response to the user in Korean.
- Clarify the task only when a risky ambiguity cannot be resolved from the repo. Otherwise make a conservative assumption and proceed.
- Keep edits scoped, prefer existing project patterns, avoid unrelated refactors, and preserve user changes already present in the worktree.

## Routing

Infer the mode from the request when the user does not name one.

| Request | Skill |
| --- | --- |
| A feature, broad change, or multi-step end-to-end delivery | `hehehe:full-resolve` |
| One focused bug, regression, or failing check | `hehehe:resolve` |
| Several independent workstreams, or a bug with unclear ownership across modules | `hehehe:subagent-resolve` |
| A rough idea, product discovery, product-wide spec, or what to build next | `hehehe:ideate` |
| A feature-level spec with acceptance criteria | `hehehe:feature-spec` |
| Review, multi-perspective review, or scoring completed work | `hehehe:review` |
| Comparing the implementation against done criteria before shipping | `hehehe:preflight` |
| UI direction, design system, or UI implementation | `hehehe:design-ui`, `hehehe:design-system`, `hehehe:implement-ui` |
| Browser testing of a workflow | `hehehe:browser-validate` |
| Runtime evidence, structured errors, and request correlation | `hehehe:observability` |
| Periodic drift audit or one evidence-backed maintenance change | `hehehe:maintain-codebase` |
| Reconciling CI failures and review feedback on an existing pull request | `hehehe:pr-loop` |
| Docs after a code change, or long-lived project knowledge | `hehehe:update-docs`, `hehehe:repository-knowledge` |
| Plugin or project setup problems | `hehehe:doctor` |
| Preparing, inspecting, continuing, completing, or retiring a task workspace and run | `hehehe:resume` |

A small one-off fix needs no pipeline: make the change, run the check that covers it, and report.

## Shared Rules

`hehehe:resume` is the single owner of the task lifecycle. Use it before new non-trivial code work. It defines the task branch and worktree decision, run state under `.hehehe/runs/<run-id>/`, the verification policy that gates completion, integrated local delivery, and release handoff. Other skills refer to it instead of repeating those rules; when they conflict with a summary elsewhere, `hehehe:resume` wins.

Pipeline state lives in `.hehehe/`. Run artifacts (`state.json`, `done-criteria.md`, `build-log.md`, `checks.md`, `claude-review.md`, `final-report.md`) belong to the active run directory. Keep them concise; they are coordination artifacts, not documentation dumps. Preserve legacy singleton `.hehehe/*.md` files as history and do not append new runs to them.

Never relax, delete, or skip a required check to make a task pass, and never treat AI-authored pass claims as completion evidence. The trusted completion gate applies only where a repository has adopted a verification policy; elsewhere the project's own checks, actually run and recorded, are the verification.

Local delivery does not authorize remote push, release, or deployment. Each needs its own explicit authority.

## Claude Use Policy

Claude is an optional, read-only advisor, never the main driver.

Use Claude when the change is high risk (security, auth, data loss, billing, migrations), when the user asks for a second opinion, or when the diff is large enough that an independent pass is likely to catch issues. Skip it for a small or obvious fix, when the next step is blocked on local code reading, or when it would duplicate work Codex already completed.

Give Claude a narrow prompt: the goal, done criteria, changed files or diff summary, verification already run, and the exact kind of critique requested. Do not ask it to implement, to "fix whatever you find", or to decide completion without seeing checks.

Claude findings are input, not authority. Verify each material finding against the code before changing anything, and never present one as verified until Codex has checked it.

## Final Report

End with a concise response: what changed, where, what verification passed, which checks could not be run, and any remaining risk. Do not over-report internal pipeline files unless the user asks for them.
