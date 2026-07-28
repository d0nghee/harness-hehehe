# Build Log

- Added a deterministic, dependency-free project profile scorer under `architecture-metrics`.
- Added `harness-hehehe profile` with JSON, report writing, policy path, and explicit downgrade options.
- Added auto/fixed policy validation, score overrides, profile range constraints, persisted downgrade protection, and auditable evidence.
- Integrated profile selection and profile-specific coupling thresholds into architecture, full-resolve, review, preflight, resolve, and subagent workflows.
- Updated templates and Korean/English documentation.
- Added fixture tests for all profiles, overrides, downgrade behavior, invalid configuration, repository heuristics, and CLI parsing.
- Forward tests found that scanner thresholds were not sufficiently visible; documented the exact automatic evidence rules.
- Bumped the package and plugin to `0.3.7` and installed the global plugin.
