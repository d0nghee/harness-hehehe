# Maintenance Policy

Use `.hehehe/maintenance-policy.json` only when the repository wants repeatable scheduled maintenance.

```json
{
  "schema_version": 1,
  "cadence": "weekly",
  "max_targets_per_run": 1,
  "max_changed_files": 8,
  "minimum_hotspot_score": 7,
  "allow_fixes": false,
  "allow_draft_pr": false,
  "protected_paths": [
    "migrations",
    "security",
    "legal"
  ]
}
```

Missing fields use the safe values shown above. A policy may narrow authority but cannot override user instructions, `AGENTS.md`, branch protection, ownership rules, or platform permissions.

## Target priority

Use this order:

1. correctness, security, or structural hard failure
2. repeated CI or production failure with a verified common cause
3. high-churn responsibility hotspot that makes ordinary changes risky
4. duplicated logic or boundary erosion with measurable change-locality cost
5. proven dead code, dependencies, flags, generated output, or assets
6. naming and formatting drift only when repository-native tools enforce it

Do not create a PR solely to lower a heuristic score.

## Change budget

- Select one coherent concern.
- Stay within `max_changed_files` unless correctness requires a larger atomic change.
- Do not mix dependency upgrades with refactoring unless inseparable.
- Preserve public behavior unless the task explicitly authorizes a behavior change.
- Include rollback notes for deletions, migrations, generated ownership, or configuration changes.

## Scheduled authority

- `allow_fixes: false`: report only.
- `allow_fixes: true`: local fixes are allowed in the selected task workspace.
- `allow_draft_pr: true`: a scheduled runner may commit, push, and open one draft PR after all required checks pass.
- No maintenance policy authorizes merge. Use `hehehe:pr-loop` under its separate merge authority.
