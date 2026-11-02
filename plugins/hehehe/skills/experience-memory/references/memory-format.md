# Experience records and local retrieval

## Curated input

All fields below are required. `expires_at` is optional and defaults to 90 days; an explicit UTC ISO expiry must be in the future and within 90 days.

```json
{
  "schema_version": 1,
  "title": "Keep completion evidence bound to the current source",
  "problem": "An earlier successful check was insufficient after the implementation changed.",
  "cause": "Historical results describe the earlier source rather than the new candidate.",
  "resolution": "Refresh the required checks for the same frozen candidate before completion.",
  "outcome": "The regression distinguishes a valid receipt from stale source evidence.",
  "tags": ["verification", "stale", "completion"],
  "source_paths": ["src/verification.mjs", "tests/verification.test.mjs"]
}
```

Use paths that actually exist in the current repository; these are illustrative. Keep title at most 160 characters; problem/cause at most 800 each; resolution 1200; outcome 400; at most eight tags of 40 characters and sixteen source files. Unknown fields, control characters, common credential patterns, unsafe paths, linked/hard-linked files and untracked sources are rejected. The scanner cannot determine every secret or sensitive fact in prose: selection and semantic review remain necessary.

`record` captures repository identity, current HEAD, source fingerprints, record/expiry times and `untrusted-context` status. It atomically replaces this run's one curated note and never edits the run state, verification policy or approval metadata. CRLF-equivalent source uses the same text digest across checkouts; explicit Git binary attributes retain byte identity.

## Source and index ownership

- Canonical note: `.hehehe/runs/<run-id>/experience.json` in its originating checkout.
- Search cache: `<git-common-dir>/hehehe-memory/experience.sqlite`.
- Retrieval: SQLite FTS5 keyword/prefix matching, relevance ranking, repository filtering, then current-source validation and bounded selection. This first version has no embeddings or remote semantic service.
- Common English function words and generic task-request words are excluded from the query. Matching still depends on vocabulary; translations, synonyms and Korean inflections may need a narrower query or explicit tags. A query containing only generic words returns empty context.
- Source removal, note edits, source mismatch, unmerged source commit, expiry or repository mismatch excludes a result. `sync` refreshes the derived cache from currently retained, completed-run notes; it does not repair or rewrite the notes themselves.

The SQLite cache is not authenticated authority. Recall rereads the canonical note and current sources instead of trusting a modified cached payload. Completed-run eligibility is not proof that an editable historical record is authentic. Neither notes nor cached records can grant approval or verification success.

The first version bounds queries to 400 characters/16 terms, internally checks up to 50 candidates, returns at most five notes/about 6000 characters, and limits synchronization to 512 notes/1 MiB of serialized input across at most 1024 run entries and 64 registered checkouts. Exceeding a collection bound reports a limit error rather than silently truncating a rebuilt cache. For an unusually long run goal, use a short explicit query.

Keep original run notes if they should survive worktree retirement. No automatic conversation export or run-retirement retention is performed. There is no global cross-project recall, scheduled daemon, automatic dependency installation or external upload.

## Runtime and failures

The Node adapter invokes an existing Python 3.10+ interpreter with isolated mode and standard-library sqlite3. Python must include FTS5. Windows tries `python`, then `py -3`; other systems try `python3`, then `python`. An operator can select an existing interpreter using the absolute executable path in `HEHEHE_MEMORY_PYTHON`.

Unavailable Python/FTS5, database corruption, incompatible schema, unsafe linked paths or a busy database return stable `MEMORY_*` errors. `record`/`sync`/explicit retrieval report failure; automatic run context reports `unavailable`. Existing verification and delivery remain authoritative in every case. Inspect the cause before changing the cache; no command silently replaces a foreign/corrupt database or steals a lock.

SQL is parameterized and cache refresh is transactional. Read-only `status`/`recall` do not create a database. Schema version 1 is created only for an empty owned database; incompatible future schemas require an explicit supported migration. No migration or rollback can alter canonical source notes or completion evidence.
