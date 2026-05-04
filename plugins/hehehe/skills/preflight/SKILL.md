---
name: preflight
description: Audit whether the current code matches the roadmap, done criteria, and requested behavior before shipping.
---

# hehehe:preflight

Use this before release or handoff.

## Checks

- Compare implementation against `.hehehe/done-criteria.md`, roadmap, issue text, or user request.
- Inspect changed files and relevant untouched integration points.
- Run the strongest practical verification commands.
- For UI, perform browser validation if available.
- List gaps in `.hehehe/PREFLIGHT-REPORT.md`.

If `--autofix` or equivalent intent is present, Codex fixes confirmed gaps directly. Claude can be used for a skeptical second pass, but Codex verifies every finding.
