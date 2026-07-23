---
name: resume
description: Initialize, inspect, and resume durable run-scoped hehehe workflow state. Use when starting non-trivial hehehe work, continuing after interruption or compaction, inspecting the active phase and next step, recording a blocker, or completing a verified run.
---

# hehehe:resume

Resolve `scripts/run-state.mjs` relative to this `SKILL.md` and use it as the only writer for `.hehehe/current.json` and `state.json`.

```text
node scripts/run-state.mjs init --project <root> --goal "<goal>"
node scripts/run-state.mjs status --project <root> --json
node scripts/run-state.mjs advance --project <root> --phase <phase> --next "<next step>"
node scripts/run-state.mjs advance --project <root> --phase blocked --status blocked --next "<actionable blocker>"
node scripts/run-state.mjs complete --project <root>
```

## Resume workflow

1. Read status as JSON.
2. Confirm the stored goal still matches the user request. Do not reuse an unrelated active run.
3. Read the run's done criteria, build log, checks, and final report.
4. Inspect the current worktree and verify recorded claims against actual files and command output.
5. Continue from `next_step`; update state after each material phase transition.
6. Mark complete only when required done criteria and verification pass.

If status is `blocked`, retry only when the recorded condition changed or a safe alternative exists. Ask the user when continuation requires new authority or a scope decision. Preserve legacy singleton `.hehehe/*.md` files; do not migrate or delete them automatically.
