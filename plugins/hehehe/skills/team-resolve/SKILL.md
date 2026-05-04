---
name: team-resolve
description: Resolve complex bugs by coordinating Codex implementation with optional independent Claude critique.
---

# hehehe:team-resolve

Use this for bugs spanning multiple modules or unclear ownership.

Codex keeps the critical path. If subagents are available, delegate bounded non-blocking exploration or review tasks. Claude may review hypotheses or the final diff, but should not own implementation.

Produce a short root-cause note, patch, verification result, and residual-risk summary.
