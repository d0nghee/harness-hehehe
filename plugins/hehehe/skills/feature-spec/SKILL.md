---
name: feature-spec
description: Create a feature-level implementation spec with acceptance criteria and verification steps.
---

# hehehe:feature-spec

Use before implementing a discrete feature.

Initialize a run with the run-state script bundled with `hehehe:resume`, or reuse the active run only when its goal matches. Write `feature-spec.md` and `done-criteria.md` inside that run directory with:

- user story
- behavior
- invariants and observed evidence
- in-scope and out-of-scope behavior
- affected routes/APIs/components
- dependencies and integration points
- edge cases
- acceptance criteria mapped to verification
- rollout notes

Resolve decisions that would change scope, contracts, or authority before marking the spec ready. This should be decision-complete for `hehehe:auto-resolve` without another planning pass.
