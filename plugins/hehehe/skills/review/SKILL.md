---
name: review
description: Perform a focused code review with findings first, prioritizing bugs, regressions, security issues, and missing tests.
---

# hehehe:review

Use code-review stance.

Output order:

1. Findings by severity with file and line references.
2. Open questions or assumptions.
3. Brief change summary only after findings.
4. Test gaps or residual risks.

For a non-trivial frontend or backend diff, use `hehehe:architecture-metrics` and include:

- the project profile score, selected Lite/Standard/Strict profile, and selection source
- the selected profile's pass, improve, and fail ranges
- automated or raw dependency evidence available from the repository
- structural hard failures
- the highest 0-10 coupling score across changed architectural units
- evidence for every non-zero dimension

For backend work, also use `hehehe:backend-architecture` and include:

- responsibility-boundary or dependency-direction violations as findings
- unsafe or misplaced ORM/raw-SQL usage
- `hehehe:observability` contract violations on affected paths: unstable or missing error codes, raw internal failures exposed to clients, duplicate or unstructured error logging, missing request correlation, or sensitive data in logs
- hotspot-trigger observations only when they represent multiple responsibilities or measurable test/change-locality risk

For frontend work, also use `hehehe:frontend-architecture` and include:

- FSD layer, slice, or public-API violations
- state, API, transport, auth, storage, or vendor details in the wrong owner
- a new styling system that violates the Tailwind default without an explicit user override

Treat structural hard failures as blocking in every profile. Apply the selected profile's coupling thresholds; for its improve range, recommend the smallest boundary improvement or document why the scoped exception is safer. Do not demand classes, slices, interfaces, repositories, or file splitting mechanically.

For high-risk diffs, ask Claude for an independent challenge review, then verify each finding locally.
