# hehehe

[한국어](README.md) | English

hehehe is a development workflow plugin in which Codex owns planning, implementation, verification, and fixes from start to finish, while Claude participates only as an independent reviewer when needed.

It connects everything from shaping an idea through implementation, browser testing, and pre-release checks into a single workflow. Interrupted work can be resumed by recording its run state.

## Key Features

- **Codex-first execution**: Codex handles planning, implementation, debugging, testing, and final decisions
- **Optional Claude review**: Read-only cross-checks for high-risk changes involving code, security, or migrations
- **End-to-end automation**: Specification → implementation → build gate → browser validation → cleanup → documentation
- **Parallel resolution with subagents**: Distribute independent tasks to Codex subagents, then have the lead Codex agent integrate and verify their work
- **Real browser testing**: Use the in-app browser to click, type, check network and console errors, and inspect responsive layouts
- **Run-state recovery**: Preserve progress in `.hehehe/runs/` and resume from the point of interruption
- **Installation diagnostics**: Inspect the hehehe installation, Codex, optional Claude, and project state without modifying files
- **UI design support**: Provide UI directions, design systems, and implementation workflows suited to the product

See [USAGE.md](USAGE.md) for the complete skill list.

## Requirements

- Node.js 20 or later
- Codex CLI
- Claude CLI is optional and is required only when you request an independent cross-review

## Quick Start

### Use in Every Project

```bash
npx harness-hehehe install --global
```

### Use Only in the Current Project

```bash
npx harness-hehehe install --project .
```

After installation, restart Codex or start a new thread, then invoke a skill.

```text
$hehehe:full-resolve Implement and validate a user profile editing feature
```

## Installation Scope

| Scope | Command | Plugin Location | Behavior |
|---|---|---|---|
| All projects for the current user | `npx harness-hehehe install --global` | `~/plugins/hehehe` | Registers the personal marketplace entry and enables it automatically |
| Current project | `npx harness-hehehe install --project .` | `<project>/.agents/skills/hehehe-*` | Loaded by default only in the current project |
| Specified project | `npx harness-hehehe install --project <path>` | `<path>/.agents/skills/hehehe-*` | Loaded by default only in the specified project |

Global installation preserves other plugins in `~/.agents/plugins/marketplace.json` and only adds or updates the `hehehe` entry. Project installation places the `$hehehe:*` skills directly in `.agents/skills`, which is discovered by both the Codex CLI and desktop app, while preserving existing project skills. If an older project marketplace installation exists, only its `hehehe` entry is migrated.

The same commands work on Windows and macOS/Linux.

```bash
npx harness-hehehe install --project "D:\work\my-app"
npx harness-hehehe install --project /work/my-app
```

### Install the CLI Globally

To avoid using `npx` every time, install the installer itself globally.

```bash
npm install -g harness-hehehe
harness-hehehe install --global
harness-hehehe install --project .
```

After global installation, the executable command is `harness-hehehe`, the same as the package name.

## Typical Workflows

### From Idea to Implementation

```text
$hehehe:ideate Turn an admin order-processing idea into an MVP specification
$hehehe:feature-spec Write acceptance criteria for the order status change feature
$hehehe:full-resolve Implement the specification and complete build and browser validation
$hehehe:preflight Perform a final check that this is ready to release
```

### Bug Fixes and Reviews

```text
$hehehe:resolve Find and fix the cause of a redirect loop after login
$hehehe:subagent-resolve Split a cross-module authentication change among subagents, then implement and integrate it
$hehehe:review Review the current changes with a focus on bugs and regression risks
$hehehe:team-review Review the authentication changes from independent perspectives as well
```

### UI Design and Real-Screen Validation

```text
$hehehe:design-ui Propose a UI direction for an analytics dashboard
$hehehe:implement-ui Implement the selected direction in the existing frontend
$hehehe:browser-tool-test Directly test the main flows on desktop and mobile
```

`browser-tool-test` does more than read the code or check that it builds. It opens the actual page in the in-app browser, performs clicks, input, and navigation, and checks for console errors, failed network requests, and layout regressions.

### Diagnostics and Resuming Work

```text
$hehehe:doctor Diagnose the global installation and current project state
$hehehe:resume Resume an interrupted hehehe run
```

`doctor` reports `PASS`, `DEGRADED`, or `BLOCKED` with supporting evidence without modifying files. `resume` reconciles the saved goal with the actual working tree, then continues from the next step.

## CLI Commands

```text
harness-hehehe install --global [--dry-run]
harness-hehehe install --project [path] [--dry-run]
harness-hehehe uninstall --global [--dry-run]
harness-hehehe uninstall --project [path] [--dry-run]
```

You can inspect the installation path and scope without making changes.

```bash
npx harness-hehehe install --global --dry-run
npx harness-hehehe install --project . --dry-run
```

The installer first validates the bundle manifest and skill frontmatter. For both global plugins and project skills, it prepares the new bundle in a temporary location before replacing the existing one, and it does not silently overwrite an existing marketplace entry or project skill.

## Updating

Run the same installation command again to replace the current installation with the latest release.

```bash
npx harness-hehehe@latest install --global
npx harness-hehehe@latest install --project .
```

After updating, restart Codex or start a new thread.

## Uninstalling

```bash
npx harness-hehehe uninstall --global
npx harness-hehehe uninstall --project .
```

Other plugins in the existing marketplace are preserved; only the `hehehe` entry and its installation path are removed.

## Work-State Files

Long-running workflows can store their state and validation results in the project's `.hehehe/` directory.

```text
.hehehe/done-criteria.md
.hehehe/implementation-spec.md
.hehehe/checks.md
.hehehe/final-report.md
.hehehe/current.json
.hehehe/runs/<run-id>/state.json
```

## Language Settings

hehehe skills are configured to reason internally in English and write final responses to the user in Korean. This rule applies when using a `$hehehe:...` skill.

To apply the same rule to general Codex conversations, add the following to your global user `AGENTS.md`.

```markdown
# Global Instructions

- Reason internally in English.
- Always write the final response to the user in Korean.
```

## Troubleshooting

### Installed Skills Do Not Appear

1. For a project installation, check `Skills target` in the output and `.agents/skills/hehehe-review/SKILL.md`.
2. For a global installation, check `Plugin target` in the output and `.codex-plugin/plugin.json` at the target.
3. For a global installation, verify that `hehehe` is enabled in `codex plugin list`.
4. Restart Codex from the project root or start a new thread.

### Installation State Looks Suspicious

```text
$hehehe:doctor Diagnose the current installation and project state
```

### Installation Scope Is Unclear

- Every project: `--global`
- Current project only: `--project .`
- Specified project only: `--project <path>`

## Development and Validation

```bash
npm test
npm run validate
npm pack --dry-run
```

Repository structure:

```text
hehehe/
  bin/hehehe.mjs
  lib/installer.mjs
  plugins/hehehe/
    .codex-plugin/plugin.json
    skills/
    templates/
  tests/
  package.json
  README.md
  README.en.md
  USAGE.md
```

## Automated Publishing

When a PR is merged into the `main` branch, GitHub Actions runs validation and then automatically publishes the package to npm. The PR must set the same new, not-yet-published npm version in both `package.json` and `plugins/hehehe/.codex-plugin/plugin.json`. For npm Trusted Publishing, register the GitHub repository `d0nghee/harness-hehehe` and the `publish.yml` workflow file.

## License

MIT
