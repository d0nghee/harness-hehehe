---
name: browser-validate
description: Validate a web UI or local app workflow in a browser as part of the hehehe pipeline.
---

# hehehe:browser-validate

Use for browser-facing changes.

Check:

- app starts
- target route loads
- primary workflow works
- console and network failures are understood
- desktop and mobile layouts do not overlap, clip, or blank
- error/loading/empty states are acceptable

Record results in `.hehehe/BROWSER-RESULTS.md`. Codex fixes confirmed issues and reruns validation.
