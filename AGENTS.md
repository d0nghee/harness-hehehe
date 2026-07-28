# Repository instructions

This repository packages and installs the `hehehe` Codex workflow plugin.

## Working rules

- Use Node.js 20 or later and preserve the dependency-free ESM runtime.
- Keep `package.json` and `plugins/hehehe/.codex-plugin/plugin.json` versions synchronized.
- Keep `plugins/hehehe/skill-catalog.json` sorted and identical to the bundled skill directories.
- Preserve valid skill frontmatter and project/global installer safety guarantees.
- Do not overwrite unrelated work in a dirty worktree.
- Run `npm run validate` after code, installer, catalog, or skill changes.

## Repository knowledge

Start with the [project knowledge index](docs/README.md). Update it through `hehehe:repository-knowledge` when structure, durable decisions, or operational procedures change.
