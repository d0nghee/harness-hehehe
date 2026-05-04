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

For high-risk diffs, ask Claude for an independent challenge review, then verify each finding locally.
