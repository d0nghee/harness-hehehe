---
name: review
description: Perform a focused code review with findings first, prioritizing bugs, regressions, security issues, and missing tests. Also use for a multi-perspective review of an important PR or broad change, and for evaluating or scoring completed work against requested behavior.
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

## Multi-perspective review

For an important PR or broad change, review from each perspective that applies: correctness, architecture, security, tests, UX, and operational readiness. If sub-agents are available, bounded read-only perspectives may run in parallel. Codex consolidates the findings and removes duplicates.

## Evaluating completed work

When asked to evaluate or score finished work, also judge correctness against the requested behavior, missing edge cases, test and build coverage, maintainability, and UI workflow quality when relevant.

Every finding leads with severity and a file reference. Do not include speculative issues that are not grounded in code. Claude findings are advisory until Codex checks the code.
