# Done Criteria

## Goal

Apply a zero-install-by-default observability contract to hehehe, including structured backend errors and request correlation.

## Expected Behavior

- `$hehehe:observability` supports automatic, init, check, verify, status, and explicit full modes.
- The default path reuses browser, application, and test output without installing an observability stack.
- Backend/API changes use stable error codes, structured logs, safe client responses, and request correlation where applicable.
- Sensitive values and raw internal failures are not exposed to clients or logs.
- Full Grafana/OpenTelemetry infrastructure is opt-in and containerized.
- Full-resolve, backend architecture, review, resolve, preflight, and templates consistently invoke or record the contract.

## In Scope

- New observability skill and structured-error reference
- Workflow and review integration
- Skill catalog, plugin metadata, package version, user documentation, and tests
- Global plugin installation after validation

## Out of Scope

- Installing Grafana, Loki, Prometheus, Tempo, or OpenTelemetry into this repository
- Adding application-specific logging libraries
- Enforcing one logger, framework, or error class across all target languages

## Verification

- Skill quick validation
- `npm run validate`
- `git diff --check`
- `npm pack --dry-run`
- Global installation and installed-file/version comparison

## Repository Knowledge

- Initial freshness: FRESH
- Knowledge documents affected: `docs/architecture/overview.md`
- Durable decisions promoted: zero-install observability baseline and explicit full-stack opt-in
- Final freshness: pending

## Architecture

- Architecture gate: skipped; this is a plugin workflow/standards change, not application code
- Structural hard failures: none expected

## Risks

- Static text rules cannot prove runtime behavior; verification must inspect actual scenarios and outputs.
- Framework-specific implementations remain project-local and must preserve existing conventions.
