# Done Criteria

## Goal

Implement automatic Lite Standard Strict project profiles and profile-aware coupling gates

## Expected Behavior

- `hehehe` calculates a project profile score from five evidence-backed dimensions.
- Scores select Lite (`0-3`), Standard (`4-6`), or Strict (`7-10`).
- Fixed user configuration overrides automatic selection.
- Automatic profile downgrades are suppressed unless explicitly allowed.
- Coupling thresholds change with the selected profile while structural hard failures remain blocking.
- `full-resolve`, preflight, review, and templates record both the project profile and change coupling score.

## In Scope

- Deterministic Node.js profile scorer bundled with the architecture-metrics skill
- Optional `.hehehe/architecture-policy.json` configuration and generated profile report
- CLI access, tests, docs, version bump, validation, and global plugin installation

## Out of Scope

- Full language-specific import graph enforcement
- Automatically installing dependency-cruiser, Import Linter, or Go tooling into user projects
- Changing application repositories such as innmun-dream

## Verification

- Profile scorer fixture tests for Lite, Standard, Strict, fixed overrides, and downgrade behavior
- CLI syntax check and full `npm run validate`
- Skill `quick_validate.py`
- Forward tests using fresh project scenarios
- Installed plugin version and bundled script verification

## Architecture

- Architecture profile (backend/frontend/cross-stack): adaptive plugin tooling
- Project profile mode (auto/fixed/user override): auto
- Project profile score and selected profile (Lite/Standard/Strict): 2/10, Lite
- Coupling thresholds (pass/improve/fail): 0-4 / 5-6 / 7-10
- Responsibility boundaries: deterministic scorer produces evidence; Codex retains qualitative coupling judgment
- Frontend FSD layer/slice and public APIs:
- Frontend styling (Tailwind or explicit override):
- Data-access choices: no database changes
- Final coupling score (non-trivial application work): 2/10, pass
- Structural hard failures: none

## Risks

- Repository heuristics can over-score unusual layouts; declared scores and fixed mode provide explicit correction.
- Profile flapping can disrupt workflows; persisted reports prevent automatic downgrade by default.
- Security and architecture hard failures must not be weakened by a Lite profile.
