---
name: frontend-architecture
description: Design, implement, or review non-trivial web and hybrid-web frontend changes using Feature-Sliced Design as the default architecture, Tailwind CSS as the default styling system, explicit state and API boundaries, and the shared coupling gate. Use for frontend features, routes, components, state, API clients, UI refactors, or frontend architecture reviews.
---

# hehehe:frontend-architecture

Use Feature-Sliced Design (FSD) by default for new frontend applications and non-trivial new feature areas. Use Tailwind CSS by default for styling.

Explicit user requests override these defaults. In an established codebase, do not introduce a second architecture or styling system during a scoped change. Preserve the existing system and record the exception unless the user authorizes a migration.

## FSD Contract

Use only the layers the product needs:

```text
app -> pages -> widgets -> features -> entities -> shared
```

- `app`: providers, routing composition, global initialization, and global styles
- `pages`: route-level composition without reusable business logic
- `widgets`: substantial page sections composed from features and entities
- `features`: user actions and use cases
- `entities`: domain data, entity UI, model, and entity-scoped API
- `shared`: domain-neutral UI, utilities, configuration, and base API client

Imports point downward only. Slices on the same layer must not reach into each other's internals. Expose a deliberate public API for cross-slice use.

Framework routing directories may remain where the framework requires them. For example, a Next.js `app/` route should be a thin composition shell over FSD modules rather than duplicating the FSD application layer.

Do not create empty layers, one-file slices, or barrel files mechanically. Start with the smallest valid slice and split when a responsibility or public boundary is real.

## Frontend Boundaries

Prefer this flow:

```text
route/page composition
  -> widget or feature
    -> entity model/API
      -> shared API client
```

- Keep server state in the established query/cache library.
- Keep transient UI state local first; promote only genuinely shared state.
- Keep auth, transport, storage, and vendor SDK mechanics behind dedicated boundaries.
- Keep API types and functions near the owning feature/entity; do not grow a single cross-product `queries`, `services`, or `utils` module.
- Presentational UI must not own API authentication, persistence mechanics, or multi-step business orchestration.
- Model loading, error, empty, disabled, and retry states explicitly.

## Tailwind Policy

- Use Tailwind utilities and the existing token system by default.
- Put global resets, CSS variables, font declarations, and truly global primitives in global CSS.
- Reuse design tokens and established UI primitives before adding arbitrary values.
- Use a variant helper such as CVA only when a component has repeated, meaningful variants.
- Do not add CSS Modules, CSS-in-JS, Sass, or a second utility framework unless the user explicitly requests it or a required third-party integration cannot be isolated otherwise.
- A user-requested styling system takes precedence over Tailwind.

## Coupling Gate

Use `hehehe:architecture-metrics` for non-trivial frontend work. Select the Lite, Standard, or Strict project profile first, then apply its five dimensions and profile-specific thresholds to the changed FSD unit:

- responsibility overlap: rendering, state, validation, API, and orchestration mixed in one unit
- dependency direction: FSD layer or slice-public-API violations
- infrastructure leakage: transport, storage, auth, or vendor details inside presentation/domain code
- change fan-out: one feature change touching unrelated slices or shared core
- test isolation: feature behavior requiring the whole application or real external services

Also inspect changed modules above about 500 lines, functions/components above about 200 lines, or units coordinating more than three asynchronous/external interactions. These are review triggers, not automatic failures.

## Architecture Gate

Before implementation:

1. Read the existing frontend stack, routes, state, API, styling, and local `AGENTS.md`.
2. Identify the FSD layer and slice that own the behavior.
3. Record whether Tailwind is active or why an explicit override applies.
4. Record affected public APIs, state ownership, and verification in the implementation spec or active run's `done-criteria.md`.

Before completion:

1. Review actual imports and changed integration points.
2. Run `hehehe:architecture-metrics` and record its report in `checks.md`.
3. Run typecheck, lint, focused tests, production build, and browser validation as applicable.
4. Block new FSD boundary violations and parallel styling systems without authorization in every profile. Apply the selected profile's coupling thresholds and block its fail range unless the user explicitly accepts a concrete legacy constraint and follow-up risk.
