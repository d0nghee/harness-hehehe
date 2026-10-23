# hehehe

[한국어](README.md) | English

hehehe is a development workflow plugin in which Codex owns planning, implementation, verification, and fixes from start to finish, while Claude participates only as an independent reviewer when needed.

It connects everything from shaping an idea through implementation, browser testing, and pre-release checks into a single workflow. Interrupted work can be resumed by recording its run state.

## Key Features

- **Codex-first execution**: Codex handles planning, implementation, debugging, testing, and final decisions
- **Optional Claude review**: Read-only cross-checks for high-risk changes involving code, security, or migrations
- **End-to-end automation**: Specification → implementation → build gate → browser validation → cleanup → documentation
- **Adaptive architecture gate**: Automatically select Lite, Standard, or Strict from a separate 0-10 project score, then apply profile-specific coupling thresholds
- **Frontend defaults**: Use FSD and Tailwind CSS for new frontend work unless the user explicitly requests another approach
- **Backend data policy**: Prefer ORM writes and Core/bound SQL for complex reads while treating established Go SQL layers as first-class
- **Zero-install observability baseline**: Reuse browser, application, and test output while verifying backend error codes, structured logs, and `request_id` correlation
- **Task-scoped isolation**: Reuse or create task branches and Git worktrees with separate port, log, Compose, and development-database identities
- **One review location and approval-bound main delivery**: The lead integrates and verifies changes in a fixed checkout, then switches that same location to main only after exact user approval
- **Parallel resolution with subagents**: Distribute independent tasks to Codex subagents, then have the lead Codex agent integrate and verify their work
- **Real browser testing**: Use the in-app browser to click, type, check network and console errors, and inspect responsive layouts
- **Run-state recovery**: Preserve progress in `.hehehe/runs/` and resume from the point of interruption
- **Completion gate**: Execute a reviewed commit's mandatory checks and block completion for failed, missing, expired, or source-stale evidence
- **Repository knowledge system**: Automatically initialize, synchronize, and verify a short `AGENTS.md`, indexed project docs, architecture maps, and source fingerprints
- **Drift and garbage collection**: Periodically audit churn, size, and structural drift, prove deletion candidates, and prepare one focused maintenance change or PR
- **Autonomous CI and PR loop**: Reconcile review feedback and CI failures against the exact PR head SHA until the authorized ready or merged state
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

Installation does not approve verification criteria. Before a run can complete, a project maintainer must establish the initial baseline described under [Trusted Completion Gate](#trusted-completion-gate).

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
$hehehe:frontend-architecture Design this frontend feature with FSD and Tailwind
$hehehe:backend-architecture Review backend responsibility boundaries and ORM-versus-SQL choices
$hehehe:observability Structure and verify API errors and backend logs
$hehehe:resume Prepare the workspace and run state for the order error task
$hehehe:repository-knowledge
$hehehe:preflight Perform a final check that this is ready to release
```

`$hehehe:repository-knowledge` runs initialization, synchronization, safe repair, and freshness revalidation automatically when no mode is given. Use explicit `init`, `sync`, `check`, or `status` modes when narrower control is needed.

### Bug Fixes and Reviews

```text
$hehehe:resolve Find and fix the cause of a redirect loop after login
$hehehe:subagent-resolve Split a cross-module authentication change among subagents, then implement and integrate it
$hehehe:review Review the current changes with a focus on bugs and regression risks
$hehehe:team-review Review the authentication changes from independent perspectives as well
$hehehe:maintain-codebase check Audit repository drift and rank cleanup targets
$hehehe:pr-loop ready Fix review and CI failures on PR 42 until it is ready to merge
```

### UI Design and Real-Screen Validation

```text
$hehehe:design-ui Propose a UI direction for an analytics dashboard
$hehehe:implement-ui Implement the selected direction in the existing frontend
$hehehe:browser-validate Directly test the main flows on desktop and mobile
```

`browser-validate` does more than read the code or check that it builds. It opens the actual page in the in-app browser, performs clicks, input, and navigation, and checks for console errors, failed network requests, and layout regressions.

### Diagnostics and Resuming Work

```text
$hehehe:doctor Diagnose the global installation and current project state
$hehehe:resume Resume an interrupted task workspace and hehehe run
```

`doctor` reports `PASS`, `DEGRADED`, or `BLOCKED` with supporting evidence without modifying files. `resume` reconciles the task branch, worktree, local runtime identity, and saved run goal, then continues from the next step.

Task labels include a hash of the complete identity, and runtime IDs use the Git common directory so they remain stable across worktree entry points. Continue older task branches with their exact `--branch`. Doctor compares actual cached files and recognizes installed browser providers; live session tool availability remains a separate check.

## Trusted Completion Gate

AI-authored acceptance criteria and handwritten `PASS` reports cannot authorize completion. The `resume` `verify` command reads mandatory checks, changed-path rules, protected inputs, and result expiry from a reviewed commit's `.hehehe/verification-policy.json`. The `complete` command validates actual execution evidence.

### Establish the Initial Baseline

1. A project maintainer reviews the policy, tests, commands, and CI tools and establishes a baseline commit.
2. A trusted launcher supplies that commit's full SHA as `HEHEHE_VERIFICATION_BASE`. Do not let the implementation agent approve its working `HEAD` or substitute a different baseline.
3. Changes to the policy or existing protected verification inputs require independent review. A maintainer may supply the exact reviewed commit as `HEHEHE_VERIFICATION_APPROVED_HEAD`; that run still executes the old baseline's mandatory checks.

After a protected update lands, use `verification-baseline.mjs plan` to present the old/new SHAs and request ID, obtain **separate baseline approval**, then run `promote`. Update the trusted launcher's pin for new runs; never repin an active run. See the [solo-owner delivery runbook](docs/runbooks/solo-owner-delivery.md) for required remote checks and the full procedure.

For a project installation, use the following commands with the environment supplied by that trusted launcher:

```text
node .agents/skills/hehehe-resume/scripts/run-state.mjs init --project . --goal "Task goal"
node .agents/skills/hehehe-resume/scripts/run-state.mjs verify --project . --json
node .agents/skills/hehehe-resume/scripts/run-state.mjs complete --project . --json
```

Resume an existing active run rather than initializing another one. For a global installation, use `<Plugin target>/skills/resume/scripts/run-state.mjs`.

| Condition | Completion decision |
|---|---|
| All mandatory checks pass with valid evidence for the current source, HEAD, and policy | Allowed |
| Failed or unexecuted checks, timeout, or disallowed skipped tests | Blocked |
| Source or HEAD changed after verification, or the receipt expired | Blocked until reverified |
| Missing logs, modified receipts, unapproved weaker criteria, or unresolved `blocked` state | Blocked |

### CI and First Adoption

This repository's `.github/workflows/verification.yml` loads the verifier from the PR base commit and tests the exact PR head. A maintainer must require `completion-gate` through repository protections and protect policy/workflow changes. Local completion and remote CI success are separate decisions.

If the old base has no policy or verifier, the new CI job fails too. A maintainer must review and establish the initial baseline through the repository's authorized adoption process; there is no initial-PR self-approval exception. Other projects need CI integration appropriate to their own repository.

Local integrity checks do not isolate a process with unrestricted same-account filesystem and environment access. Enforce important merge conditions through trusted execution and platform protections outside the implementation agent's control. See the [verification policy reference](plugins/hehehe/skills/resume/references/verification-policy.md) for the schema, approval scope, and operating procedures.

## Integration, User Review, and Main Delivery

When the user requests integrated delivery or enables it for the repository, the lead agent owns worker integration, conflict resolution and aggregate verification. Subagents on one task share its task worktree by default. Even when independent branches are used, the user reviews one integrated result rather than testing each worker checkout.

```text
Task/worker implementation -> integration -> verification in one fixed review checkout
                          -> user approval -> approved candidate delivered to local main
```

The first delivery pins the review path and target branch for the repository. A pending candidate is frozen; requested revisions produce a newly verified candidate and approval request. After approval, that same directory checks out main, so the user does not need to switch folders.

For a project installation, the lead runs these commands after reviewing and committing in-scope task changes:

```text
node .agents/skills/hehehe-resume/scripts/delivery.mjs prepare --project . --target main --review-path <fixed-review-directory> --source <task-branch> --json
node .agents/skills/hehehe-resume/scripts/delivery.mjs status --project . --json
```

Subsequent preparations reuse the pinned path and target. Repeat `--source` for multiple independent branches. `prepare` never advances main. Only first adoption without a target policy may use `--bootstrap-review` to test proposed checks and publish a provisional review candidate; this does not approve its verification baseline.

At `awaiting_approval`, the lead provides the fixed path, candidate SHA, target main SHA, unique approval request ID and check evidence. Only after the user approves that candidate may a trusted launcher supply the exact approval identities and invoke `delivery.mjs merge`. Initial verification-policy adoption also requires approval of the policy itself.

Changed main/candidate identities or stale evidence block merge. Success requires `merged`, the actual main SHA and a clean checkout of main in that same review directory. If evidence expires while waiting for separate baseline-promotion approval after merge, run `delivery.mjs verify` again for the identical candidate under the old baseline. Failed or missing results still block promotion. Remote push, npm publication and task worktree removal require separate authority. See the [integration-delivery reference](plugins/hehehe/skills/resume/references/integration-delivery.md) for commands and recovery.

## CLI Commands

```text
harness-hehehe install --global [--dry-run]
harness-hehehe install --project [path] [--dry-run]
harness-hehehe uninstall --global [--dry-run]
harness-hehehe uninstall --project [path] [--dry-run]
harness-hehehe profile [path] [--json] [--write]
  [--config path] [--allow-downgrade]
```

### Architecture Profiles

For non-trivial application work, hehehe scores five project dimensions—security/data risk, domain complexity, integration complexity, operational risk, and collaboration pressure—from `0-2` each.

| Project score | Profile | Coupling pass | Improve or justify | Fail |
|---|---|---|---|---|
| `0-3` | Lite | `0-4` | `5-6` | `7-10` |
| `4-6` | Standard | `0-3` | `4-5` | `6-10` |
| `7-10` | Strict | `0-2` | `3-4` | `5-10` |

The project score and per-change coupling score are separate. Structural boundary failures block every profile. Generate or refresh the report with:

```bash
npx harness-hehehe profile . --write
```

Use `.hehehe/architecture-policy.json` to fix or bound a profile and to declare business-context dimensions the scanner cannot infer.

You can inspect the installation path and scope without making changes.

```bash
npx harness-hehehe install --global --dry-run
npx harness-hehehe install --project . --dry-run
```

The installer first validates the bundle manifest and skill frontmatter. For both global plugins and project skills, it prepares the new bundle in a temporary location before replacing the existing one, and it does not silently overwrite an existing marketplace entry or project skill.

## Updating

Global installation and removal verify ownership before changing an existing folder. New installations carry a marker bound to the target path. Older unmarked installations require the exact marketplace registration, valid plugin/catalog and paths belonging to the bundled payload layout. Unverified folders, extra personal paths in legacy installations, Git checkouts and linked paths are rejected, including with `--dry-run`. A marked installation directory is managed as a whole; keep personal files elsewhere.

Run the same installation command again to replace the current installation with the latest release.

```bash
npx harness-hehehe@latest install --global
npx harness-hehehe@latest install --project .
```

After updating, restart Codex or start a new thread.

Installer settings JSON is atomically replaced without first removing the original. A failed commit leaves the previous settings intact. If plugin-directory replacement and rollback both fail, the error identifies the preserved backup. A later successful reinstall does not delete that separate backup; inspect the current target before restoring it manually.

## Uninstalling

```bash
npx harness-hehehe uninstall --global
npx harness-hehehe uninstall --project .
```

Other plugins in the existing marketplace are preserved; only the `hehehe` entry and its installation path are removed.

## Work-State Files

Long-running workflows can store their state and validation results in the project's `.hehehe/` directory.

```text
.hehehe/implementation-spec.md
.hehehe/verification-policy.json
.hehehe/current.json
.hehehe/runs/<run-id>/state.json
.hehehe/runs/<run-id>/done-criteria.md
.hehehe/runs/<run-id>/checks.md
.hehehe/runs/<run-id>/verification.json
.hehehe/runs/<run-id>/verification-<check-id>.log
.hehehe/runs/<run-id>/final-report.md
```

Preserve legacy singleton `.hehehe/done-criteria.md`, `checks.md`, and `final-report.md` as history. The run's `verification.json` is an inspection copy; authoritative integrity receipts are stored separately in the Git common directory.

## Language Settings

hehehe skills are configured to reason internally in English and write final responses to the user in Korean. This rule applies when using a `$hehehe:...` skill.

To apply the same rule to general Codex conversations, add the following to your global user `AGENTS.md`.

```markdown
# Global Instructions

- Reason internally in English.
- Always write the final response to the user in Korean.
```

## Release Notes

**Latest version v0.3.14** · [Browse releases](https://github.com/d0nghee/harness-hehehe/releases) · [Full changelog (Korean)](CHANGELOG.md)
