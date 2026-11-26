# Memory input contracts and verification map

This inventory covers every input boundary of the optional memory feature: curated record input, public operation arguments, CLI syntax and input files, retained canonical notes, cache payloads, the internal SQLite bridge and runtime selection. Git/OS outputs and verification receipts are independently checked dependencies, not extra memory command options. The tables describe actual acceptance rules; they are not completion or approval evidence.

Lengths use JavaScript UTF-16 code units at the public Node boundary unless another unit is stated. Byte limits use UTF-8 after the specified serialization/normalization. SQLite bridge identity lengths use Python Unicode code points. Normal keyword search follows the actual SQLite `unicode61` tokenizer, not arbitrary substring matching.

## Test locators

These are repository-relative source test files; tests are not part of an installed plugin payload. Named cases in each file identify the checks below.

| Key | Source test file and principal cases |
| --- | --- |
| Public | `tests/experience-memory-public-inputs.test.mjs`: record keys; source arrays/files; query/limit/context options; project/current run; CLI grammar; input-file format/size |
| Expiry | `tests/experience-memory-expiry-contract.test.mjs`: Gregorian calendar/time syntax; default/future/90-day edges; CLI preservation; retained calendar/expiry/clock-skew eligibility |
| Text | `tests/experience-memory-text-contract-boundaries.test.mjs`: field/tag types and limits; all lone-surrogate values; sampled scalar/JSON round trips; normalized bytes and canonical bytes; secret checks |
| Flow | `tests/experience-memory-text-contract.test.mjs`: every searchable field; exact normalized byte budget; early rejection; retained oversized-note exclusion; query size and source staleness |
| Unicode | `tests/experience-memory-input-validation.test.mjs`: safe Unicode paths; malformed prose/tags; normalized duplicates; source-valid malformed historical notes |
| Canonical | `tests/experience-memory-canonical-inputs.test.mjs`: all sixteen retained keys missing/null/wrong type; derived/source metadata shapes; cached envelope and origin fields; run eligibility; exact pointer/state/note-file bytes |
| Collection | `tests/experience-memory-collection-inputs.test.mjs`: 512/513 eligible notes, 1,024/1,025 scanned entries and 64/65 real registered worktrees; rejected refresh preserves the prior cache |
| Source | `tests/experience-memory.test.mjs`: cross-process/worktree/repository isolation; changed/missing/tampered sources; expiry/ancestry; inert approval-looking text; missing-store reads |
| Recall | `tests/experience-memory-recall-regressions.test.mjs`: full/compact records; source checks; Unicode normalization; escaped prose; serialized array budget and record limit |
| Bridge | `tests/experience-memory-store-inputs.test.mjs`: identity/path Unicode preflight; operation/path/repository/limit types; strict row and collection bounds; exact text/payload/request bytes; query/ignored-token bounds; configured runtime |
| Store | `tests/experience-memory-store.test.mjs`: scoped replacement; SQL safety; prefix/ranking/result limits; invalid replacement preservation; reader/writer rollback; foreign/corrupt/linked DBs; optional runtime and malformed requests |
| Tokens | `tests/experience-memory-tokenizer.test.mjs`: native multilingual boundaries; first sixteen distinct non-stopword terms; long words/prefixes; malformed query inputs; fileless/read-only queries |
| Atomic | `tests/experience-memory-atomic-init.test.mjs`: interrupted initialization, concurrent publishers and pre-existing destination preservation |
| Gates | `tests/experience-memory-gates.test.mjs`: missing/failed/stale/expired verification remains blocked; unavailable SQLite remains advisory; forged cached data cannot authorize completion |

## Curated record object: all nine keys

`recordExperience` requires an object and rejects unknown own keys. The eight required keys below must be present; only `expires_at` is optional. A rejected replacement preserves the existing canonical note and does not create an index.

| Input | Normal and exact boundary | Invalid or outside boundary | Validation owner / checks |
| --- | --- | --- | --- |
| `schema_version` | Number `1` | Missing, null, boolean/string, other number | `experience.mjs`, `memoryFields`; Public, Text |
| `title` | Nonempty string, at most 160 units | Missing/wrong type, blank, 161 units, forbidden text | `text-contract.mjs`; Text, Public, Flow |
| `problem` | Nonempty string, at most 800 units | Same classes; 801 units | Text, Public, Flow |
| `cause` | Nonempty string, at most 800 units | Same classes; 801 units | Text, Public, Flow |
| `resolution` | Nonempty string, at most 1200 units | Same classes; 1201 units | Text, Public, Flow |
| `outcome` | Nonempty string, at most 400 units | Same classes; 401 units | Text, Public, Flow |
| `tags` | Dense array of 0–8 nonempty strings, each at most 40 units; trim/CRLF normalization before uniqueness | Wrong container, null/nonstring/hole, ninth tag, 41 units, duplicates after normalization; output must still fit eight tags | `memoryFields`; Text, Unicode, Public |
| `source_paths` | Array of 1–16 distinct safe tracked regular-file paths; sorted for source identity | Missing/wrong type, empty/17 entries, duplicate/hole, unsafe/untracked/nonregular/linked source | `validateSourcePaths` / `sourceEvidence`; Public, Unicode, Source |
| `expires_at` | Omitted or `undefined` defaults to 90 days; explicit real UTC instant strictly after now and at most 90 days from capture | Null/wrong type, nonexistent date, unsupported spelling/time, now/past, more than 90 days | Shared UTC calendar validator and service TTL; Expiry, Public |

All prose and tags preserve valid international text and complete surrogate pairs. Raw field limits are checked before trimming; trimming and CRLF→LF are the only canonical prose transformations. Forbidden controls/direction characters, unpaired surrogates and recognized credential patterns are rejected. Automated secret screening supplements manual selection; it cannot identify every sensitive fact.

The complete derived search text uses shared NFKC plus lowercase and must fit **32,768 bytes**; 32,767/32,768 pass and 32,769 fails before publication. Compact canonical JSON must fit **18,000 bytes** and readable note JSON **20,000 bytes**, also checked when reading retained notes. Text/Flow cover both sides of these bounds; no hidden truncation makes an oversized record appear accepted.

### Path and source content sub-contract

| Input | Accepted boundary | Rejected classes / checks |
| --- | --- | --- |
| Each relative source path | 1–400 units; normal Unicode and supplementary pairs, including U+2028/U+2029 within a filename; `/`-separated components | 401 units; backslash, colon, NUL/control, lone surrogate, absolute/traversal/empty component, trailing dot/space, Windows reserved name; Public, Unicode |
| Sensitive path components | Ordinary source directories/files | `.git`, `.hehehe`, `.env` variants, `id_rsa`, `id_ed25519`; Public, Source |
| Source filesystem/index identity | Tracked stage-0 regular `100644`/`100755` file, private regular parents/leaf | Untracked/conflicted/submodule/symlink/hardlink/directory/missing source; Public, Source |
| Source content | Up to **4 MiB** per source file; valid UTF-8 text normalizes CRLF unless Git declares binary | One byte beyond bound or file changing during a read; Public, Source; binary/NUL/invalid-UTF8 source bytes keep byte identity |

OS filename/path restrictions can impose a smaller practical limit than the syntax allowance. Captured SHA-256 evidence is rechecked before publication and at recall; accepting a source path is not a promise that stale contents will be recalled.

## Public operation arguments and CLI

| Input | Normal/default/boundary | Invalid / expected effect | Checks |
| --- | --- | --- | --- |
| `project` | Existing safe Git top-level directory, including registered worktrees | Missing/file/subdirectory/non-Git/linked/invalid type cannot publish or borrow another repository's context | Public, Source |
| Recall `query` | Nonblank well-formed string, raw maximum **400 units**, normalized by the same search function | Missing/null/wrong type/blank/control/unpaired surrogate/401 units fail before a write; punctuation-only or filtered-only terms can return ordinary empty context | Public, Text, Flow, Tokens |
| Recall options container | Omitted/`undefined` or plain/null-prototype object with only `limit` | Null/scalar/array/boxed/built-in/custom-prototype object or unknown key is invalid | Public |
| Recall `limit` | Default 3; integers **1–5** | 0, 6, negative, fractional, boolean/string/null invalid; no mutation | Public, Recall |
| Context options container | Omitted/`undefined` or plain/null-prototype object with only `sync` | Null/scalar/array/boxed/built-in/custom-prototype object or unknown key is invalid | Public |
| Context `sync` | Default `true`; explicit boolean `true`/`false` | Other types invalid; invalid query/options fail before synchronization | Public, Source |
| `sync` / `status` | Valid project; no other public parameter | `sync` may rebuild the derived index; `status` does not create a missing store | Public, Source, Store |

The CLI has exactly five commands: `record`, `sync`, `recall`, `context`, `status`. The exported `main(argv)` accepts only an array of strings; invalid containers, nonstring elements and holes receive the same structured invalid-input error as malformed CLI syntax. Its five flags are command-specific:

| Command | Allowed flags and required values |
| --- | --- |
| `record` | `--project`, required `--input`, `--json` |
| `sync` | `--project`, `--json` |
| `recall` | `--project`, required `--query`, optional `--limit`, `--json` |
| `context` | `--project`, required `--query`, `--json` |
| `status` | `--project`, `--json` |

`--project` defaults to the current directory and repeated occurrences use the last supplied value. Repeated `--json` is idempotent. Repeated `--input`/`--query`/`--limit`, unknown commands/flags, flags on the wrong command, missing values and extra positional arguments fail with a sanitized structured error. CLI `--limit` accepts digits only and then applies the public 1–5 bound. `--json` changes formatting, never authority. Public tests exercise the grammar and output channels.

`--input` resolves to a private regular file containing valid UTF-8 JSON, at most **20,000 bytes**. Invalid UTF-8, malformed JSON/BOM, non-object record values, linked/nonregular/missing or oversized files fail before note replacement. Public tests cover format, type, exact size and filesystem failures; Text covers the parsed record's independent normalized/canonical budgets.

## Retained canonical notes and cached envelopes

Retained notes have exactly sixteen permitted keys. The public `schema_version`, five prose fields, `tags` and `expires_at` retain all rules above. The eight derived fields below are evidence inputs at reading time, not caller-supplied approval:

| Derived input | Acceptance and rejection rule | Checks |
| --- | --- | --- |
| `id` | Exact deterministic `experience-` identity of the other canonical fields; missing/edited/wrong type fails | Canonical, Source, Unicode, Flow |
| `repo_id` | Exact current Git-common repository identity; foreign/missing fails | Canonical, Source |
| `run_id` | Equals the containing run directory and valid run identity | Canonical, Public, Source |
| `recorded_at` | Real accepted UTC spelling; expiry later than capture and interval at most 90 days; at most **60 seconds** ahead of now | Expiry |
| `head` | String with 40–64 lowercase hex characters; actual source commit must be an ancestor of requesting HEAD at recall | Canonical, Source |
| `sources` | 1–16 safe distinct paths in canonical sorted order, each object containing only `path` and `sha256`; SHA-256 is a string of exactly 64 lowercase hex characters | Canonical, Unicode, Public, Source |
| `source_fingerprint` | String matching the exact SHA-256 of the canonical `sources` array | Canonical, Source, Unicode |
| `trust` | Exactly `untrusted-context` | Canonical, Source, Gates |

All sixteen keys are necessary for a usable canonical note; unknown keys, mismatched normalized content, invalid identity/fingerprint or failed size checks exclude it individually. An index can contain a structurally valid note whose current source later becomes stale; source existence/content, expiry and commit ancestry are checked again before returning it.

Cache entries contain only `note`, `origin`, `digest`. `origin` contains only `root` and `path`: the root must be a registered checkout of the same repository, the path must name the exact run's `experience.json`, and the complete reread note/origin/digest must equal the cached envelope. Edited cache data is omitted rather than becoming evidence (Canonical, Source, Gates, Recall).

The current-run pointer uses schema 1 and an `active_run` string `runs/<run-id>/state.json`; nonstring values are rejected without coercion. Run IDs are 3–80 lower-case alphanumeric/hyphen characters with an alphanumeric first character. Run state uses matching schema/ID. Recording permits active or complete runs; synchronization/recall require complete runs. Pointer input is limited to 4,096 bytes and state input to 65,536 bytes. Canonical tests exercise exact valid JSON at each limit and one byte beyond, plus retained note files at 20,000/20,001 bytes. Canonical/Public/Source cover missing, malformed and ineligible state; no memory command marks a run complete.

## Internal SQLite bridge

These fields belong to the Node/Python adapter, not the public record schema. Application-generated identities are hashes. Bridge IDs nevertheless reject invalid types, NUL and malformed Unicode **before any path initialization**. Top-level operation-irrelevant extension fields are ignored; each record row has an exact key set, while `payload` is intentionally opaque JSON.

Bridge numbers use the finite JavaScript `Number` range at both input and output, including direct worker JSON. Non-finite values and literals whose decoding would overflow are rejected before initialization; incompatible numeric payloads already in a cache are reported as corrupt without rewriting it. Use strings for integers that need exact arbitrary-precision identity.

| Input | Accepted boundary | Rejected / checks |
| --- | --- | --- |
| `operation` | `probe`, `status`, `search`, `sync` | Other/missing/wrong type or non-object request; Bridge, Store |
| `database` | Non-probe operation: absolute regular private database path; Node maximum 4,096 units, worker maximum 4,096 code points | Relative/invalid type/NUL/lone surrogate/overlong; directory, links, unsafe parent/sidecar; OS path limits also apply; Bridge, Store, Atomic |
| `repoId` | Nonempty Unicode string, maximum **200 code points** | Missing/wrong type/empty/NUL/lone surrogate/201 code points; Bridge |
| `limit` | Integer **1–50**, default 3 | Boolean, wrong type, fractional, 0/51; Bridge, Store |
| `records` | `sync`: list of **0–512** rows | Missing/wrong type/513 rows; Bridge |
| Row `id` | Nonempty distinct string, maximum **200 code points** | Wrong type/empty/NUL/lone surrogate/duplicate/201 code points; Bridge, Store |
| Row `text` | String containing no NUL, maximum **32,768 UTF-8 bytes**; empty string is allowed internally | Wrong type/malformed Unicode/32,769 bytes; Bridge, Store |
| Row `payload` | Any finite JSON value with serialized UTF-8 at most **65,536 bytes** | Missing field, non-finite numbers (also nested), malformed/oversized serialized data; extra row keys are rejected, payload keys are not restricted; Bridge, Store |
| Search `terms` | String or list of strings; absent/empty may mean no terms; joined source at most **32,768 UTF-8 bytes** | Wrong container/element, NUL/lone surrogate/32,769 bytes; Bridge, Tokens |
| Search `ignored_terms` | List of **0–256** nonempty strings, each at most **128 code points** | Wrong container/element, empty value/NUL/lone surrogate/257 terms/129 code points; Bridge, Tokens |
| Serialized request | At most **1 MiB**, finite numeric JSON values | One byte beyond, non-finite numbers that JSON would silently replace with null, cyclic input or malformed direct-worker JSON; Bridge, Store |
| Worker response | Bounded to **1 MiB**; adapter checks JSON status/engine and maps recognized error codes, service separately checks source-backed record envelopes | Malformed JSON, spawn/nonzero/overflow, unexpected status/engine are failed runtime attempts; cached note/origin/digest must still validate; Store, Canonical, Gates |

Native query words are filtered after tokenization, deduplicated in source order and capped at **16** (Tokens). SQL query text and repository values remain parameters. The real database uses read-only mode plus `query_only` for search/status; temporary query tokenization is in memory. Invalid replacements preserve prior rows, and malformed identities cannot create even a parent directory (Bridge, Store).

## Runtime and bounded collection controls

| Input/control | Contract and coverage |
| --- | --- |
| `HEHEHE_MEMORY_PYTHON` | Optional existing absolute interpreter path; relative/missing/non-Python selection yields runtime-unavailable without installation or store mutation. Valid configured interpreter is probed (Bridge, Store). An empty/unset value uses platform defaults. |
| Python/SQLite capability | Python 3.10+ and standard-library SQLite FTS5; a missing runtime/skill/capability is advisory. There is no download, dependency installation or network service (Store, Gates, installation test). |
| Git/environment | Source commands use a sanitized environment, literal pathspecs and disabled fsmonitor. Repository identity and registered roots are reread; ordinary environment lookup selects existing Git/Python executables. This inventory does not promise protection from a process that controls the same filesystem/runtime identity. |
| Collection bounds | Synchronization allows at most **64 registered roots**, **1,024 scanned run entries**, **512 eligible notes** and **1 MiB serialized request**. Collection tests execute each exact limit and one beyond; Bridge executes the exact request-byte bound. Overflow reports a limit failure instead of partially replacing an index; invalid individual notes are skipped. Source also covers registered repository isolation. |
| Returned context | At most **50 candidate rows** are checked, at most **5 notes** returned and the records array fits **6,000 UTF-16 units**. Full source checks precede projection; a compact result is explicitly marked (Recall, Flow). These are retrieval bounds, not authority or universal-match guarantees. |

Required tests, approvals, trusted receipt age and source identity remain owned by the existing verification/delivery tools. Memory inputs and historical outcomes cannot change them. See the memory format reference and the resume verification policy for authority, optional-runtime and retention semantics.
