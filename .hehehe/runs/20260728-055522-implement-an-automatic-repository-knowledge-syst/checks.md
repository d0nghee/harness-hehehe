# Checks

## Repository Knowledge

- Initial status: STALE - `AGENTS.md`, `docs/README.md`, `docs/architecture/overview.md`, and manifest absent
- Final status: FRESH
- Tracked documents: 2
- Errors: 0
- Warnings: 0
- Durable decision promoted: common profile-independent baseline with default automatic execution

## Architecture Gate

- Project profile score: 2/10
- Project profile: Lite
- Coupling thresholds: pass 0-4 | improve 5-6 | fail 7-10
- Architecture unit: repository-knowledge skill and workflow integration
- Automated evidence: skill validation, deterministic fixture tests, forward tests, final knowledge check, installed hash parity
- Hard failures: none
- Responsibility overlap: 0 - Codex owns semantic knowledge while the script owns deterministic evidence and validation.
- Dependency direction: 0 - workflow skills invoke the independent knowledge skill without coupling it to architecture profile calculation.
- Infrastructure leakage: 0 - project documents and a local manifest do not expose Codex installer internals.
- Change fan-out: 2 - the new common baseline intentionally updates the catalog, core workflow, preflight, docs flow, templates, and user documentation.
- Test isolation: 0 - all deterministic checks run in isolated temporary repositories.
- Final coupling score: 2/10
- Decision: pass

## Verification

- `npm run validate`: PASS, 49/49 tests
- `quick_validate.py`: PASS for repository-knowledge and integrated skills
- `git diff --check`: PASS
- `npm pack --dry-run`: PASS, `harness-hehehe@0.3.8`
- Default auto forward test: FRESH, 0 errors, 0 warnings
- Existing-doc sync forward test: WARN only because authoritative AGENTS instructions prohibited adding the missing index link; existing prose and instructions were preserved
- Forward-test fixtures removed
- Global installation: source and cache manifests are `0.3.8`
- Source, installed plugin, and Codex cache knowledge-system script SHA-256 hashes match
- Running `codex plugin list` still displays `0.3.6`; installed source and `0.3.8` cache are correct, so a Codex restart/new thread is required to refresh loaded metadata
