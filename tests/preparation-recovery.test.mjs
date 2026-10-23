import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import test from "node:test";
import { prepareDelivery, verifyDelivery, mergeDelivery, finishDelivery, deliveryStatus } from "../plugins/hehehe/skills/resume/scripts/delivery.mjs";

const names = ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD", "HEHEHE_DELIVERY_APPROVED_HEAD",
  "HEHEHE_DELIVERY_APPROVED_TARGET", "HEHEHE_DELIVERY_APPROVAL_ID", "HEHEHE_DELIVERY_BOOTSTRAP_APPROVED"];
const reviewBranch = "integration/hehehe-review";
const policy = { schema_version: 1, max_age_seconds: 3600,
  checks: [{ id: "contract", command: ["$node", "-e", 'if(require("fs").existsSync("broken.txt"))process.exit(1)'], kind: "exit", timeout_ms: 5000 }],
  always_required: ["contract"], change_rules: [], protected_paths: ["package.json", "tests/**"] };
function git(root, ...args) {
  return childProcess.execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function put(root, file, text) { const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, text); }
function commit(root, file, text) {
  put(root, file, text); git(root, "add", file); git(root, "commit", "-m", "fixture"); return git(root, "rev-parse", "HEAD");
}
function approve(state) {
  process.env.HEHEHE_DELIVERY_APPROVED_HEAD = state.candidate;
  process.env.HEHEHE_DELIVERY_APPROVED_TARGET = state.target_base;
  process.env.HEHEHE_DELIVERY_APPROVAL_ID = state.request_id;
}
function fixture(t, scenario = "initial") {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  names.forEach((name) => delete process.env[name]);
  const container = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-prepare-recovery-"));
  const root = path.join(container, "source"); fs.mkdirSync(root);
  const reviewPath = path.join(container, "review");
  git(root, "init", "-b", "main"); git(root, "config", "user.name", "Preparation Test");
  git(root, "config", "user.email", "preparation@example.test"); git(root, "config", "core.autocrlf", "false");
  put(root, "package.json", '{"version":"1.0.0"}\n');
  if (scenario !== "bootstrap") put(root, ".hehehe/verification-policy.json", JSON.stringify(policy));
  git(root, "add", "."); git(root, "commit", "-m", "baseline");
  const base = git(root, "rev-parse", "HEAD");
  git(root, "switch", "-c", "task/feature");
  if (scenario === "bootstrap") put(root, ".hehehe/verification-policy.json", JSON.stringify(policy));
  put(root, "feature.txt", "feature\n"); git(root, "add", "."); git(root, "commit", "-m", "feature");
  if (scenario !== "bootstrap") process.env.HEHEHE_VERIFICATION_BASE = base;
  const options = { project: root, target: "main", reviewPath, sources: ["task/feature"], bootstrapReview: scenario === "bootstrap" };
  let previous = null;
  if (["next", "replacement"].includes(scenario)) {
    previous = prepareDelivery(options); approve(previous);
    if (scenario === "next") mergeDelivery(root);
    else options.replaceCandidate = previous.candidate;
    commit(root, "next.txt", "next candidate\n");
  }
  if (scenario === "existing-main") git(root, "worktree", "add", reviewPath, "main");
  const candidate = git(root, "rev-parse", "HEAD");
  const targetBase = git(root, "rev-parse", "main");
  t.after(() => {
    names.forEach((name) => { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; });
    fs.rmSync(container, { recursive: true, force: true });
  });
  return { root, reviewPath, options, previous, candidate, base, targetBase,
    metadata: path.join(root, ".git/hehehe-delivery/state.json") };
}

function interrupt(f, phase) {
  const rename = fs.renameSync;
  const exec = childProcess.execFileSync;
  let fired = false;
  function fail() { fired = true; throw new Error(`injected preparation interruption: ${phase}`); }
  fs.renameSync = (from, to) => {
    if (!fired && path.resolve(to) === path.resolve(f.metadata)) {
      const record = JSON.parse(fs.readFileSync(from));
      if (phase === "before-intent" && record.status === "preparing") fail();
      if (phase === "after-intent" && record.status === "preparing") { rename(from, to); fail(); }
      if (phase === "before-integrated" && record.status === "integrated") fail();
    }
    return rename(from, to);
  };
  childProcess.execFileSync = (command, args, options) => {
    const result = exec(command, args, options);
    if (!fired && command === "git") {
      const op = args[2];
      if (phase === "after-worktree" && op === "worktree" && args[3] === "add" && args.includes(f.reviewPath)) fail();
      if (phase === "after-detach" && path.resolve(args[1]) === path.resolve(f.reviewPath) && op === "switch" && args[3] === "--detach") fail();
      if (phase === "after-ref" && op === "update-ref" && args[3] === `refs/heads/${reviewBranch}`) fail();
      if (phase === "after-checkout" && path.resolve(args[1]) === path.resolve(f.reviewPath) && op === "switch" && args[3] === reviewBranch) fail();
    }
    return result;
  };
  syncBuiltinESMExports();
  try { assert.throws(() => prepareDelivery(f.options), /injected preparation interruption/); }
  finally { fs.renameSync = rename; childProcess.execFileSync = exec; syncBuiltinESMExports(); }
  assert.equal(fired, true, `missing injection point ${phase}`);
}

for (const scenario of ["initial", "next"]) {
  const phases = scenario === "initial"
    ? ["after-intent", "after-worktree", "after-ref", "before-integrated"]
    : ["after-intent", "after-detach", "after-ref", "after-checkout", "before-integrated"];
  test(`${scenario} preparation survives repeated interruptions at every publication boundary`, (t) => {
    const f = fixture(t, scenario);
    let request;
    for (const phase of phases) {
      interrupt(f, phase);
      const pending = deliveryStatus(f.root);
      request ??= pending.request_id;
      assert.equal(pending.status, "preparing");
      assert.equal(pending.candidate, f.candidate);
      assert.equal(pending.request_id, request, phase);
      assert.equal(git(f.root, "rev-parse", "main"), f.targetBase);
      assert.throws(() => verifyDelivery(f.root), /preparation was interrupted/);
      assert.throws(() => mergeDelivery(f.root), /only a verified/);
    }
    const recovered = scenario === "initial" ? finishDelivery(f.root) : prepareDelivery(f.options);
    assert.equal(recovered.request_id, request);
    assert.equal(recovered.candidate, f.candidate);
    assert.equal(recovered.status, "awaiting_approval");
    assert.equal(git(f.reviewPath, "branch", "--show-current"), reviewBranch);
    assert.equal(git(f.reviewPath, "status", "--porcelain"), "");
    assert.equal(git(f.root, "rev-parse", "main"), f.targetBase);
  });
}

test("failure to persist the first intent leaves refs/checkouts unchanged and prepare can retry", (t) => {
  const f = fixture(t); interrupt(f, "before-intent");
  assert.equal(deliveryStatus(f.root).status, "unconfigured");
  assert.equal(fs.existsSync(f.reviewPath), false);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
  assert.equal(prepareDelivery(f.options).status, "awaiting_approval");
});

test("a previously unregistered main checkout recovers with the same fixed path", (t) => {
  const f = fixture(t, "existing-main"); interrupt(f, "after-detach");
  const state = finishDelivery(f.root);
  assert.equal(state.review_path, f.reviewPath);
  assert.equal(state.status, "awaiting_approval");
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("recovered replacement invalidates old approval and still requires present fresh results", (t) => {
  const f = fixture(t, "replacement"); interrupt(f, "before-integrated");
  const state = finishDelivery(f.root);
  assert.notEqual(state.request_id, f.previous.request_id);
  assert.throws(() => mergeDelivery(f.root), /external user approval/);
  approve(state);
  const now = Date.now; Date.now = () => now() + 3_601_000;
  try { assert.throws(() => mergeDelivery(f.root), /receipt expired/); }
  finally { Date.now = now; }
  const store = path.join(f.root, ".git/hehehe-verification");
  for (const file of fs.readdirSync(store).filter((name) => name.endsWith(".json"))) fs.unlinkSync(path.join(store, file));
  assert.throws(() => mergeDelivery(f.root), /verification has not run/);
  verifyDelivery(f.root);
  assert.equal(mergeDelivery(f.root).main_head, f.candidate);
});

test("preparation recovery preserves dirty checkouts and refuses foreign branches/refs and moved main", (t) => {
  const f = fixture(t); interrupt(f, "before-integrated");
  const before = fs.readFileSync(f.metadata);
  put(f.reviewPath, "feature.txt", "user change\n");
  assert.throws(() => finishDelivery(f.root), /clean committed workspace/);
  assert.equal(fs.readFileSync(path.join(f.reviewPath, "feature.txt"), "utf8"), "user change\n");
  git(f.reviewPath, "restore", "feature.txt");
  git(f.reviewPath, "switch", "-c", "user/other");
  assert.throws(() => finishDelivery(f.root), /review checkout changed/);
  git(f.reviewPath, "switch", reviewBranch);
  git(f.root, "update-ref", `refs/heads/${reviewBranch}`, f.base, f.candidate);
  assert.throws(() => finishDelivery(f.root), /review ref changed/);
  git(f.root, "update-ref", `refs/heads/${reviewBranch}`, f.candidate, f.base);
  git(f.root, "update-ref", "refs/heads/main", f.candidate, f.base);
  assert.throws(() => finishDelivery(f.root), /target moved during preparation/);
  git(f.root, "update-ref", "refs/heads/main", f.base, f.candidate);
  assert.deepEqual(fs.readFileSync(f.metadata), before);
  assert.equal(finishDelivery(f.root).status, "awaiting_approval");
});

test("prepare retry cannot silently substitute changed sources or grant bootstrap authority", (t) => {
  const f = fixture(t); interrupt(f, "after-intent");
  const pending = deliveryStatus(f.root);
  commit(f.root, "later.txt", "later source\n");
  assert.throws(() => prepareDelivery(f.options), /interrupted preparation is frozen/);
  assert.throws(() => prepareDelivery({ project: f.root, bootstrapReview: true }), /bootstrap cannot replace a trusted/);
  assert.equal(finishDelivery(f.root).candidate, pending.candidate);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("verification failure after preparation recovery blocks merge", (t) => {
  const f = fixture(t);
  commit(f.root, "broken.txt", "fail check\n");
  interrupt(f, "before-integrated");
  assert.throws(() => finishDelivery(f.root), /integrated verification failed/);
  const state = deliveryStatus(f.root); approve(state);
  assert.equal(state.status, "verification_failed");
  assert.throws(() => mergeDelivery(f.root), /only a verified/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("recovery cannot authorize protected input changes", (t) => {
  const f = fixture(t);
  const candidate = commit(f.root, "package.json", '{"version":"2.0.0"}\n');
  interrupt(f, "before-integrated");
  assert.throws(() => finishDelivery(f.root), /protected verification inputs changed/);
  assert.equal(deliveryStatus(f.root).status, "integrated");
  assert.equal(process.env.HEHEHE_VERIFICATION_APPROVED_HEAD, undefined);
  process.env.HEHEHE_VERIFICATION_APPROVED_HEAD = candidate; // Explicit fixture operator approval.
  assert.equal(verifyDelivery(f.root).status, "awaiting_approval");
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("recovered first-policy preparation remains provisional until exact bootstrap approval", (t) => {
  const f = fixture(t, "bootstrap"); interrupt(f, "after-intent");
  const state = finishDelivery(f.root); approve(state);
  assert.equal(state.verification_mode, "bootstrap_provisional");
  assert.throws(() => mergeDelivery(f.root), /explicit external bootstrap approval/);
  process.env.HEHEHE_DELIVERY_BOOTSTRAP_APPROVED = state.request_id;
  assert.equal(mergeDelivery(f.root).status, "merged");
});

test("malformed preparation metadata fails before touching the fixed review location", (t) => {
  const f = fixture(t); interrupt(f, "after-intent");
  const state = deliveryStatus(f.root);
  state.preparation.previous_review = "HEAD";
  fs.writeFileSync(f.metadata, JSON.stringify(state));
  assert.throws(() => finishDelivery(f.root), /unsupported preparation recovery state/);
  assert.equal(fs.existsSync(f.reviewPath), false);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("an occupied unregistered review path is preserved during first-preparation recovery", (t) => {
  const f = fixture(t); interrupt(f, "after-intent");
  fs.mkdirSync(f.reviewPath); put(f.reviewPath, "personal.txt", "new user content");
  assert.throws(() => finishDelivery(f.root), /review checkout is missing or occupied/);
  assert.equal(fs.readFileSync(path.join(f.reviewPath, "personal.txt"), "utf8"), "new user content");
  assert.equal(deliveryStatus(f.root).status, "preparing");
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});
