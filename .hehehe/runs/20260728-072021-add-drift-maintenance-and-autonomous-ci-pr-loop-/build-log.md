# Build Log

- Reused `C:\Users\user\Desktop\hehehe` on `agent/subagent-resolve`; related cumulative changes made a new worktree from the committed base inappropriate.
- Added `hehehe:maintain-codebase` with `check`, `fix`, `pr`, and policy-bounded `scheduled` modes.
- Added a dependency-free maintenance audit that ranks common source files using size, recent Git churn, maintenance markers, and active changes.
- Added a maintenance policy reference that limits each run to one coherent target and requires strong proof before garbage deletion.
- Kept `hehehe:clean` scoped to change-local reactive hygiene.
- Added `hehehe:pr-loop` with `status`, `repair`, `ready`, `merge`, and `watch` modes.
- Added exact-head ready/merge gates, CI failure classification, iteration evidence, and prohibitions on admin bypass, force push, approval forgery, or stale-SHA merge.
- Integrated both skills into `full-resolve`, `preflight`, the main router, plugin prompts, catalog, README files, usage documentation, and architecture knowledge.
- Added `.github/workflows/quality.yml` for pull-request, manual, and weekly validation, packaging, and maintenance auditing.
- Updated package and plugin versions to `0.3.12`.
- Atomic global directory replacement was blocked by the live Codex process. Backed up 0.3.11, synchronized the managed target in place, and activated the new user cache.
