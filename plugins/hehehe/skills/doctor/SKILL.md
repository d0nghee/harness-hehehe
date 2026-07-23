---
name: doctor
description: Diagnose the global hehehe plugin installation and current project state without changing files. Use when hehehe skills are missing, plugin cache versions disagree, browser tooling is unavailable, run state is invalid, or setup health must be verified after installation or upgrade.
---

# hehehe:doctor

Run `scripts/doctor.mjs` with Node, resolving the script relative to this `SKILL.md`.

```text
node scripts/doctor.mjs --project <project-root>
node scripts/doctor.mjs --project <project-root> --json
node scripts/doctor.mjs --project <project-root> --strict
```

Treat the script as read-only. Do not repair, delete, install, or rewrite anything during diagnosis.

Report:

- overall `PASS`, `DEGRADED`, or `BLOCKED`
- every non-pass check with its evidence
- the exact remediation suggested by the script

`DEGRADED` means optional capability or migration work remains. `BLOCKED` means the plugin manifest, required skills, project root, or active run state is unusable. Ask before performing any remediation that changes global configuration.
