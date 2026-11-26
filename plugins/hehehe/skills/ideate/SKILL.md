---
name: ideate
description: Turn a rough product, feature, or app idea into a Codex-ready roadmap, done criteria, and implementation spec for the hehehe workflow. Also use for product discovery when the problem is still vague, for a product-wide spec, and for recommending what to build next.
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

## Related outputs

Produce only the output the request needs.

- **Discovery**, when the problem is still vague: identify target users, core jobs and workflows, constraints, non-goals, data-model assumptions, success signals, and risks. Save concise results to `.hehehe/product-discovery.md`.
- **Product-wide spec**: write `.hehehe/product-spec.md` with goals, personas, workflows, information architecture, permissions, data needs, acceptance criteria, and rollout risks. Keep it buildable; avoid vague aspiration.
- **What to build next**: inspect specs, docs, and code, then recommend up to five features with rationale, effort, dependencies, risk, and a suggested first implementation slice. Do not invent features disconnected from the repo or product goal.

Do not implement code in this skill unless the user explicitly asks to continue into `full-resolve`.
