# Project Architecture Profiles

Project profile and change coupling are two separate scores.

## Project profile score

Score the project from `0-10`. Each dimension is `0`, `1`, or `2`:

1. security and data risk
2. domain complexity
3. integration complexity
4. operational risk
5. collaboration pressure

The deterministic scanner uses repository evidence where practical. A project policy may declare a dimension when repository evidence cannot express business context.

| Score | Profile |
| --- | --- |
| `0-3` | Lite |
| `4-6` | Standard |
| `7-10` | Strict |

### Automatic evidence rules

The scanner applies these deterministic defaults:

| Dimension | `0` | `1` | `2` |
| --- | --- | --- | --- |
| Security/data risk | no detected auth, payment, or regulated-data signal | auth dependency or conventional auth/identity path | payment or regulated-data dependency/path signal |
| Domain complexity | fewer than 3 directories in the first conventional feature/domain/module root | 3-5 directories | 6 or more directories |
| Integration complexity | fewer than 2 collaborators | 2-3 collaborators | 4 or more collaborators |
| Operational risk | no migration, deployment, or infrastructure signal | either migration or deployment/infrastructure signal | migrations plus deployment/infrastructure, or migrations plus at least 2 deployables |
| Collaboration pressure | 0-1 distinct Git contributor emails in the last 180 days, or unavailable history | 2-3 contributors | 4 or more contributors |

For integration complexity, collaborator count is:

```text
detected external providers + max(0, deployable roots - 1)
```

Conventional domain roots include `src/features`, `features`, `src/domains`, `domains`, `src/modules`, `modules`, and `app/features`. Deployable roots are immediate children of `apps`, `services`, or `cmd`; a root package manifest counts as one deployable only when no multi-root layout is found.

The scanner intentionally prefers auditable repository evidence over inferred business meaning. Use `declared_scores` for facts that code cannot prove, such as regulated data not named in dependencies, a larger effective team than recent Git history shows, or operational criticality hidden behind external deployment systems. Every declared dimension replaces only its matching detected score and is labeled `declared` in the report.

Run from the plugin package:

```text
node <architecture-metrics>/scripts/project-profile.mjs --project <project-root> --write --json
```

Or after installing the package CLI:

```text
harness-hehehe profile <project-root> --write
```

The report is written to `.hehehe/architecture-profile.json`.

## Change coupling thresholds

Score every changed architectural unit with the five coupling dimensions in `SKILL.md`. Use the highest unit score.

| Profile | Pass | Improve or justify | Fail |
| --- | --- | --- | --- |
| Lite | `0-4` | `5-6` | `7-10` |
| Standard | `0-3` | `4-5` | `6-10` |
| Strict | `0-2` | `3-4` | `5-10` |

Structural hard failures block every profile regardless of the numeric score.

## Optional project policy

Create `.hehehe/architecture-policy.json` only when the defaults need an explicit override:

```json
{
  "schema_version": 1,
  "profile": {
    "mode": "auto",
    "fixed": null,
    "minimum": "lite",
    "maximum": "strict",
    "allow_automatic_downgrade": false
  },
  "declared_scores": {
    "security_data_risk": 1,
    "domain_complexity": 1
  }
}
```

- `mode: "auto"` calculates the profile and applies `minimum`/`maximum`.
- `mode: "fixed"` uses `fixed` and takes precedence over calculation.
- `declared_scores` override only named dimensions and must be integers from `0-2`.
- Automatic upgrades apply immediately.
- Automatic downgrades are retained at the previous profile unless the policy or CLI explicitly allows them.
- An explicit user instruction for the active task overrides the stored profile, but the exception and reason must be recorded.
