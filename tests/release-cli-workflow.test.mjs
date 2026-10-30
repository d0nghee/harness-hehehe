import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseReleaseArguments, runReleaseCli } from "../scripts/release.mjs";

const request = `release-${"a".repeat(24)}`;
function output() { let text = ""; return { write(value) { text += value; }, read() { return text; } }; }

test("release CLI requires exact request identities and rejects approval/force shortcuts", () => {
  for (const args of [["publish", "--json"], ["verify"], ["prepare", "--request", "branch"],
    ["plan", "--request", request], ["publish", "--request", request, "--force"],
    ["publish", "--request", request, "--approve"], ["status", "--project", ".", "--project", "."]]) {
    assert.throws(() => parseReleaseArguments(args));
  }
  assert.equal(parseReleaseArguments(["prepare", "--request", request]).request, request);
  assert.equal(parseReleaseArguments(["status", "--json"]).json, true);
});

test("release CLI forwards commands without generating approvals or external mutations", async () => {
  const calls = [], stdout = output(), stderr = output(), gateway = {};
  const api = Object.fromEntries(["releasePlan", "prepareRelease", "verifyRelease", "releaseStatus", "publishRelease"]
    .map((name) => [name, async (...args) => { calls.push({ name, args }); return { status: name === "publishRelease" ? "released" : "prepared", request_id: request }; }]));
  const approvals = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("HEHEHE_RELEASE_APPROV")));
  for (const args of [["plan", "--json"], ["prepare", "--request", request, "--json"], ["verify", "--request", request, "--json"],
    ["publish", "--request", request, "--json"], ["status", "--json"]]) {
    assert.equal(await runReleaseCli(args, { api, stdout, stderr, gatewayFactory: () => gateway }), 0);
  }
  assert.deepEqual(calls.map((call) => call.name), ["releasePlan", "prepareRelease", "verifyRelease", "publishRelease", "releaseStatus"]);
  assert.deepEqual(calls[1].args[1], { resumeRequestId: request });
  assert.deepEqual(calls[3].args.slice(1), [request, gateway]);
  assert.deepEqual(Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith("HEHEHE_RELEASE_APPROV"))), approvals);
  assert.equal(stderr.read(), "");
});

test("release CLI JSON errors bind operation/request and do not expose stack, tokens or raw multiline output", async () => {
  const stdout = output(), stderr = output();
  const api = { verifyRelease: async () => { throw new Error("blocked ghp_EXAMPLE github_pat_EXAMPLE npm_EXAMPLE\nRAW HTTP BODY"); } };
  assert.equal(await runReleaseCli(["verify", "--request", request, "--json"], { api, stdout, stderr }), 2);
  const error = JSON.parse(stdout.read());
  assert.equal(error.status, "blocked"); assert.equal(error.error_code, "RELEASE_BLOCKED");
  assert.equal(error.operation, "verify"); assert.equal(error.request_id, request);
  assert.equal(error.message, "blocked [REDACTED] [REDACTED] [REDACTED]");
  assert.equal(stderr.read(), ""); assert.equal(Object.hasOwn(error, "stack"), false);
  const unknown = output();
  assert.equal(await runReleaseCli(["npm_EXAMPLE", "--json"], { stdout: unknown, stderr }), 2);
  assert.equal(JSON.parse(unknown.read()).operation, "unknown");
});

const workflow = fs.readFileSync(path.resolve(import.meta.dirname, "../.github/workflows/publish.yml"), "utf8").replaceAll("\r\n", "\n");
const plan = workflow.slice(workflow.indexOf("  plan:\n"), workflow.indexOf("  publish:\n"));
const publish = workflow.slice(workflow.indexOf("  publish:\n"));

test("main push workflow validates and reports a pending plan with read-only permissions", () => {
  assert.match(plan, /github\.event_name == 'push'/);
  assert.match(plan, /contents: read/); assert.match(plan, /npm run validate/);
  assert.match(plan, /release\.mjs" plan --project/);
  assert.doesNotMatch(plan, /id-token: write|contents: write|npm publish|release\.mjs" publish|HEHEHE_RELEASE_APPROVED/);
  assert.match(workflow, /concurrency:\r?\n  group: hehehe-release-lifecycle\r?\n  cancel-in-progress: false/);
});

test("manual publication binds typed operator identities and uses only separately pinned release tools", () => {
  assert.match(workflow, /workflow_dispatch:/);
  for (const input of ["sha", "version", "request", "integrity"]) {
    assert.match(workflow, new RegExp(`      ${input}:\\r?\\n        description: [^\\n]+\\r?\\n        required: true\\r?\\n        type: string`));
  }
  assert.match(publish, /github\.event_name == 'workflow_dispatch' && github\.ref == 'refs\/heads\/main'/);
  assert.match(publish, /contents: write/); assert.match(publish, /id-token: write/);
  assert.match(publish, /git worktree add --detach "\$TOOL_ROOT" "\$HEHEHE_VERIFICATION_BASE"/);
  assert.match(publish, /\[\[ "\$REMOTE_MAIN" == "\$RELEASE_SHA" \]\]/);
  assert.match(publish, /record\.head !== process\.env\.RELEASE_SHA/);
  assert.match(publish, /record\.request_id !== process\.env\.RELEASE_REQUEST/);
  assert.match(publish, /record\.artifact\?\.integrity !== process\.env\.RELEASE_INTEGRITY/);
  assert.match(publish, /HEHEHE_VERIFICATION_APPROVED_HEAD: \$\{\{ vars\.HEHEHE_VERIFICATION_APPROVED_HEAD \}\}/);
  assert.doesNotMatch(publish, /HEHEHE_VERIFICATION_APPROVED_HEAD: \$\{\{ (?:inputs|github)\./);
  assert.match(publish, /HEHEHE_RELEASE_APPROVED_HEAD: \$\{\{ inputs\.sha \}\}/);
  assert.match(publish, /HEHEHE_RELEASE_APPROVED_VERSION: \$\{\{ inputs\.version \}\}/);
  assert.match(publish, /HEHEHE_RELEASE_APPROVAL_ID: \$\{\{ inputs\.request \}\}/);
  assert.match(publish, /HEHEHE_RELEASE_APPROVED_INTEGRITY: \$\{\{ inputs\.integrity \}\}/);
  assert.ok(publish.indexOf("Reconstruct and compare") < publish.indexOf("Run the pinned required verification"));
  assert.ok(publish.indexOf("Run the pinned required verification") < publish.indexOf("Publish only the explicitly approved"));
  assert.doesNotMatch(workflow, /environment:|run: npm publish|git worktree add[^\n]+\$RELEASE_SHA/);
});

test("workflow shell blocks never interpolate untrusted dispatch expressions directly", () => {
  const lines = workflow.split(/\r?\n/);
  let inRun = false, indentation = 0;
  for (const line of lines) {
    const spaces = line.length - line.trimStart().length;
    if (/^\s*run:/.test(line)) { inRun = true; indentation = spaces; }
    else if (inRun && line.trim() && spaces <= indentation) inRun = false;
    if (inRun) assert.doesNotMatch(line, /\$\{\{\s*(?:inputs|github\.event\.inputs)\./);
  }
});

test("required verification does not inherit GitHub/npm publication or OIDC token environment", () => {
  const verification = publish.slice(publish.indexOf("      - name: Run the pinned required verification"), publish.indexOf("      - name: Publish only the explicitly approved"));
  for (const variable of ["GH_TOKEN", "GITHUB_TOKEN", "ACTIONS_ID_TOKEN_REQUEST_URL", "ACTIONS_ID_TOKEN_REQUEST_TOKEN", "NODE_AUTH_TOKEN", "NPM_TOKEN"]) {
    assert.match(verification, new RegExp(`          ${variable}: ""`));
  }
  assert.match(verification, /release\.mjs" verify/);
  assert.doesNotMatch(verification, /HEHEHE_RELEASE_APPROVED_/);
});
