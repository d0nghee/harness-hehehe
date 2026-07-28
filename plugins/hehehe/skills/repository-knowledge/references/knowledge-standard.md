# Repository Knowledge Standard

## Baseline

Use one consistent baseline in every maintained repository:

```text
AGENTS.md
docs/
  README.md
  architecture/
    overview.md
.hehehe/
  knowledge.json
  runs/
```

- Keep `AGENTS.md` short. Preserve authoritative instructions and link to `docs/README.md`.
- Make `docs/README.md` the direct index for every tracked knowledge document.
- Make `docs/architecture/overview.md` an evidence-backed map, not a source-code inventory dump.
- Keep run artifacts as work history. Promote only durable facts into `docs/`.

## Architecture Overview

Include applicable, verified information:

- product or repository purpose
- runtime languages, frameworks, and deployables
- major source roots and their responsibilities
- dependency direction and important public boundaries
- request, state, event, or data flow
- database and migration ownership
- build, test, development, deployment, and operational entry points
- known constraints that materially affect future changes

Link to narrower documents instead of making the overview large.

## Optional Documents

Create only when useful:

```text
docs/architecture/frontend.md
docs/architecture/backend.md
docs/architecture/data.md
docs/architecture/security.md
docs/decisions/ADR-0001-*.md
docs/runbooks/deploy.md
docs/runbooks/database-migration.md
docs/ownership.md
```

Do not create placeholders for absent concerns.

## Knowledge Manifest

`.hehehe/knowledge.json` is machine-managed:

```json
{
  "schema_version": 1,
  "updated_at": "2026-01-01T00:00:00.000Z",
  "documents": [
    {
      "path": "docs/architecture/overview.md",
      "kind": "architecture",
      "source_paths": ["src", "package.json"],
      "last_verified": "2026-01-01T00:00:00.000Z",
      "source_fingerprint": "<sha256>"
    }
  ]
}
```

Use narrow `source_paths`. A source path is evidence that can make a document stale, not every file casually mentioned by the document. A repository-wide `.` source is allowed only when no narrower stable boundary exists.

## Durable Decision Promotion

Promote a run decision only when all are true:

- it affects future work beyond the completed task
- the selected option and rationale are settled
- rejected alternatives or consequences add future value
- the decision is supported by code, configuration, or explicit user direction

Do not promote temporary commands, debugging notes, uncertain ideas, test output, or routine implementation details.

## Safety

- Never replace existing `AGENTS.md` instructions with generated prose.
- Never record secrets, tokens, personal data, production credentials, or copied environment files.
- Never describe an unverified deployment, security, ownership, or rollback process as fact.
- Never mark a document verified without reading it against its sources.
- Treat generated and vendored directories as implementation artifacts, not knowledge sources.
