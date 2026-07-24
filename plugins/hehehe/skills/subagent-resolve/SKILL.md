---
name: subagent-resolve
description: Resolve and implement a decision-ready hehehe task by decomposing it into bounded parallel Codex sub-agent workstreams, integrating shared-workspace changes, and running end-to-end verification. Use after hehehe:ideate or when .hehehe specs and done criteria exist and the user asks for subagents, parallel resolution, parallel implementation, or multiple implementation workstreams.
---

# hehehe:subagent-resolve

Use this for implementation or resolution work with multiple independent workstreams. Use `hehehe:resolve` for a small single bug that does not benefit from parallelism.

Codex remains the lead engineer and owns task partitioning, the critical path, integration, verification, and the final result.

## Preconditions

1. Read the applicable `AGENTS.md` files and preserve existing user changes.
2. Read `.hehehe/vision.md`, `.hehehe/roadmap.md`, `.hehehe/done-criteria.md`, and `.hehehe/implementation-spec.md` when present.
3. Require concrete scope, acceptance criteria, affected areas, and validation commands. If a material product decision is still open, run `hehehe:ideate` or ask only for the blocking decision before implementation.
4. For non-trivial work, initialize or resume matching run-scoped state with `hehehe:resume`.

## Coordination Workflow

1. Inspect the repository and verify that the task or spec matches the current architecture.
2. Build a dependency-aware task map. Separate work by subsystem, file ownership, or independently verifiable outcome.
3. Lock shared contracts, types, schemas, and integration boundaries before parallel implementation.
4. Keep the critical path with the lead Codex agent. Delegate only bounded tasks that can progress independently.
5. Assign each writable file to at most one active agent. Use read-only exploration tasks when ownership cannot be separated safely.
6. Spawn only as many agents as the available concurrency and useful work justify. Do not create agents merely to mirror phases.
7. Continue useful lead-agent work while sub-agents run. Do not wait idly when integration, inspection, or validation can proceed.
8. Inspect every returned diff, file, log, and test result. Treat sub-agent summaries as claims to verify, not completion evidence.
9. Integrate in dependency order, resolve overlaps deliberately, and run the strongest applicable build, test, lint, typecheck, and browser checks.
10. Compare the integrated result against every done criterion. Update the active run artifacts and report residual risks.

## Sub-Agent Task Contract

Give each sub-agent a prompt containing:

- the user goal and the exact subset of done criteria it owns
- locked contracts or interfaces it must follow
- allowed files or subsystem boundaries
- files or areas it must not modify
- relevant architecture and constraints
- required checks
- expected handoff: changed files, concise rationale, commands run, results, and remaining risks

Prefer tasks such as:

- implement one backend service and its isolated tests
- implement one frontend route or component family against a locked API contract
- inspect an integration boundary and return evidence without editing
- add tests in a separate test file while another agent owns production code

Avoid vague assignments such as "implement the feature" or "fix everything."

## Shared Workspace Rules

- Assume all agents see the same working tree and edits immediately.
- Record ownership before spawning writable tasks.
- Do not let two active agents edit the same file.
- Do not overwrite, reset, clean, or reformat unrelated user changes.
- Do not allow sub-agents to commit, push, publish, migrate, or deploy unless the user explicitly authorized that action and the lead agent retains final control.
- Stop and repartition when a discovered dependency makes two tasks overlap materially.
- Keep nested delegation off unless the lead explicitly assigns a coordinator role and sufficient isolated work exists.

## Claude Boundary

Use Codex sub-agents for exploration, implementation, debugging, fixes, and tests. Claude may be invoked only as an optional read-only independent reviewer for code, security, or migration risk. Run Claude CLI reviews with `--permission-mode plan` and without write-capable allowed tools. Verify every material finding against repository evidence.

## Completion Gate

Complete only when:

- the lead agent has reviewed the integrated diff
- required checks pass or environment blockers are documented with evidence
- UI work has browser validation when available
- every done criterion has a verified result
- temporary coordination artifacts are cleaned up
- the final response identifies implemented work, verification, and remaining risk

If sub-agent tooling is unavailable, execute the same task map sequentially with the lead Codex agent and disclose the fallback.
