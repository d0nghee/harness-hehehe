# Checks

- `quick_validate.py` for `resume`, `resolve`, and `full-resolve`: PASS
- `node --test tests/workspace-lifecycle.test.mjs`: PASS, 10/10
- `npm run validate`: PASS, 63/63
- `npm pack --dry-run`: PASS, `harness-hehehe@0.3.11`
- Read-only forward test: PASS; one matching worktree and build-phase run are reused while unrelated primary-tree changes remain untouched.
- Forward-test ambiguity about similarly named tasks was fixed with deterministic exact-match precedence and a no-guess multiple-candidate rule.
- Repository knowledge check: `FRESH`, 0 errors, 0 warnings
- Global plugin: installed and enabled as `hehehe@user-local 0.3.11`
- Source, marketplace target, and user cache: 279 files each, 0 path/hash differences
- Standalone `skills/worktree-isolation`: absent from source, target, cache, catalog, and plugin prompts
- Browser validation: not applicable; this change has no browser-facing behavior.
- Claude review: not requested and not required for this documentation/routing merge.
