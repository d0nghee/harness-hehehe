---
name: auto-resolve
description: Run the full Codex-first implementation pipeline: build, gate, browser validate, optional Claude review, fix loop, cleanup, and docs.
---

# hehehe:auto-resolve

Use this for end-to-end implementation from a spec, issue, prompt, or `.hehehe/implementation-spec.md`.

## Pipeline

1. **Intake**: read the request, repo, and `.hehehe/*` files if present.
2. **Build**: Codex implements the change directly.
3. **Build Gate**: run typecheck, lint, tests, build, and framework checks that apply.
4. **Browser Validate**: for UI work, run or open the app and inspect the workflow.
5. **Evaluate**: optionally ask Claude for a narrow independent review.
6. **Fix Loop**: Codex verifies each real issue, patches, and reruns checks.
7. **Simplify**: remove duplication and accidental complexity introduced by the change.
8. **Review**: perform Codex review first; Claude review is advisory.
9. **Challenge**: ask whether the diff actually satisfies the done criteria.
10. **Security Review**: check auth, data exposure, injections, secrets, and destructive actions.
11. **Clean + Docs**: update relevant docs and remove temporary artifacts.

Write concise state to `.hehehe/checks.md`, `.hehehe/claude-review.md`, and `.hehehe/final-report.md` for non-trivial work.

Codex owns final judgment. Do not ship solely because Claude approved.
