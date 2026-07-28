---
name: repository-knowledge
description: Initialize, synchronize, validate, or summarize a repository knowledge system built from a short AGENTS.md, indexed project documentation, architecture maps, durable decisions, runbooks, and deterministic freshness checks. Use when Codex should make a project easier to analyze or maintain, when code structure or operational knowledge changed, before handoff, or when the user invokes repository knowledge with auto, init, sync, check, or status intent.
---

# hehehe:repository-knowledge

Treat repository knowledge as a common maintenance baseline independent of the Lite, Standard, or Strict architecture profile.

Resolve `scripts/knowledge-system.mjs` relative to this `SKILL.md`. Read [references/knowledge-standard.md](references/knowledge-standard.md) before `init`, `sync`, or automatic write mode.

## Modes

Infer the mode from the first explicit mode word. When none is supplied, use `auto`.

- `auto`: initialize missing baseline, synchronize applicable knowledge, repair safe mechanical issues, record verified source fingerprints, then check again.
- `init`: create the minimum baseline and the first accurate project map.
- `sync`: update knowledge affected by current code, configuration, operational, or durable decision changes.
- `check`: read-only validation of baseline, links, index coverage, sources, and freshness.
- `status`: read-only concise health summary.

## Deterministic Commands

```text
node <script> inventory --project <root> --json
node <script> record --project <root> --doc <doc.md> --kind <kind> --source <path> [--source <path> ...]
node <script> check --project <root> --json
node <script> status --project <root>
```

`record` updates `.hehehe/knowledge.json`. Run it only after semantically verifying and, when needed, updating that document. Never refresh a fingerprint merely to silence a stale result.

## Automatic Workflow

1. Read all applicable existing `AGENTS.md` instructions and preserve them as authoritative.
2. Run `inventory`.
3. Inspect manifests, entry points, major source roots, tests, deployment configuration, database/migrations, existing documents, and current diff as applicable.
4. If the baseline is missing, perform `init`.
5. Perform `sync` against actual repository evidence.
6. Promote only durable project-wide decisions from `.hehehe/runs/`; do not copy transient logs or speculative plans.
7. Repair safe issues such as missing index links or an unambiguous renamed path. Do not invent missing product, security, deployment, or ownership facts.
8. Run `record` for every document actually reviewed, with narrow source paths that support its claims.
9. Run `check`. Fix confirmed errors and rerun until fresh, or report the precise unresolved ambiguity.

## Init

Create only this common baseline:

- root `AGENTS.md`, or a minimal `## Repository knowledge` navigation section when an existing file can be safely extended
- `docs/README.md`
- `docs/architecture/overview.md`
- `.hehehe/knowledge.json`, created through `record`

Do not overwrite or broadly rewrite an existing `AGENTS.md`. Do not create empty frontend, backend, data, decisions, security, or runbook documents. Add them only when the repository contains that concern and the document carries useful knowledge.

## Sync

Use the manifest's source paths and the actual diff to limit review. Update:

- architecture documents when responsibility, dependency, data, API, or deployment boundaries changed
- decision records when a durable choice and its rationale should constrain future work
- runbooks when a repeatable operational procedure changed
- the document index whenever knowledge documents are added, removed, renamed, or superseded

Preserve user prose and organization unless it is demonstrably stale. Prefer a focused correction over regeneration.

## Check and Status

`check` and `status` are read-only. `check` is a gate: missing baseline, broken local links, missing tracked documents, invalid sources, and changed source fingerprints are errors. Verification age, unindexed documents, and missing direct index links are warnings that require review but not invented content.

## Completion

Report:

- mode used
- documents created or updated
- durable decisions promoted
- final `FRESH`, `WARN`, or `STALE` result
- unresolved ambiguities and the exact document or source path involved

Do not claim freshness from timestamps alone; the deterministic source fingerprint and semantic review are both required.
