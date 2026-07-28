---
name: architecture-metrics
description: Select a Lite, Standard, or Strict project profile and measure non-trivial frontend or backend coupling with a separate 0-10 evidence-based score, profile-aware thresholds, repository-relative dependency signals, and structural hard failures. Use during architecture planning, implementation review, preflight, or cleanup for TypeScript, JavaScript, Python, or Go projects.
---

# hehehe:architecture-metrics

Select the project profile first, then score each changed architectural unit such as a feature, package, or module. The project profile score and the change coupling score are separate measurements. Do not average changed units; report the highest coupling score so one hotspot cannot hide inside a broad diff.

## Project Profile

Resolve `scripts/project-profile.mjs` relative to this `SKILL.md`. For non-trivial application work, run:

```text
node <resolved-script-path> --project <project-root> --write --json
```

Read `.hehehe/architecture-profile.json` and use its `selected_profile` and `coupling_thresholds`. The scanner scores security/data risk, domain complexity, integration complexity, operational risk, and collaboration pressure from `0-2` each:

- `0-3`: Lite
- `4-6`: Standard
- `7-10`: Strict

An optional `.hehehe/architecture-policy.json` may fix the profile, constrain its range, or declare dimensions that require business context. A fixed project policy wins over automatic calculation. An explicit user instruction for the active task wins over stored policy, but record the exception and reason. Automatic upgrades apply immediately; automatic downgrades require explicit policy or `--allow-downgrade`.

Read [references/project-profiles.md](references/project-profiles.md) for the policy schema, exact score dimensions, and CLI behavior.

## Change Coupling Score

Give each dimension `0`, `1`, or `2`, then sum to `0-10`:

- `0`: the boundary is clear and the change stays local.
- `1`: one contained compromise crosses a boundary or adds avoidable coordination while remaining independently testable.
- `2`: structural coupling mixes responsibilities or layers, leaks infrastructure, creates broad fan-out, or requires the full stack to test.

Dimensions:

1. **Responsibility overlap**
2. **Dependency direction**
3. **Infrastructure leakage**
4. **Change fan-out**
5. **Test isolation**

Apply the thresholds from the selected project profile:

| Profile | Pass | Improve or justify | Fail |
| --- | --- | --- | --- |
| Lite | `0-4` | `5-6` | `7-10` |
| Standard | `0-3` | `4-5` | `6-10` |
| Strict | `0-2` | `3-4` | `5-10` |

The score is ordinal, not a percentage. Record one sentence of evidence for every non-zero dimension.

## Quantitative Evidence

Use repository tools already present. Do not add a dependency only to produce the score unless the task includes architecture tooling.

- TypeScript/JavaScript: use an existing dependency-cruiser, ESLint boundary rule, Nx graph, or equivalent; otherwise inspect resolved internal imports.
- Python: use an existing Import Linter or equivalent; otherwise inspect package imports.
- Go: compilation already rejects import cycles; use existing `go list`, `go/packages`, or lint rules for package edges.
- Any stack: inspect the diff, changed feature/package count, external collaborators, and focused test requirements.

For internal import fan-out, compare like-for-like production units and exclude generated code, tests, framework composition roots, and entrypoints:

- repository median or lower: evidence for `0`
- above median through the 90th percentile: evidence for `1`
- above the 90th percentile: evidence for `2`

If the repository is too small for meaningful percentiles, report raw counts and use the responsibility and boundary evidence instead of inventing a universal threshold.

For change fan-out:

- one feature or package: evidence for `0`
- two: evidence for `1`
- three or more, or an unrelated shared core change: evidence for `2`

Quantitative signals support judgment; they do not override a clearly safe composition root or a clearly unsafe boundary.

## Hard Failures

Fail the Architecture Gate regardless of the total score when the change introduces:

- a new circular production dependency
- an unapproved reverse-layer or forbidden-boundary dependency
- domain/application code importing transport, UI, ORM session, concrete database, or vendor SDK details
- presentation code owning business rules plus direct persistence or transport mechanics
- a cross-feature import that bypasses the target feature's public API

Legacy violations outside the changed path do not expand scope automatically. Block new violations and record touched legacy constraints.

## Gate Report

Record in `checks.md`:

```text
Project profile score: N/10
Project profile: Lite | Standard | Strict
Profile selection: auto | fixed | user override - reason
Coupling thresholds: pass X-Y | improve A-B | fail C-10
Architecture unit:
Automated evidence:
Hard failures: none | list
Responsibility overlap: 0-2 - evidence
Dependency direction: 0-2 - evidence
Infrastructure leakage: 0-2 - evidence
Change fan-out: 0-2 - evidence
Test isolation: 0-2 - evidence
Final coupling score: N/10
Decision: pass | improve/justify | fail
```
