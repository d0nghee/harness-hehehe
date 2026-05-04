---
name: ideate
description: Turn a rough product, feature, or app idea into a Codex-ready roadmap, done criteria, and implementation spec for the hehehe workflow.
---

# hehehe:ideate

Use this when the user has an idea but not a buildable spec.

Codex is the main product engineer. Claude may be used only for optional critique of the resulting spec.

## Workflow

1. Interview lightly if the goal, user, or success criteria are unclear.
2. Inspect the repo if one exists; ground the spec in existing architecture.
3. Create `.hehehe/vision.md`, `.hehehe/roadmap.md`, and `.hehehe/done-criteria.md`.
4. Write `.hehehe/implementation-spec.md` with concrete phases, affected areas, validation commands, and risks.
5. If using Claude, ask it to challenge ambiguity and missing edge cases only; Codex decides final edits.

Do not implement code in this skill unless the user explicitly asks to continue into `auto-resolve`.
