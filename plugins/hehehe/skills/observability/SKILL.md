---
name: observability
description: Apply or verify task-appropriate local observability without requiring a monitoring stack by default. Use for frontend console and network validation, backend structured errors and logs, request correlation, runtime failure evidence, performance investigation, or an explicitly requested Docker-based logs-metrics-traces stack.
---

# hehehe:observability

Use the smallest observation depth that can prove the changed behavior. Reuse the project's logger, middleware, test runner, browser tooling, and runtime output before adding dependencies.

Read [references/error-contract.md](references/error-contract.md) completely for backend, API, error-handling, logging, or request-correlation work.

## Modes

Infer the first explicit mode; use `auto` when none is given.

- `auto`: inspect existing facilities, apply the minimum contract to changed boundaries, run relevant verification, and record evidence.
- `init`: establish a project-native minimum contract and focused tests without replacing a working logger or error model.
- `check`: inspect the current implementation and report gaps without changing files.
- `verify`: execute the relevant browser, API, backend, and test scenarios and correlate their evidence.
- `status`: summarize the currently available observation surfaces and latest recorded result without changing files.
- `full`: only when explicitly requested, use an existing or project-scoped Docker observability stack for logs, metrics, and traces.

`check` and `status` are read-only. Do not install Grafana, Loki, Prometheus, Tempo, OpenTelemetry, a logging package, or a host service in `auto`, `check`, `verify`, or `status`.

## Select the Observation Depth

- Frontend-only behavior: inspect browser `pageerror`, new console errors and warnings, failed network requests, response status, and obvious latency.
- Backend or API behavior: also inspect structured application logs, stable error codes, safe client responses, and request correlation.
- Database, external API, queue, or asynchronous behavior: also inspect dependency failures, retries, timeouts, transaction outcomes, and latency at the responsible boundary.
- Performance or multi-service failure work: add measured timings and traces when they materially identify the slow or failing segment.

Do not add tracing, metrics, or a dashboard merely to satisfy a checklist.

## Automatic Workflow

1. Read the active run, changed code path, local instructions, and existing logging/error conventions.
2. Identify the user action, browser request, backend operation, and dependencies that need evidence.
3. Preserve one coherent project-native logging and error path. Extend existing middleware, interceptors, or adapters instead of creating a parallel system.
4. For backend or API work, apply the referenced error contract at the changed boundary.
5. Run focused success and failure scenarios. Include expected validation or business failure and unexpected internal failure when practical.
6. Correlate browser/API evidence with backend evidence using the same request identifier when the request crosses a backend boundary.
7. Record commands, scenarios, status codes, relevant timings, error codes, correlation result, and sanitized log evidence in the active run's `checks.md`.
8. Fix confirmed failures and rerun the smallest check that proves the correction.

## Completion Gate

Block completion for an affected workflow when any of these are confirmed:

- an uncaught browser or server exception
- a new unexplained `console.error`, failed request, or unexpected 5xx response
- an internal exception, stack trace, SQL text, secret, token, or personal data exposed to the client
- an unstable or missing machine-readable error code where clients must distinguish the failure
- structured backend error logs missing the operation, error code, or correlation identifier required to trace the tested request
- a changed performance path claimed as improved without before/after measurements

Treat third-party warnings, intentionally handled failures, and legacy gaps outside the changed path as recorded warnings unless they invalidate the requested behavior. Do not block solely because the project lacks a full observability stack.

## Full Mode

Use `full` only for an explicit request or a demonstrated performance, distributed-system, or intermittent-failure need.

1. Prefer an existing project Compose file or a reusable project-scoped Compose configuration.
2. Run Grafana, Loki, Prometheus, Tempo, and an OpenTelemetry Collector in containers; do not install them directly on the host.
3. Confirm ports, image pulls, persistent volumes, credentials, and lifecycle effects before changing external state.
4. Validate actual LogQL, PromQL, or trace queries against emitted project data.
5. Stop only containers started for this run. Preserve user-owned containers and volumes.

## Report

Report the selected mode and observation depth, facilities reused or added, scenarios verified, correlation evidence, blocking failures, warnings, and whether a full stack was intentionally skipped or used.
