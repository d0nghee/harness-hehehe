---
name: backend-architecture
description: Design, implement, or review non-trivial backend changes with explicit responsibility boundaries, profile-aware coupling thresholds, and a pragmatic ORM-plus-SQL data-access policy. Use for backend feature work, APIs, services, repositories, migrations, or architecture reviews.
---

# hehehe:backend-architecture

Use this skill for non-trivial backend work. Skip it for documentation-only, configuration-only, generated-code-only, or obvious one-line changes.

## Architecture Contract

Prefer this dependency direction, adapting names to the framework already in the repository:

```text
Transport (router/controller)
  -> Application (use case/service)
    -> Domain policy
    -> Repository or external gateway interface
      -> Persistence/integration implementation

Complex reads:
Transport -> Query service/read model -> Database
```

Keep each boundary narrow:

- Transport parses and validates input, applies request-level auth, invokes one application entry point, and maps the response.
- Application code owns use-case orchestration and transaction boundaries.
- Domain policies own business decisions that can be expressed without framework or database details.
- Repositories and gateways hide persistence or external-service mechanics.
- Query services own complex read models, joins, projections, and aggregates.
- DTOs or schemas define boundary data; persistence models must not leak through public APIs by accident.

Depend inward. Domain and application code must not import routers, framework request objects, ORM sessions, or concrete infrastructure. Inject volatile dependencies at composition boundaries.

Do not create layers mechanically. Keep a simple function when it has one stable responsibility. Add an interface, base class, generic repository, or new class only when it protects a real boundary, enables a required substitute, or removes demonstrated duplication.

## Data-Access Policy

Use the least surprising tool for each access pattern:

- Commands and state changes: prefer the project's ORM, with an explicit transaction boundary.
- Ordinary entity reads: use the ORM when it remains clear and efficient.
- Complex joins, aggregates, reporting, bulk reads, or performance-critical projections: use the ORM's query/core API or bound raw SQL.
- Raw SQL must be parameterized, kept in a repository or query-service boundary, mapped to an explicit result type, and covered by focused tests.
- Never build SQL by concatenating user-controlled values.
- Keep schema changes in an explicit migration and document deployment order, compatibility, and rollback risk.
- Do not access the database directly from routers/controllers or domain policies.

When the project has no ORM, do not introduce one solely to satisfy this policy. Preserve the established data layer and record the exception.

- For a new TypeScript or Python backend with relational state, default to an ORM for writes while keeping an escape hatch for complex reads.
- For Go, follow the established data layer; `database/sql`, `pgx`, and generated SQL such as `sqlc` are first-class choices and do not require adding an ORM.

## Error and Observability Contract

Use `hehehe:observability` for backend or API paths affected by the change.

- Keep domain and application failures independent of HTTP and logger details.
- Map failures once at the transport boundary to an appropriate status, stable machine-readable error code, and safe client message.
- Preserve the protected internal cause in one structured server log with the operation and request correlation identifier.
- Reuse the existing logger and middleware; do not add an observability stack or parallel error hierarchy mechanically.
- Never expose raw exceptions, stack traces, SQL, secrets, tokens, or personal data to clients.
- Propagate a validated or generated request identifier when browser/API evidence must correlate with backend logs.

## Coupling Score

Use `hehehe:architecture-metrics` as the single profile and scoring source. Select the Lite, Standard, or Strict project profile first, then apply its five dimensions and profile-specific thresholds to the changed backend unit:

- responsibility overlap: transport, business, persistence, and integration roles mixed together
- dependency direction: reverse-layer imports, cycles, hidden globals, or concrete cross-layer dependencies
- infrastructure leakage: framework, ORM session, database, or vendor SDK details outside adapters
- change fan-out: one behavior change requiring unrelated modules or shared core changes
- test isolation: business behavior requiring the full HTTP, database, or external-service stack

## Hotspot Triggers

Inspect a changed unit more closely when any of these are true:

- a backend module exceeds about 500 lines
- a function or class exceeds about 200 lines
- one unit coordinates more than three asynchronous or external interactions
- a change introduces a new circular import, broad shared utility, or cross-feature dependency

These are review triggers, not automatic failures. Split only when the unit has more than one reason to change or when a boundary improves testing, ownership, or change locality.

## Architecture Gate

Before implementation:

1. Read the existing backend structure and local `AGENTS.md`.
2. Identify the transport, application, domain, persistence, and query responsibilities affected.
3. Choose ORM, query/core API, or bound SQL for each data path.
4. Add a concise architecture note to the active run's `done-criteria.md` or implementation spec.

Before completion:

1. Review the actual diff, including untouched integration points.
2. Run `hehehe:architecture-metrics` and record its report in `checks.md`.
3. Verify transaction, migration, parameterization, and the `hehehe:observability` error boundary where relevant.
4. Run focused tests plus the repository's strongest practical checks.
5. Apply the selected profile's pass, improve, and fail ranges. Resolve structural hard failures in every profile and block scores in that profile's fail range unless the user explicitly accepts a concrete legacy constraint and follow-up risk.
