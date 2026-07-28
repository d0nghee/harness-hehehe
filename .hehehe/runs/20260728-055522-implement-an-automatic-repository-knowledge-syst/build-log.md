# Build Log

- Initialized the `repository-knowledge` skill through the standard skill generator.
- Added default `auto` behavior plus explicit `init`, `sync`, `check`, and `status` modes.
- Added a dependency-free Node.js knowledge-system script for inventory, source fingerprints, manifest recording, local links, index coverage, verification age, and freshness status.
- Added path-boundary and symbolic-link safety checks.
- Added the common knowledge standard and generated skill UI metadata.
- Integrated read-only intake checks and automatic completion synchronization into `full-resolve`, with preflight and update-docs support.
- Added repository knowledge fields to run templates, catalog/manifest entries, and Korean/English user documentation.
- Applied the knowledge baseline to the hehehe repository itself.
- Added nine deterministic fixture tests.
- Forward-tested a new Node repository in default auto mode and an existing Go repository with authoritative custom AGENTS instructions.
- Bumped the package and plugin to `0.3.8` and installed the global plugin.
