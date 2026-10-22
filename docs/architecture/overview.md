# Repository architecture overview

## Purpose and runtime

hehehe is a dependency-free Node.js ESM package that distributes a Codex workflow plugin. Codex owns implementation and verification workflows; Claude is optional and limited to advisory review. Node.js 20 or later is required.

## Repository map

| Path | Responsibility |
| --- | --- |
| [`bin/hehehe.mjs`](../../bin/hehehe.mjs) | CLI parsing for installation, uninstallation, and project-profile reporting |
| [`lib/installer.mjs`](../../lib/installer.mjs) | Safe global/plugin and project/skill installation transactions |
| [`plugins/hehehe/`](../../plugins/hehehe/) | Plugin manifest, sorted skill catalog, skills, bundled scripts, references, and workflow templates |
| [`tests/`](../../tests/) | Node test fixtures for installer safety and deterministic bundled scripts |
| [`.github/workflows/quality.yml`](../../.github/workflows/quality.yml) | Pull-request validation plus scheduled package and maintenance audits |
| [`.github/workflows/publish.yml`](../../.github/workflows/publish.yml) | Validation and npm publication on pushes to `main` |
| `.hehehe/runs/` | Run-scoped implementation evidence, not long-lived project documentation |

## Installation flows

Global installation copies `plugins/hehehe` to the user plugin directory, updates only the hehehe entry in the personal marketplace, and activates it through the Codex CLI. Project installation validates the catalog, rewrites skill names to the `hehehe:*` namespace, and installs managed skills under `.agents/skills` using locks, journals, staging directories, and recoverable replacement.

The installer must reject unsafe paths, symbolic-link targets, malformed manifests, unmanaged collisions, invalid transaction state, and source/target identity.

## Workflow and knowledge flows

Each bundled skill provides focused instructions and may include deterministic scripts or references. Non-trivial workflow execution stores state under `.hehehe/runs/<run-id>/`.

`browser-validate` is the single public boundary for both direct in-app browser testing and browser validation inside delivery workflows. It owns server/route confirmation, real user interactions, responsive checks, screenshots, console and network evidence, and run-scoped reporting.

`repository-knowledge` keeps long-lived project understanding separate from run history:

```text
Codex semantic inspection
  -> AGENTS.md and indexed docs
  -> deterministic source fingerprints and link checks
  -> .hehehe/knowledge.json
```

Architecture profiles and repository knowledge are independent. Profiles control coupling-gate strictness; repository knowledge provides a common analysis and maintenance baseline.

`observability` is another independent, task-adaptive baseline:

```text
Browser, application, and test output
  -> safe error responses and stable error codes
  -> structured backend logs and request correlation
  -> run-scoped verification evidence
```

The default workflow installs no monitoring stack. A containerized Grafana, Loki, Prometheus, Tempo, and OpenTelemetry stack is available only through an explicit `full` request and must not become a host-level or ordinary project dependency.

`resume` owns the complete workspace and run lifecycle before new non-trivial work:

```text
Task identity
  -> stable task branch
  -> registered sibling Git worktree
  -> task-scoped port, logs, Compose project, and optional development database
  -> matching run state inside the selected worktree
  -> verified completion and explicit workspace retirement
```

The task identity, rather than a date, is durable. The deterministic workspace script can plan, create, and inspect worktrees but cannot commit, stash, patch, merge, push, start services, remove worktrees, or delete branches. The run-state script records progress and evidence inside the selected worktree. Dirty source changes remain in place and are excluded only after an explicit acknowledgement; retirement remains a separate explicit gate.

Completion now has a deterministic verification boundary:

```text
Externally supplied reviewed commit
  -> strict verification policy and protected inputs
  -> required checks selected from the actual diff
  -> command execution and source/HEAD-bound integrity receipt
  -> completion only with passing, complete, fresh evidence
```

`resume/scripts/verification-policy.mjs` owns baseline policy validation, changed-file selection, protected-input checks and source identity. `verification-runner.mjs` owns command execution, TAP summaries, logs and receipt integrity. `run-state.mjs` orchestrates verification and completion with exclusive mutation locking. Existing protected tests and command configuration cannot be relaxed by the task; external exact-head review can authorize committed changes while the old baseline requirements remain in force. AI-authored Markdown and JSON approval fields have no authority.

The [verification policy reference](../../plugins/hehehe/skills/resume/references/verification-policy.md) defines bootstrap, operator trust, receipt expiry, source coverage, protected changes, and limitations. `.github/workflows/verification.yml` loads the CI adapter and runner from the trusted PR base and tests the exact PR head without publication credentials. Initial policy adoption, independent approvals and branch protection remain maintainer responsibilities. Local integrity keys and full filesystem access are not an independent security boundary.

The separate local delivery lifecycle lives in `resume/scripts/delivery.mjs`, with Git-common state/locking in `delivery-store.mjs`. It integrates exact task commits in temporary staging, publishes and verifies one repository-pinned review checkout, and freezes the approval candidate. Exact user approval binds the candidate, target base and request ID; a compare-and-swap fast-forward updates local main and the same review directory then checks out main. Failed, stale or changed results cannot authorize delivery. First-policy review is explicitly provisional until separate user approval. See the [integration-delivery reference](../../plugins/hehehe/skills/resume/references/integration-delivery.md). No remote push, publication or task-worktree deletion is implied.

`maintain-codebase` and `pr-loop` cover the longer repository and delivery lifecycle:

```text
Scheduled or on-demand maintenance audit
  -> evidence-backed single target
  -> bounded fix and verification
  -> draft maintenance PR when authorized
  -> exact-head CI and review reconciliation
  -> READY or explicitly authorized MERGED state
```

The maintenance audit ranks common source files by size, recent churn, maintenance markers, and active changes without treating those heuristics as deletion proof. The PR loop never bypasses branch protection or merges an unverified head SHA.

## Package invariants

- `package.json` and the plugin manifest declare the same version.
- `skill-catalog.json` is sorted and exactly matches the bundled skill directories.
- The runtime has no external npm dependency.
- Automatic observability reuses project-native facilities; full logs-metrics-traces infrastructure is explicit and containerized.
- Worktree preparation never moves dirty changes or automatically retires a task branch or worktree.
- Maintenance scheduling does not grant mutation or merge authority; committed policies only narrow already authorized actions.
- PR automation verifies the exact remote head and cannot use admin bypass or force push.
- Project installation changes only managed hehehe skills and preserves unrelated skills and plugins.
- Claude does not own implementation or blocking verification.

## Validation and release

`npm run validate` uses `scripts/check-syntax.mjs` to syntax-check ESM scripts before running all Node tests, including failure, missing-result, stale-result and policy-weakening completion regressions. `npm pack --dry-run` verifies the publishable artifact. The quality workflow runs these gates for pull requests and on a weekly schedule, while the publication workflow validates every push to main before checking the npm version. `scripts/publish-status.mjs` skips publication only when the registry returns matching metadata for the existing version; an explicit 404 permits publication, and other HTTP, metadata, timeout or network failures stop the job. Documentation updates can therefore keep all validation without republishing an existing package version. The separate trusted verification workflow enforces the reviewed policy; require its completion-gate job through repository protections after initial baseline adoption.

User-facing release history lives in the root `CHANGELOG.md` and GitHub Releases. Both READMEs keep a short footer linking to those records. Release tags point to the source of the corresponding npm version; the recorded npm release date is distinct from the date a retrospective GitHub release note is published.
