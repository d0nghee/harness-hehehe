# Done Criteria

## Goal

Remove redundant browser-tool-test skill and consolidate browser validation

## Expected Behavior

- `browser-tool-test` is absent from the bundled skills, catalog, and user documentation.
- `browser-validate` is the single public browser-testing skill for direct invocation and pipeline validation.
- Direct browser operation, server startup, real interactions, responsive checks, screenshots, console/network evidence, and active-run reporting remain covered.
- Package and plugin versions are synchronized at `0.3.13`.

## In Scope

- Remove the redundant skill directory and public references.
- Consolidate its unique operational guidance into `browser-validate`.
- Add regression coverage, synchronize repository knowledge, validate packaging, and update the installed plugin.

## Out of Scope

- Changes to the in-app browser plugin itself.
- Browser validation of this repository, which has no browser-facing application.
- Unrelated cleanup or refactoring.

## Verification

- Search for stale `browser-tool-test` references.
- Run the focused browser-skill test and full `npm run validate`.
- Run `git diff --check`, package dry-run, and repository-knowledge check.
- Verify the installed plugin no longer contains the removed skill.

## Workspace Isolation

- Decision (current/reuse/create): reuse current cumulative hehehe worktree
- Task identity and branch: Remove redundant browser-tool-test skill / `agent/subagent-resolve`
- Worktree path: `C:\Users\user\Desktop\hehehe`
- Base ref and commit: `HEAD` / `c8312a475eab786f5a2447223711cfa8be9cf17a`
- Source dirty paths excluded: none; existing dirty paths are the directly related unreleased hehehe enhancement set
- Runtime workspace ID and port: not required; no runtime application
- Log directory / Compose project / development database: not required
- Retirement status: preserved unless explicitly requested

## Repository Knowledge

- Initial freshness (FRESH/WARN/STALE): STALE after the intentional catalog, browser skill, tests, manifest, and user-documentation changes
- Knowledge documents affected: `docs/architecture/overview.md`, `docs/README.md`
- Durable decisions promoted: `browser-validate` is the single browser-testing and validation boundary
- Final freshness: FRESH, 0 errors, 0 warnings

## Architecture

- Architecture profile (backend/frontend/cross-stack): plugin workflow cleanup
- Project profile mode (auto/fixed/user override): auto
- Project profile score and selected profile (Lite/Standard/Strict): 2/10, Lite
- Coupling thresholds (pass/improve/fail): 0-4 / 5-6 / 7-10
- Responsibility boundaries: `browser-validate` owns all browser-operation and validation guidance
- Frontend FSD layer/slice and public APIs:
- Frontend styling (Tailwind or explicit override):
- Data-access choices:
- Final coupling score (non-trivial application work): not applicable; one duplicated public boundary is removed
- Structural hard failures: none

## Observability

- Mode and depth (auto/check/verify/full): check, skill contract only
- Browser console/network evidence:
- Structured backend error codes and safe response shape:
- Request correlation:
- Runtime and test evidence: focused browser-skill tests 5/5; repository validation 68/68
- Sensitive-data exposure check: not applicable; no runtime data path changed
- Full Docker stack: not required / explicitly used

## Risks

- Existing callers of `$hehehe:browser-tool-test` must use `$hehehe:browser-validate`.
- Rollback is restoring the removed skill and catalog/documentation entries; no user data or runtime state is migrated.
