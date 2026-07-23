---
name: browser-tool-test
description: Test web apps and browser-facing workflows with the in-app browser tool. Use when Codex should open a local route, localhost app, file URL, or current browser tab; click, type, inspect console/network behavior, capture screenshots, test responsive layouts, or verify UI changes after implementation.
---

# hehehe:browser-tool-test

Use this when browser behavior must be verified by operating the app, not only by reading code or running builds.

## Required Tooling

Invoke `browser:control-in-app-browser` before testing when it is available. Use it to open routes, interact with the page, inspect the app, and capture screenshots.

## Workflow

1. Identify the target route, workflow, and expected result from the user request, code, or `.hehehe/*` docs.
2. Start the dev server if the app requires one. Reuse an existing server only after confirming the URL and port.
3. Open the target in the in-app browser.
4. Exercise the primary workflow with real clicks, typing, navigation, and state changes.
5. Inspect console errors, failed network requests, blank screens, routing failures, and obvious rendering regressions.
6. For layout-sensitive UI, test at least one desktop viewport and one mobile viewport.
7. Capture screenshots when visual evidence is useful or when diagnosing layout problems.
8. Fix confirmed issues, then rerun the affected browser steps.

## Reporting

Record concise results in `.hehehe/BROWSER-RESULTS.md` when `.hehehe/` exists. Include:

- URL and route tested
- browser actions performed
- desktop/mobile viewport coverage when relevant
- console/network findings
- screenshots captured, if any
- pass/fail status and remaining manual QA

If no browser run is possible, state the blocker clearly and fall back to build/typecheck evidence only after explaining the gap.
