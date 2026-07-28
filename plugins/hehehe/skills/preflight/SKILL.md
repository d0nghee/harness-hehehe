---
name: preflight
description: Audit whether the current code matches the roadmap, done criteria, and requested behavior before shipping.
---

# hehehe:preflight

Use this before release or handoff.

## Checks

- Compare implementation against the active run's `done-criteria.md`, legacy `.hehehe/done-criteria.md`, roadmap, issue text, or user request.
- Use `hehehe:resume` in `status` mode. Confirm the current branch, registered worktree, runtime identity, and active run match the task record; verify tests ran from that path and unrelated source-worktree changes were not included accidentally.
- Inspect changed files and relevant untouched integration points.
- Run the strongest practical verification commands.
- Use `hehehe:repository-knowledge` in `check` mode. Treat missing baseline, broken links, missing tracked documents, invalid sources, or stale source fingerprints as handoff gaps. Review warnings without inventing documentation.
- For non-trivial backend work, use `hehehe:backend-architecture`; for frontend work, use `hehehe:frontend-architecture`. Verify the selected project profile, recorded boundaries, and ownership decisions against the actual diff, then record the `hehehe:architecture-metrics` profile and coupling reports.
- Use `hehehe:observability` in `check` and, when executable, `verify` mode for affected workflows. Confirm runtime errors are explained, client error responses are safe and stable, structured backend evidence is correlatable, and full-stack tooling was not made a default dependency.
- For UI, perform browser validation if available.
- When handing off an existing PR, use `hehehe:pr-loop` in `status` mode and verify its ready gate against the exact remote head SHA. Do not infer that local green checks mean the PR is merge-ready.
- List gaps in the active run's `final-report.md` when run state exists; otherwise use `.hehehe/PREFLIGHT-REPORT.md`.

If `--autofix` or equivalent intent is present, Codex fixes confirmed gaps directly. Claude can be used for a skeptical second pass, but Codex verifies every finding.
