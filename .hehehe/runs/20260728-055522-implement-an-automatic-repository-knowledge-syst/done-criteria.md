# Done Criteria

## Goal

Implement an automatic repository knowledge system skill with init sync check and status modes

## Expected Behavior

- `$hehehe:repository-knowledge` without a mode runs the complete automatic knowledge workflow.
- Explicit `init`, `sync`, `check`, and `status` modes remain available.
- The common baseline is independent of Lite, Standard, and Strict architecture profiles.
- Existing `AGENTS.md` instructions and user-authored documentation are preserved.
- The system creates only applicable knowledge documents and avoids empty mechanical files.
- A deterministic script inventories the repository, tracks source fingerprints, validates local links and indexed documents, and reports stale knowledge.
- `full-resolve` checks knowledge at intake, synchronizes structural knowledge at completion, and verifies freshness before handoff.

## In Scope

- New `repository-knowledge` skill, UI metadata, reference standard, and Node.js checker
- Knowledge manifest schema and deterministic tests
- Integration with `full-resolve`, `preflight`, `update-docs`, plugin catalog, templates, and user documentation
- Version bump, package validation, forward tests, and global plugin installation

## Out of Scope

- Rewriting existing user instructions or all historical documentation
- Generating empty architecture, decision, or runbook documents for absent concerns
- Replacing runtime observability or source-code architecture gates
- Modifying application repositories outside this hehehe source repository

## Verification

- Fixture tests for missing baseline, initialization records, broken links, stale fingerprints, unindexed documents, and status
- `quick_validate.py` for the new and integrated skills
- Full `npm run validate`, `git diff --check`, and package dry run
- Fresh forward tests for a new repository and an existing repository with custom documentation
- Installed plugin manifest and script hash verification

## Architecture

- Architecture profile (backend/frontend/cross-stack): plugin tooling
- Project profile mode (auto/fixed/user override): auto
- Project profile score and selected profile (Lite/Standard/Strict): existing report 2/10, Lite
- Coupling thresholds (pass/improve/fail): 0-4 / 5-6 / 7-10
- Responsibility boundaries: Codex owns semantic documentation; deterministic script owns inventory, fingerprints, links, and manifest checks
- Frontend FSD layer/slice and public APIs:
- Frontend styling (Tailwind or explicit override):
- Data-access choices: no database changes
- Final coupling score (non-trivial application work): 2/10, Lite pass
- Structural hard failures: none

## Repository Knowledge

- Initial freshness (FRESH/WARN/STALE): STALE - common baseline absent
- Knowledge documents affected: root AGENTS.md, docs/README.md, docs/architecture/overview.md, .hehehe/knowledge.json
- Durable decisions promoted: repository knowledge is a common profile-independent baseline; default invocation is automatic
- Final freshness: FRESH

## Risks

- Broad source paths may create noisy freshness failures; require narrow applicable paths and explain repository-wide fallback.
- Existing AGENTS instructions are authoritative; additions must be minimal and non-destructive.
- Automatically promoting run records can preserve transient details; promote only durable project-wide decisions.
