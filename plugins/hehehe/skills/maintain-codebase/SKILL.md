---
name: maintain-codebase
description: Proactively audit repository drift, rank maintenance hotspots, remove proven garbage, perform bounded refactors, and prepare focused maintenance pull requests. Use for periodic code-health checks, architecture drift, growing complexity, stale flags or dependencies, dead code and assets, duplicated boundaries, maintenance backlogs, or scheduled refactoring automation rather than cleanup limited to the current feature diff.
---

# hehehe:maintain-codebase

Use this as the proactive repository maintenance lifecycle. Keep `hehehe:clean` as the reactive cleanup step for code introduced by the current implementation.

Resolve `scripts/maintenance-audit.mjs` relative to this `SKILL.md`. Read [references/maintenance-policy.md](references/maintenance-policy.md) completely before changing code or creating a PR.

## Modes

Infer the first explicit mode; use `check` when none is supplied.

- `check`: run a read-only audit and rank evidence-backed hotspots.
- `fix`: select one target, make a bounded maintenance change, and verify it locally; do not commit, push, or create a PR.
- `pr`: complete one bounded maintenance change and create or update a draft PR. This explicit mode authorizes the necessary commit and push for that PR, but never merge.
- `scheduled`: follow committed `.hehehe/maintenance-policy.json`; without an applicable policy, fall back to `check`.

## Deterministic Audit

```text
node scripts/maintenance-audit.mjs scan --project <root> [--since-days 90] [--limit 20] [--json]
```

The audit is dependency-free and read-only. It inventories common source files, file size, TODO/FIXME markers, recent Git churn, and dirty paths. Treat its score as prioritization evidence, not proof that a file needs refactoring or deletion.

## Workflow

1. Use `hehehe:resume` to select or continue one maintenance workspace and run.
2. Load `AGENTS.md`, repository knowledge, architecture profile, current diff, and maintenance policy.
3. Run the deterministic audit, project-native lint/test/build checks, `hehehe:repository-knowledge check`, and applicable architecture checks.
4. Separate findings into:
   - structural or correctness drift
   - change-locality and high-churn hotspots
   - duplication or boundary erosion
   - proven garbage such as unreachable code, unused dependencies, expired flags, stale generated output, or orphaned assets
5. Prove a candidate with references, ownership, runtime paths, tests, build output, and history. A heuristic score alone never proves garbage.
6. Select at most one coherent target per maintenance change. Prefer the smallest target with the highest expected reduction in future change cost.
7. Record the baseline, evidence, scope budget, rollback, and verification in the active run.
8. In `fix` or authorized `scheduled` mode, implement the bounded change and run focused plus repository-required checks.
9. In `pr` mode, hand the verified branch to `hehehe:pr-loop` in `ready` mode and create or update a draft maintenance PR.
10. Update repository knowledge only for durable structural or operational changes. Do not turn transient audit output into permanent documentation.

## Garbage-Collection Gate

Delete only when all relevant references and runtime entry points were checked and at least one strong proof exists: compiler/linter reachability, dependency analysis, feature-flag ownership and expiry, route or asset graph, generated-file ownership, or a repository test/build demonstrating absence.

Do not delete based only on age, low churn, naming, a TODO, or lack of recent commits. Preserve database migrations, compatibility paths, public contracts, audit records, legal artifacts, fixtures, and deployment fallbacks unless their owner and retirement conditions are verified.

## Periodic Operation

A scheduler may invoke `scheduled`, but scheduling does not broaden mutation authority. The committed maintenance policy must bound cadence, target count, changed files, draft-PR creation, and protected paths. If no actionable target meets the policy threshold, produce a no-change result rather than a cosmetic PR.

Never combine unrelated cleanup, product changes, dependency upgrades, and architecture rewrites in one maintenance PR.
