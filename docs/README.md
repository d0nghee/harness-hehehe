# Project knowledge

This index contains durable information for analyzing and maintaining the hehehe repository.

## Architecture

- [Repository architecture overview](architecture/overview.md)

## User documentation

- [Korean README](../README.md)
- [English README](../README.en.md)
- [Skill and workflow usage](../USAGE.md)
- [Trusted completion verification](../plugins/hehehe/skills/resume/references/verification-policy.md)
- [One review location and approval-bound main delivery](../plugins/hehehe/skills/resume/references/integration-delivery.md)

## Decisions and runbooks

No separate decision record or operational runbook is currently required. The package has one npm publication workflow, described in the architecture overview. Add a focused document here when a future decision or procedure carries information that does not belong in the overview.

## Knowledge maintenance

Run `$hehehe:repository-knowledge` for automatic initialization, synchronization, and freshness validation. Use the explicit `check` mode for a read-only handoff gate. Machine freshness state is stored in `.hehehe/knowledge.json`; execution history remains under `.hehehe/runs/`.
