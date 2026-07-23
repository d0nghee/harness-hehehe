---
name: auto-resolve
description: "Run the full Codex-first implementation pipeline: build, gate, browser validate, optional Claude review, fix loop, cleanup, and docs."
---

# hehehe:auto-resolve

Use this for end-to-end implementation from a spec, issue, prompt, or `.hehehe/implementation-spec.md`.

## Pipeline

1. **Intake**: read the request, repo, and existing `.hehehe` state. For non-trivial work, use the run-state script bundled with `hehehe:resume` to initialize a run, or resume the active run only when its goal matches.
2. **Plan Gate**: require a decision-complete plan before editing when the task touches auth or security, migrations or backfills, destructive or billable effects, public API contracts, or more than one deployable subsystem. Record invariants, scope, affected integration points, dependencies, acceptance criteria, and verification. Stop for user input only when an unresolved decision changes scope or authority. Skip this gate for a small, well-understood change.
3. **Build**: Codex implements the change directly, treating security as a first-order coding priority.
4. **Build Gate**: run typecheck, lint, tests, build, and framework checks that apply.
5. **Browser Validate**: for UI work, run or open the app and inspect the workflow.
6. **Evaluate**: optionally ask Claude for a narrow independent review.
7. **Fix Loop**: Codex verifies each real issue, patches, and reruns checks.
8. **Simplify**: remove duplication and accidental complexity introduced by the change.
9. **Review**: perform Codex review first; Claude review is advisory.
10. **Challenge**: ask whether the diff actually satisfies the done criteria.
11. **Security Review**: check auth, data exposure, injections, secrets, and destructive actions.
12. **Clean + Docs**: update relevant docs and remove temporary artifacts.
13. **Complete**: update the run report and mark the run complete with the `hehehe:resume` run-state script only after required evidence passes.

For non-trivial work, write concise artifacts under the active `.hehehe/runs/<run-id>/` directory. Preserve legacy singleton `.hehehe/*.md` files but do not append new runs to them.

Codex owns final judgment. Do not ship solely because Claude approved.
