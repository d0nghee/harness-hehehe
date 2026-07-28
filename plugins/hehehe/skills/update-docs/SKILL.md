---
name: update-docs
description: Synchronize relevant documentation with completed code changes.
---

# hehehe:update-docs

Use after implementation when docs, examples, API references, or runbooks are now stale.

Update only relevant docs. Prefer concise, accurate changes over broad rewrites. If generated `.hehehe/*` files are internal pipeline state, do not treat them as user-facing docs unless requested.

When code structure, responsibility boundaries, durable decisions, deployment, database operations, or ownership changed, use `hehehe:repository-knowledge` in `sync` mode after updating ordinary docs, then run its read-only `check`. Do not refresh fingerprints without semantic verification.
