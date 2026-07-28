# Checks

## Project Profile

- Project profile score: 2/10
- Project profile: Lite
- Profile selection: auto - repository evidence
- Coupling thresholds: pass 0-4 | improve 5-6 | fail 7-10
- Report: `.hehehe/architecture-profile.json`

## Architecture Gate

- Architecture unit: adaptive profile scorer and workflow integration
- Automated evidence: source/profile script hash parity after installation; skill validation; fixture and installer tests
- Hard failures: none
- Responsibility overlap: 0 - deterministic scanning, CLI orchestration, workflow judgment, and documentation remain explicit responsibilities.
- Dependency direction: 0 - the package CLI composes the bundled scorer without domain/application reverse dependencies.
- Infrastructure leakage: 0 - the scorer uses repository metadata and exposes a JSON report without leaking installer or Codex internals into project policy.
- Change fan-out: 2 - one cross-cutting policy intentionally updates the CLI, architecture skills, workflow gates, templates, and documentation.
- Test isolation: 0 - the scorer runs against isolated temporary project fixtures without network or a real user repository.
- Final coupling score: 2/10
- Decision: pass

## Verification

- `npm run validate`: PASS, 40/40 tests
- `quick_validate.py`: PASS for every changed workflow/architecture skill
- `git diff --check`: PASS
- `npm pack --dry-run`: PASS, package `harness-hehehe@0.3.7`
- Lite forward test: PASS, score 4/10 maps to Lite pass
- Strict forward test: PASS, score 5/10 maps to Strict fail
- Global install: PASS, installed manifest and cache are `0.3.7`
- Installed scorer SHA-256 matches the source scorer
- `codex plugin list`: still displays `0.3.6` in the running Codex registry; installed source and cache are `0.3.7`, so restart/new thread is required to refresh the display.
