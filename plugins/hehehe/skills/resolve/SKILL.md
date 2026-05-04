---
name: resolve
description: Investigate and fix a single bug or failing check with Codex as the primary debugger.
---

# hehehe:resolve

Use this for one bug, regression, or failing command.

## Workflow

1. Reproduce or inspect the failure.
2. Trace the responsible code path.
3. Patch the smallest correct area.
4. Add or update focused tests when useful.
5. Rerun the failing check and nearby checks.

Use Claude only for a second opinion if the root cause remains ambiguous after Codex investigation.
