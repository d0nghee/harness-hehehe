---
name: resolve
description: Investigate and fix one focused bug, regression, or failing check with Codex as the primary debugger. Use a reproduce-trace-minimal-patch-focused-test loop; switch to full-resolve when the discovered work becomes a feature, spans multiple deployable subsystems, changes migrations or public contracts, or needs the complete delivery pipeline.
---

# hehehe:resolve

Use this for one bug, regression, or failing command. It is a focused repair loop, not the complete feature-delivery and release-readiness pipeline.

## Workflow

1. Use `hehehe:resume` in automatic mode. It selects or reuses the matching task workspace, assigns runtime identity, and initializes or resumes the matching run before edits.
2. Reproduce or inspect the failure in the selected workspace.
3. Trace the responsible code path.
4. Patch the smallest correct area.
5. Add or update focused tests when useful.
6. Rerun the failing check and nearby checks.

If the fix becomes a non-trivial application change, use the applicable `hehehe:backend-architecture` or `hehehe:frontend-architecture` skill before expanding the patch. Use `hehehe:architecture-metrics` to select the project profile, then apply its thresholds to the final diff.

Switch to `hehehe:full-resolve` when the discovered work is no longer one focused repair—for example, it becomes a new feature, affects multiple deployable subsystems, changes a migration or public contract, or requires complete browser, review, documentation, and release-readiness gates. Preserve the same `hehehe:resume` workspace and run when switching.

Use `hehehe:observability` when the failure crosses a browser, API, backend, database, or external-service boundary. Correlate the failing request with protected backend evidence, and preserve stable error responses instead of exposing the underlying exception.

Use Claude only for a second opinion if the root cause remains ambiguous after Codex investigation.
