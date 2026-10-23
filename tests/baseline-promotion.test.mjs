import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { baselinePlan, promoteBaseline } from "../plugins/hehehe/skills/resume/scripts/verification-baseline.mjs";
import { prepareDelivery, mergeDelivery, verifyDelivery } from "../plugins/hehehe/skills/resume/scripts/delivery.mjs";
import { trustedContext } from "../plugins/hehehe/skills/resume/scripts/verification-policy.mjs";

const names = ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD", "HEHEHE_DELIVERY_APPROVED_HEAD", "HEHEHE_DELIVERY_APPROVED_TARGET", "HEHEHE_DELIVERY_APPROVAL_ID", "HEHEHE_BASELINE_APPROVED_FROM", "HEHEHE_BASELINE_APPROVED_TO", "HEHEHE_BASELINE_APPROVAL_ID"];
function git(root, ...args) { return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim(); }
function commit(root, file, text) { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), text); git(root, "add", file); git(root, "commit", "-m", "fixture"); return git(root, "rev-parse", "HEAD"); }
function fixture(t) {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  names.forEach((name) => delete process.env[name]);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-baseline-promotion-"));
  const root = path.join(directory, "source"); fs.mkdirSync(root);
  git(root, "init", "-b", "main"); git(root, "config", "user.name", "Baseline Test"); git(root, "config", "user.email", "baseline@example.test"); git(root, "config", "core.autocrlf", "false");
  const policy = { schema_version: 1, max_age_seconds: 3600, checks: [{ id: "required", command: ["$node", "-e", "process.exit(0)"], kind: "exit", timeout_ms: 5000 }], always_required: ["required"], change_rules: [], protected_paths: ["package.json", "tests/**"] };
  commit(root, "package.json", '{"version":"1.0.0"}\n');
  const base = commit(root, ".hehehe/verification-policy.json", JSON.stringify(policy));
  git(root, "switch", "-c", "task/reviewed-update");
  const candidate = commit(root, "package.json", '{"version":"1.0.1"}\n');
  process.env.HEHEHE_VERIFICATION_BASE = base;
  assert.throws(() => prepareDelivery({ project: root, target: "main", reviewPath: path.join(directory, "review"), sources: [candidate] }), /protected verification inputs changed/);
  // Simulate the independent operator's exact protected-input review, never an inferred pass.
  process.env.HEHEHE_VERIFICATION_APPROVED_HEAD = candidate;
  t.after(() => { names.forEach((name) => { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }); fs.rmSync(directory, { recursive: true, force: true }); });
  return { root, base, candidate };
}

test("baseline promotion is separate, exact, post-delivery approval and enables a later ordinary task", (t) => {
  const f = fixture(t);
  const state = verifyDelivery(f.root);
  const plan = baselinePlan(f.root, f.candidate);
  assert.deepEqual(plan.previous_policy, plan.proposed_policy);
  assert.ok(plan.changed_paths.includes("package.json"));
  assert.throws(() => promoteBaseline(f.root, f.candidate), /separate external baseline approval/);
  process.env.HEHEHE_BASELINE_APPROVED_FROM = plan.from;
  process.env.HEHEHE_BASELINE_APPROVED_TO = plan.to;
  process.env.HEHEHE_BASELINE_APPROVAL_ID = plan.request_id;
  assert.throws(() => promoteBaseline(f.root, f.candidate), /already delivered/);
  process.env.HEHEHE_DELIVERY_APPROVED_HEAD = state.candidate;
  process.env.HEHEHE_DELIVERY_APPROVED_TARGET = state.target_base;
  process.env.HEHEHE_DELIVERY_APPROVAL_ID = state.request_id;
  mergeDelivery(f.root);
  process.env.HEHEHE_BASELINE_APPROVAL_ID = "wrong-request";
  assert.throws(() => promoteBaseline(f.root, f.candidate), /separate external baseline approval/);
  process.env.HEHEHE_BASELINE_APPROVAL_ID = plan.request_id;
  const promoted = promoteBaseline(f.root, f.candidate);
  assert.equal(process.env.HEHEHE_VERIFICATION_BASE, f.base, "promotion must not silently repin the running environment");
  assert.equal(promoted.launcher_environment.HEHEHE_VERIFICATION_BASE, f.candidate);
  // A new trusted launcher explicitly uses the separately approved baseline for the next run.
  process.env.HEHEHE_VERIFICATION_BASE = promoted.launcher_environment.HEHEHE_VERIFICATION_BASE;
  delete process.env.HEHEHE_VERIFICATION_APPROVED_HEAD;
  commit(f.root, "README.md", "next documentation task\n");
  assert.doesNotThrow(() => trustedContext(f.root));
  fs.writeFileSync(path.join(f.root, "package.json"), '{"version":"unreviewed"}\n');
  assert.throws(() => trustedContext(f.root), /protected verification inputs changed/);
});
