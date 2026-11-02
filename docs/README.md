# Project knowledge

This index contains durable information for analyzing and maintaining the hehehe repository.

## Architecture

- [Repository architecture overview](architecture/overview.md)

## User documentation

- [Korean README](../README.md)
- [English README](../README.en.md)
- [Skill and workflow usage](../USAGE.md)
- [Version history](../CHANGELOG.md) and [published release notes](https://github.com/d0nghee/harness-hehehe/releases)
- [Trusted completion verification](../plugins/hehehe/skills/resume/references/verification-policy.md)
- [One review location and approval-bound main delivery](../plugins/hehehe/skills/resume/references/integration-delivery.md)
- [Local experience memory](../plugins/hehehe/skills/experience-memory/SKILL.md) and [record format/runtime](../plugins/hehehe/skills/experience-memory/references/memory-format.md): advisory SQLite recall, source freshness, retention and optional Python requirements.

## Decisions and runbooks

- [Solo-owner delivery and baseline promotion](runbooks/solo-owner-delivery.md): required remote checks, exact candidate approval, interrupted-delivery recovery, and separately approved verification-baseline updates.
- [Approval-bound package releases](runbooks/releases.md): pending-change plans, frozen artifacts, trusted checks, publication authority and partial-release recovery.

## Knowledge maintenance

Run `$hehehe:repository-knowledge` for automatic initialization, synchronization, and freshness validation. Use the explicit `check` mode for a read-only handoff gate. Machine freshness state is stored in `.hehehe/knowledge.json`; execution history remains under `.hehehe/runs/`.
