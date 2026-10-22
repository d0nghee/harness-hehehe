import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { prepareDelivery, verifyDelivery, mergeDelivery, finishDelivery, deliveryStatus } from "../plugins/hehehe/skills/resume/scripts/delivery.mjs";

const policy = { schema_version: 1, max_age_seconds: 3600,
  checks: [{ id: "contract", command: ["$node", "-e", 'if(require("fs").existsSync("broken.txt")) process.exit(1)'], kind: "exit", timeout_ms: 5000 }],
  always_required: ["contract"], change_rules: [], protected_paths: ["tests/**", "package.json"] };
const approvalNames = ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD", "HEHEHE_DELIVERY_APPROVED_HEAD",
  "HEHEHE_DELIVERY_APPROVED_TARGET", "HEHEHE_DELIVERY_APPROVAL_ID", "HEHEHE_DELIVERY_BOOTSTRAP_APPROVED"];

function git(root, ...args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
}

function commit(root, file, contents, message = "fixture change") {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), contents);
  git(root, "add", file);
  git(root, "commit", "-m", message);
  return git(root, "rev-parse", "HEAD");
}

function fixture(t, bootstrap = false) {
  const saved = Object.fromEntries(approvalNames.map((name) => [name, process.env[name]]));
  approvalNames.forEach((name) => delete process.env[name]);
  const container = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-delivery-test-"));
  const root = path.join(container, "repo");
  const reviewPath = path.join(container, "review");
  fs.mkdirSync(root);
  git(root, "init", "-b", "main");
  git(root, "config", "user.name", "Delivery Test");
  git(root, "config", "user.email", "delivery@example.test");
  git(root, "config", "core.autocrlf", "false");
  commit(root, "base.txt", "base\n");
  if (!bootstrap) commit(root, ".hehehe/verification-policy.json", JSON.stringify(policy), "reviewed verification baseline");
  const base = git(root, "rev-parse", "HEAD");
  git(root, "switch", "-c", "task/feature");
  if (bootstrap) commit(root, ".hehehe/verification-policy.json", JSON.stringify(policy), "proposed initial baseline");
  const candidate = commit(root, "feature.txt", "feature\n");
  if (!bootstrap) process.env.HEHEHE_VERIFICATION_BASE = base;
  t.after(() => {
    approvalNames.forEach((name) => {
      if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name];
    });
    fs.rmSync(container, { recursive: true, force: true });
  });
  const prepare = (overrides = {}) => prepareDelivery({ project: root, target: "main", reviewPath,
    sources: ["task/feature"], bootstrapReview: bootstrap, ...overrides });
  return { root, base, candidate, reviewPath, prepare };
}

function approve(state) {
  process.env.HEHEHE_DELIVERY_APPROVED_HEAD = state.candidate;
  process.env.HEHEHE_DELIVERY_APPROVED_TARGET = state.target_base;
  process.env.HEHEHE_DELIVERY_APPROVAL_ID = state.request_id;
}

test("integration publishes one verified review checkout without moving main", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  assert.equal(state.status, "awaiting_approval");
  assert.equal(state.review_path, f.reviewPath);
  assert.equal(git(f.reviewPath, "rev-parse", "HEAD"), state.candidate);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
  assert.equal(fs.readFileSync(path.join(f.reviewPath, "feature.txt"), "utf8"), "feature\n");
  assert.equal(deliveryStatus(f.root).request_id, state.request_id);
  assert.throws(() => mergeDelivery(f.root), /external user approval/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("exact approval fast-forwards main and leaves the same review path on main", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  approve(state);
  const merged = mergeDelivery(f.root);
  assert.equal(merged.status, "merged");
  assert.equal(git(f.root, "rev-parse", "main"), state.candidate);
  assert.equal(git(f.reviewPath, "branch", "--show-current"), "main");
  assert.equal(git(f.reviewPath, "status", "--porcelain"), "");
});

test("approval cannot authorize another candidate, target or request", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  approve(state);
  process.env.HEHEHE_DELIVERY_APPROVAL_ID = "old-approval";
  assert.throws(() => mergeDelivery(f.root), /external user approval/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("a pending review is frozen and its location cannot drift", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  assert.throws(() => f.prepare(), /pending review is frozen/);
  assert.throws(() => f.prepare({ reviewPath: path.join(path.dirname(f.root), "another"), replaceCandidate: state.candidate }), /pinned/);
  assert.equal(git(f.reviewPath, "rev-parse", "HEAD"), state.candidate);
});

test("failed integrated checks cannot be approved or merged", (t) => {
  const f = fixture(t);
  commit(f.root, "broken.txt", "bad\n");
  assert.throws(() => f.prepare(), /integrated verification failed/);
  const state = deliveryStatus(f.root);
  assert.equal(state.status, "verification_failed");
  approve(state);
  assert.throws(() => mergeDelivery(f.root), /only a verified/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("dirty or changed review content blocks merge despite approval", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  approve(state);
  fs.writeFileSync(path.join(f.reviewPath, "feature.txt"), "changed after review\n");
  assert.throws(() => mergeDelivery(f.root), /clean committed workspace/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("main advancement invalidates an outstanding approval", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  approve(state);
  git(f.root, "update-ref", "refs/heads/main", state.candidate, f.base);
  assert.throws(() => mergeDelivery(f.root), /target moved/);
});

test("multiple agent branches are merged and verified as one candidate", (t) => {
  const f = fixture(t);
  git(f.root, "switch", "-c", "task/other", f.base);
  commit(f.root, "other.txt", "other agent\n");
  const state = f.prepare({ sources: ["task/feature", "task/other"] });
  assert.equal(state.source_commits.length, 2);
  assert.equal(fs.readFileSync(path.join(f.reviewPath, "other.txt"), "utf8"), "other agent\n");
  assert.equal(fs.readFileSync(path.join(f.reviewPath, "feature.txt"), "utf8"), "feature\n");
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
});

test("merge conflicts leave main and existing review untouched", (t) => {
  const f = fixture(t);
  commit(f.root, "base.txt", "agent A\n");
  git(f.root, "switch", "-c", "task/conflict", f.base);
  commit(f.root, "base.txt", "agent B\n");
  assert.throws(() => f.prepare({ sources: ["task/feature", "task/conflict"] }), /source integration failed/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
  assert.equal(fs.existsSync(f.reviewPath), false);
});

test("uncommitted source work is never silently omitted", (t) => {
  const f = fixture(t);
  fs.writeFileSync(path.join(f.root, "feature.txt"), "not committed\n");
  assert.throws(() => f.prepare(), /clean committed workspace/);
  assert.equal(fs.existsSync(f.reviewPath), false);
});

test("first-baseline preview is provisional and requires separate bootstrap approval", (t) => {
  const f = fixture(t, true);
  const state = f.prepare();
  assert.equal(state.verification_mode, "bootstrap_provisional");
  approve(state);
  assert.throws(() => mergeDelivery(f.root), /explicit external bootstrap approval/);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
  process.env.HEHEHE_DELIVERY_BOOTSTRAP_APPROVED = state.request_id;
  assert.equal(mergeDelivery(f.root).status, "merged");
  assert.equal(git(f.reviewPath, "branch", "--show-current"), "main");
});

test("bootstrap cannot be used to bypass an established target policy", (t) => {
  const f = fixture(t);
  assert.throws(() => f.prepare({ bootstrapReview: true }), /cannot bypass/);
  delete process.env.HEHEHE_VERIFICATION_BASE;
  assert.throws(() => f.prepare(), /trusted baseline required/);
});

test("next task reuses the same review path and preserves main until approval", (t) => {
  const f = fixture(t);
  const first = f.prepare();
  approve(first);
  mergeDelivery(f.root);
  commit(f.root, "next.txt", "next task\n");
  const next = f.prepare();
  assert.equal(next.review_path, first.review_path);
  assert.notEqual(next.candidate, first.candidate);
  assert.notEqual(next.request_id, first.request_id);
  assert.equal(git(f.root, "rev-parse", "main"), first.candidate);
  assert.throws(() => mergeDelivery(f.root), /external user approval/);
});

test("reverification is possible without changing the candidate or approval identity", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  const checked = verifyDelivery(f.root);
  assert.equal(checked.candidate, state.candidate);
  assert.equal(checked.request_id, state.request_id);
  assert.equal(checked.status, "awaiting_approval");
});

test("existing main checkout can be the single fixed review directory", (t) => {
  const f = fixture(t);
  git(f.root, "switch", "main");
  const state = f.prepare({ reviewPath: f.root });
  assert.equal(state.review_path, f.root);
  assert.equal(git(f.root, "rev-parse", "main"), f.base);
  approve(state);
  assert.equal(mergeDelivery(f.root).status, "merged");
  assert.equal(git(f.root, "branch", "--show-current"), "main");
});

test("expired delivery evidence blocks merge until the unchanged candidate is reverified", async (t) => {
  const f = fixture(t);
  const shortPolicy = { ...policy, max_age_seconds: 3 };
  git(f.root, "switch", "main");
  const base = commit(f.root, ".hehehe/verification-policy.json", JSON.stringify(shortPolicy));
  git(f.root, "switch", "task/feature");
  git(f.root, "merge", "--no-edit", "main");
  process.env.HEHEHE_VERIFICATION_BASE = base;
  const state = f.prepare();
  approve(state);
  await new Promise((resolve) => setTimeout(resolve, 3100));
  assert.throws(() => mergeDelivery(f.root), /receipt expired/);
  assert.equal(git(f.root, "rev-parse", "main"), base);
  verifyDelivery(f.root);
  assert.equal(mergeDelivery(f.root).status, "merged");
});

test("dirty review is never overwritten during interrupted-checkout recovery", (t) => {
  const f = fixture(t);
  const state = f.prepare();
  git(f.root, "update-ref", "refs/heads/main", state.candidate, f.base);
  const metadata = path.join(f.root, ".git/hehehe-delivery/state.json");
  fs.writeFileSync(metadata, JSON.stringify({ ...state, status: "main_updated_checkout_pending", approved_candidate: state.candidate }));
  fs.writeFileSync(path.join(f.reviewPath, "feature.txt"), "manual edits\n");
  assert.throws(() => finishDelivery(f.root), /clean committed workspace/);
  git(f.reviewPath, "restore", "feature.txt");
  assert.equal(finishDelivery(f.root).status, "merged");
  assert.equal(git(f.reviewPath, "branch", "--show-current"), "main");
});
