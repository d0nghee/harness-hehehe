# Experience records and local retrieval

## Curated input

All fields below are required. `expires_at` is optional and defaults to 90 days; an explicit expiry must be a real UTC calendar instant strictly in the future and at most 90 days after capture. Accepted spelling is `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ`, with a four-digit year, valid month/day/leap year, hours 00–23 and minutes/seconds 00–59. Optional milliseconds must have exactly three digits. The parser may add `.000` but never repairs an invalid day or time into another date. Offsets, surrounding whitespace and rollover such as November 31 or `24:00` are rejected.

The [complete input inventory and verification map](input-contracts.md) covers every public field, operation/CLI option, retained metadata field, SQLite request and optional runtime setting, including normal, invalid and boundary cases.

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

Use paths that actually exist in the current repository; these are illustrative. Keep title at most 160 UTF-16 code units; problem/cause at most 800 each; resolution 1200; outcome 400; at most eight tags of 40 code units and sixteen source files. A supplementary character such as an emoji uses two code units. Unknown fields, control characters, common credential patterns, unsafe paths, linked/hard-linked files and untracked sources are rejected. Prose, tags and source paths must contain well-formed Unicode: unpaired UTF-16 surrogates are rejected before writing, while valid emoji and international text are preserved. Tags must be a dense array of nonempty strings, trimmed with CRLF converted to LF before checking uniqueness; tags that become duplicates are rejected. Rejected input leaves the run's existing note unchanged. The scanner cannot determine every secret or sensitive fact in prose: selection and semantic review remain necessary.

The shared text contract also measures the complete derived search text after NFKC normalization and lowercase: it must fit 32,768 UTF-8 bytes. Some compatibility characters expand substantially, so input can exceed this budget while still fitting the individual field limits. `record` rejects that input with `MEMORY_LIMIT_EXCEEDED` before publishing any note; it does not truncate searchable content. The same check excludes a retained over-budget note individually during synchronization and recall. Compact canonical JSON is bounded to 18,000 UTF-8 bytes and the readable note file to 20,000 bytes, matching the reader. Recording still works without the optional Python runtime.

`record` captures repository identity, current HEAD, source fingerprints, record/expiry times and `untrusted-context` status. It atomically replaces this run's one curated note and never edits the run state, verification policy or approval metadata. CRLF-equivalent source uses the same text digest across checkouts; explicit Git binary attributes retain byte identity.

## Source and index ownership

- Canonical note: `.hehehe/runs/<run-id>/experience.json` in its originating checkout.
- Search cache: `<git-common-dir>/hehehe-memory/experience.sqlite`.
- Retrieval: SQLite FTS5 keyword/prefix matching, relevance ranking, repository filtering, then current-source validation and bounded selection. This first version has no embeddings or remote semantic service.
- Common English function words and generic task-request words are excluded after actual keyword tokenization. Matching still depends on vocabulary; translations, synonyms and Korean inflections may need a narrower query or explicit tags. A query containing only generic words returns empty context.
- Derived index text and queries use the same Node NFKC normalization and lowercase function. The query stays intact until an isolated in-memory SQLite FTS5 table and `fts5vocab` extract the same `unicode61` tokens as the persisted index. There is no second JavaScript or Python word regex; combining-mark words and one-character tokens emitted for some scripts follow SQLite's actual boundaries. The first sixteen distinct non-stopword tokens become safely quoted prefix-OR terms in source order. Punctuation/emoji-only text can have no keyword tokens and return empty context; this is keyword search, not arbitrary substring matching.
- Canonical note prose, digests and IDs retain their original text. The existing normalized plaintext index, schema version and ranking frequencies are unchanged, so ordinary caches need no migration for the query fix. Run `sync` once to refresh a cache built before the earlier NFKC normalization change; `resume init` and `context` already synchronize automatically.
- Source removal, note edits, source mismatch, unmerged source commit, expiry or repository mismatch excludes a result. `sync` refreshes the derived cache from currently retained, completed-run notes; it does not repair or rewrite the notes themselves. Invalid retained notes, including malformed Unicode, duplicate normalized tags or oversized derived index text, are counted as skipped and cannot disable indexing of valid notes.

The SQLite cache is not authenticated authority. Recall rereads the canonical note and current sources instead of trusting a modified cached payload. Completed-run eligibility is not proof that an editable historical record is authentic. Neither notes nor cached records can grant approval or verification success.

The first version bounds the original query to 400 UTF-16 code units/16 actual keyword terms, internally checks up to 50 candidates, returns at most five notes with a serialized records-array budget of 6000 code units, and limits synchronization to 512 notes/1 MiB of serialized input across at most 1024 run entries and 64 registered checkouts. Exceeding a collection bound reports a limit error rather than silently truncating a rebuilt cache. For an unusually long run goal, use a short explicit query. Query tokenization uses only an in-memory database and does not create or modify the persistent cache during read-only retrieval.

Direct API recall/context options must be plain or null-prototype objects containing only `limit` or `sync`, respectively. Omission uses the existing defaults of three records and synchronization enabled. Invalid option containers, keys, values or queries fail before context synchronization, so a rejected call cannot create or refresh the cache. Internal bridge database/repository/record identity strings must be well-formed Unicode before any database initialization. Errors remain sanitized and memory remains advisory.

Short results keep the complete existing shape. A result too large for the remaining context uses a projection marked `context_compacted: true`, retaining its `id`, `title`, problem/cause/resolution/outcome, tags, head, trust and exact `origin` reference. `source_count` gives the number of fully validated sources; the source list and other canonical-only metadata remain in the original note. `truncated_fields` explicitly lists any shortened prose. Projection happens only after full source/expiry validation, never changes the canonical note and must not be treated as that note's signed or complete representation. If the remaining context cannot hold a useful projection and origin reference, it is counted as omitted.

Keep original run notes if they should survive worktree retirement. No automatic conversation export or run-retirement retention is performed. There is no global cross-project recall, scheduled daemon, automatic dependency installation or external upload.

## Runtime and failures

The Node adapter invokes an existing Python 3.10+ interpreter with isolated mode and standard-library sqlite3. Python must include FTS5. Windows tries `python`, then `py -3`; other systems try `python3`, then `python`. An operator can select an existing interpreter using the absolute executable path in `HEHEHE_MEMORY_PYTHON`.

Unavailable Python/FTS5, database corruption, incompatible schema, unsafe linked paths or a busy database return stable `MEMORY_*` errors. `record`/`sync`/explicit retrieval report failure; automatic run context reports `unavailable`. Existing verification and delivery remain authoritative in every case. Inspect the cause before changing the cache; no command silently replaces a foreign/corrupt database or steals a lock.

SQL is parameterized and cache refresh is transactional. Read-only `status`/`recall` do not create a database. The first schema is committed in a private sibling database, synced, then published using an atomic rename that refuses an existing destination. Windows uses `os.rename`; Linux needs `renameat2(RENAME_NOREPLACE)` and macOS needs `renamex_np(RENAME_EXCL)`. Missing platform support fails safely with `MEMORY_STORE_ERROR`; it never falls back to overwriting or hardlinking a database. No third-party package is installed.

Interruption before publication can leave a uniquely named private `.experience.sqlite.init-*.tmp` file or SQLite sidecar, but no partial canonical DB; the next sync creates a new private candidate. Interruption after publication leaves a complete valid schema, and a later sync can rebuild its records. Unknown remnants are not automatically deleted. Existing empty, corrupt or foreign databases still require operator inspection, including files left by an older implementation; this change never adopts or overwrites them. Schema version 1 remains unchanged; incompatible future schemas require an explicit supported migration. No migration or rollback can alter canonical source notes or completion evidence.
