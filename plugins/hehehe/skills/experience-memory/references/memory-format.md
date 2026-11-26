# Experience records and local retrieval

## Curated input

All fields below are required. `expires_at` is optional and defaults to 90 days; an explicit expiry must be a real UTC calendar instant strictly in the future and at most 90 days after capture. Accepted spelling is `YYYY-MM-DDTHH:mm:ssZ` or `YYYY-MM-DDTHH:mm:ss.sssZ`. The parser may add `.000` but never repairs an invalid day or time into another date. Offsets, surrounding whitespace and rollover such as November 31 or `24:00` are rejected.

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

Use paths that actually exist in the current repository; these are illustrative.

| Field | Limit |
| --- | --- |
| `title` | 160 UTF-16 code units |
| `problem`, `cause` | 800 each |
| `resolution` | 1200 |
| `outcome` | 400 |
| `tags` | at most 8, 40 code units each, unique after trimming |
| `source_paths` | 1 to 16 tracked regular files |

A supplementary character such as an emoji uses two code units. Unknown fields, control characters, common credential patterns, unsafe paths, linked or hard-linked files and untracked sources are rejected. Text must be well-formed Unicode. Rejected input leaves the run's existing note unchanged. The scanner cannot recognize every secret or sensitive fact in prose: selection and review remain necessary.

The searchable text (all prose fields and tags after NFKC normalization and lowercase) must fit 32,768 UTF-8 bytes. Some compatibility characters expand substantially, so input can exceed this while fitting the field limits; `record` then fails with `MEMORY_LIMIT_EXCEEDED` rather than truncating. Canonical JSON is bounded to 18,000 UTF-8 bytes and the note file to 20,000 bytes.

`record` captures repository identity, current HEAD, source fingerprints, record and expiry times and `untrusted-context` status. It atomically replaces this run's one curated note and never edits the run state, verification policy or approval metadata. CRLF-equivalent source uses the same text digest across checkouts; explicit Git binary attributes retain byte identity.

## Retrieval

There is no index, cache, database or background process. Each recall reads `.hehehe/runs/<run-id>/experience.json` from every registered worktree, validates each note, ranks the matches and re-checks the best candidates against the requesting checkout.

- **Matching**: note text and query share one tokenizer. Words are runs of letters, digits and combining marks after NFKC normalization and lowercase; Latin, Greek and Cyrillic accents are ignored, so `cafe` finds `café`. A note matches when any of its words starts with a query term.
- **Query terms**: common English function words and generic task-request words are dropped, then the first sixteen distinct terms are used. A query with no remaining terms returns empty context. Punctuation and emoji are separators, never operators.
- **Ranking**: by how often and how distinctively the terms occur, with the note location as a stable tie-break.
- **Freshness**: a candidate is returned only if its recorded commit is an ancestor of the requesting checkout and every cited source still matches its recorded digest.

This is keyword search. Translations, synonyms and inflected forms may need a narrower query or explicit tags.

## Bounds

| Bound | Value |
| --- | --- |
| Query length | 400 UTF-16 code units |
| Notes returned | 3 by default, at most 5 |
| Returned records budget | 6000 code units of serialized JSON |
| Candidates re-checked per recall | 50 |
| Eligible notes | 512 |
| Run entries scanned | 1024 |
| Registered worktrees | 64 |

Exceeding a collection bound reports `MEMORY_LIMIT_EXCEEDED` instead of silently ignoring notes. Retire old runs or worktrees to return under the bound.

Short results keep their complete shape. A result too large for the remaining budget uses a projection marked `context_compacted: true`, keeping its `id`, `title`, prose fields, tags, head, trust and exact `origin` reference. `source_count` gives the number of validated sources and `truncated_fields` lists any shortened prose. If even a projection does not fit, the note is counted as `omitted`.

## Trust and failures

Notes are editable files, not authenticated authority. Completed-run eligibility is not proof that a historical record is authentic, and no note can grant approval or verification success.

Failures return stable `MEMORY_*` codes. `record` and explicit retrieval report the failure; automatic run context reports `unavailable`. Existing verification and delivery remain authoritative in every case.

Keep original run notes if they should survive worktree retirement. There is no global cross-project recall, automatic conversation export, dependency installation or external upload.

A `hehehe-memory/experience.sqlite` file in the Git common directory is a leftover cache from versions that used SQLite. Nothing reads it now and it can be deleted.
