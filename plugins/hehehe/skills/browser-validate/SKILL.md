---
name: browser-validate
description: Validate web apps and browser-facing workflows with the in-app browser, either directly or as part of the hehehe pipeline. Use for local routes, localhost apps, file URLs, current tabs, real user interactions, responsive layouts, screenshots, console errors, and failed network requests.
---

# hehehe:browser-validate

Use when browser behavior must be verified by operating the app, not only by reading code or running builds.

## Required Tooling

Invoke `browser:control-in-app-browser` before testing when it is available. Use it to open routes, interact with the page, inspect browser evidence, and capture screenshots.

## Workflow

1. Identify the target route, primary workflow, and expected result from the user request, code, or active `.hehehe` run.
2. Start the dev server when required. Reuse an existing server only after confirming its URL and port.
3. Open the target in the in-app browser.
4. Exercise the primary workflow with real clicks, typing, navigation, and state changes.
5. Capture and explain uncaught `pageerror`, new console errors and warnings, failed network requests, relevant status codes, failure payloads, and response timings.
6. Correlate failed API requests with the backend `request_id` and protected log when applicable.
7. For layout-sensitive UI, test at least one desktop and one mobile viewport. Confirm that layouts do not overlap, clip, or blank.
8. Check applicable loading, empty, validation, and error states.
9. Capture screenshots when visual evidence is useful.
10. Fix confirmed issues and rerun the affected browser steps.

Apply the zero-install default from `hehehe:observability`; browser tooling is sufficient unless full logs, metrics, and traces were explicitly requested.

## Reporting

Record results in the active run's `checks.md`, or `.hehehe/BROWSER-RESULTS.md` only when no run exists. Include the URL and route, actions performed, desktop/mobile coverage when relevant, console and network findings, screenshots, pass/fail status, and remaining manual QA.

If no browser run is possible, state the blocker clearly and fall back to build or typecheck evidence only after explaining the gap.
