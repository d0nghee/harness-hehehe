import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { installGlobal, uninstallGlobal } from "../lib/installer.mjs";
import { buildPlan, createWorktree } from "../plugins/hehehe/skills/resume/scripts/worktree-isolation.mjs";
import { prepareDelivery, verifyDelivery, mergeDelivery, deliveryStatus } from "../plugins/hehehe/skills/resume/scripts/delivery.mjs";
import { baselinePlan, promoteBaseline } from "../plugins/hehehe/skills/resume/scripts/verification-baseline.mjs";

const plugin = path.resolve(import.meta.dirname, "../plugins/hehehe");
const markerRelative = ".codex-plugin/hehehe-installation.json";
function temporary(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-followup-safety-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
function write(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, value); }
function paths(homeDir) {
  return { target: path.join(homeDir, "plugins/hehehe"), marketplace: path.join(homeDir, ".agents/plugins/marketplace.json") };
}
const entry = { name: "hehehe", source: { source: "local", path: "./plugins/hehehe" },
  policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" }, category: "Productivity" };
function register(homeDir, entries = [entry]) {
  write(paths(homeDir).marketplace, JSON.stringify({ name: "user-local", plugins: entries }));
}

test("global install and uninstall preserve an unowned same-name folder, including dry runs", async (t) => {
  const homeDir = temporary(t);
  const { target, marketplace } = paths(homeDir);
  write(path.join(target, "personal.txt"), "personal data");
  for (const dryRun of [true, false]) {
    await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false, dryRun }), /unmanaged global plugin/);
    await assert.rejects(uninstallGlobal({ homeDir, deactivate: false, dryRun }), /unmanaged global plugin/);
    assert.equal(fs.readFileSync(path.join(target, "personal.txt"), "utf8"), "personal data");
    assert.equal(fs.existsSync(marketplace), false);
  }
});

test("a matching plugin manifest alone does not grant global ownership", async (t) => {
  const homeDir = temporary(t);
  const { target } = paths(homeDir);
  write(path.join(target, ".codex-plugin/plugin.json"), '{"name":"hehehe","version":"0.3.14"}');
  write(path.join(target, "personal.txt"), "keep");
  await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /unmanaged global plugin/);
  await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /unmanaged global plugin/);
  assert.equal(fs.readFileSync(path.join(target, "personal.txt"), "utf8"), "keep");
});

test("global operations reject foreign and duplicate hehehe marketplace entries before any mutation", async (t) => {
  for (const entries of [[{ ...entry, source: { source: "local", path: "./personal-plugin" } }], [entry, entry]]) {
    const homeDir = temporary(t);
    register(homeDir, entries);
    const before = fs.readFileSync(paths(homeDir).marketplace, "utf8");
    await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /unmanaged or ambiguous/);
    await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /unmanaged or ambiguous/);
    assert.equal(fs.readFileSync(paths(homeDir).marketplace, "utf8"), before);
    assert.equal(fs.existsSync(paths(homeDir).target), false);
  }
});

test("managed global installs can upgrade and uninstall while preserving unrelated registrations", async (t) => {
  const homeDir = temporary(t);
  const unrelated = { name: "other", source: { source: "local", path: "./plugins/other" } };
  register(homeDir, [unrelated]);
  const installed = await installGlobal({ sourcePluginDir: plugin, homeDir, activate: false });
  assert.equal(installed.ownership, "absent");
  const marker = JSON.parse(fs.readFileSync(path.join(installed.targetPluginDir, markerRelative)));
  assert.equal(marker.target, fs.realpathSync(installed.targetPluginDir));
  write(path.join(installed.targetPluginDir, "stale.txt"), "obsolete managed content");
  assert.equal((await installGlobal({ sourcePluginDir: plugin, homeDir, activate: false })).ownership, "managed");
  assert.equal(fs.existsSync(path.join(installed.targetPluginDir, "stale.txt")), false);
  assert.equal((await uninstallGlobal({ homeDir, deactivate: false })).ownership, "managed");
  assert.equal(fs.existsSync(installed.targetPluginDir), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(installed.marketplacePath)).plugins, [unrelated]);
});

test("registered legacy plugin payloads are recognized conservatively for upgrade and uninstall", async (t) => {
  for (const operation of ["upgrade", "uninstall"]) {
    const homeDir = temporary(t);
    const { target } = paths(homeDir);
    fs.cpSync(plugin, target, { recursive: true });
    register(homeDir);
    if (operation === "upgrade") {
      assert.equal((await installGlobal({ sourcePluginDir: plugin, homeDir, activate: false })).ownership, "legacy");
      assert.equal(fs.existsSync(path.join(target, markerRelative)), true);
    } else {
      assert.equal((await uninstallGlobal({ homeDir, deactivate: false })).ownership, "legacy");
      assert.equal(fs.existsSync(target), false);
    }
  }
});

test("legacy registration cannot authorize deleting extra personal paths", async (t) => {
  const homeDir = temporary(t);
  const { target, marketplace } = paths(homeDir);
  fs.cpSync(plugin, target, { recursive: true });
  register(homeDir);
  write(path.join(target, "skills/review/private-notes.txt"), "keep");
  const before = fs.readFileSync(marketplace, "utf8");
  await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /unmanaged global plugin/);
  await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /unmanaged global plugin/);
  assert.equal(fs.readFileSync(path.join(target, "skills/review/private-notes.txt"), "utf8"), "keep");
  assert.equal(fs.readFileSync(marketplace, "utf8"), before);
});

test("a copied or malformed ownership marker cannot claim another global folder", async (t) => {
  const homeDir = temporary(t);
  await installGlobal({ sourcePluginDir: plugin, homeDir, activate: false });
  const marker = path.join(paths(homeDir).target, markerRelative);
  for (const value of ["invalid JSON", JSON.stringify({ schemaVersion: 1, plugin: "hehehe", target: "another-folder" })]) {
    write(marker, value);
    await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /Invalid global installation ownership/);
    await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /Invalid global installation ownership/);
    assert.equal(fs.existsSync(paths(homeDir).target), true);
  }
});

test("a Git checkout is preserved even when it carries a managed marker", async (t) => {
  const homeDir = temporary(t);
  await installGlobal({ sourcePluginDir: plugin, homeDir, activate: false });
  write(path.join(paths(homeDir).target, ".git"), "gitdir: personal-checkout");
  await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /unsafe global plugin contents/);
  await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /unsafe global plugin contents/);
  assert.equal(fs.readFileSync(path.join(paths(homeDir).target, ".git"), "utf8"), "gitdir: personal-checkout");
});

test("global target and marketplace ancestors cannot traverse a junction", async (t) => {
  for (const parent of ["plugins", ".agents"]) {
    const homeDir = temporary(t);
    const outside = temporary(t);
    fs.symlinkSync(outside, path.join(homeDir, parent), "junction");
    write(path.join(outside, "personal.txt"), "keep");
    await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /symbolic link or junction/);
    await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /symbolic link or junction/);
    assert.deepEqual(fs.readdirSync(outside), ["personal.txt"]);
  }
});

test("uninstalling a never-installed empty home is a no-op", async (t) => {
  const homeDir = temporary(t);
  assert.equal((await uninstallGlobal({ homeDir, deactivate: false })).ownership, "absent");
  assert.deepEqual(fs.readdirSync(homeDir), []);
});

test("linked payload children cannot be installed or removed through an ownership marker", async (t) => {
  const homeDir = temporary(t);
  const source = path.join(temporary(t), "source");
  fs.cpSync(plugin, source, { recursive: true });
  const outside = temporary(t);
  write(path.join(outside, "personal.txt"), "keep");
  fs.symlinkSync(outside, path.join(source, "linked"), "junction");
  await assert.rejects(installGlobal({ sourcePluginDir: source, homeDir, activate: false }), /unsafe global plugin contents/);
  assert.deepEqual(fs.readdirSync(homeDir), []);
  await installGlobal({ sourcePluginDir: plugin, homeDir, activate: false });
  fs.symlinkSync(outside, path.join(paths(homeDir).target, "linked"), "junction");
  await assert.rejects(installGlobal({ sourcePluginDir: plugin, homeDir, activate: false }), /unsafe global plugin contents/);
  await assert.rejects(uninstallGlobal({ homeDir, deactivate: false }), /unsafe global plugin contents/);
  assert.deepEqual(fs.readdirSync(outside), ["personal.txt"]);
});

function git(root, ...args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function commit(root, file, text) {
  write(path.join(root, file), text); git(root, "add", file); git(root, "commit", "-m", "fixture");
  return git(root, "rev-parse", "HEAD");
}
function repo(t) {
  const directory = temporary(t);
  const root = path.join(directory, "repo"); fs.mkdirSync(root);
  git(root, "init", "-b", "main"); git(root, "config", "user.name", "Followup Test");
  git(root, "config", "user.email", "followup@example.test"); git(root, "config", "core.autocrlf", "false");
  const initial = commit(root, "base.txt", "base\n");
  return { root, directory, initial };
}

test("an unregistered existing branch reports its own HEAD and preserves the requested base separately", async (t) => {
  const f = repo(t);
  git(f.root, "branch", "task/old", f.initial);
  const main = commit(f.root, "new.txt", "advanced main\n");
  const options = { projectDir: f.root, task: "Continue existing task", branch: "task/old", baseRef: "main", worktreePath: path.join(f.directory, "task") };
  const planned = await buildPlan(options);
  assert.equal(planned.task_workspace.base_commit, f.initial);
  assert.equal(planned.task_workspace.base_ref, "refs/heads/task/old");
  assert.equal(planned.task_workspace.requested_base_commit, main);
  const created = await createWorktree(options);
  assert.equal(created.registered_worktree.head, created.task_workspace.base_commit);
  assert.equal(git(created.task_workspace.worktree, "rev-parse", "HEAD"), f.initial);
  assert.equal(git(f.root, "rev-parse", "main"), main);
  const resumed = await buildPlan({ ...options, projectDir: created.task_workspace.worktree });
  assert.equal(resumed.action, "reuse");
  assert.equal(resumed.task_workspace.base_commit, f.initial);
});

const envNames = ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD", "HEHEHE_DELIVERY_APPROVED_HEAD", "HEHEHE_DELIVERY_APPROVED_TARGET", "HEHEHE_DELIVERY_APPROVAL_ID", "HEHEHE_BASELINE_APPROVED_FROM", "HEHEHE_BASELINE_APPROVED_TO", "HEHEHE_BASELINE_APPROVAL_ID"];
function delivered(t) {
  const saved = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  envNames.forEach((name) => delete process.env[name]);
  t.after(() => envNames.forEach((name) => { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; }));
  const f = repo(t);
  const policy = { schema_version: 1, max_age_seconds: 3600,
    checks: [{ id: "required", command: ["$node", "-e", 'if(require("fs").existsSync("../fail-check"))process.exit(1)'], kind: "exit", timeout_ms: 5000 }],
    always_required: ["required"], change_rules: [], protected_paths: ["package.json"] };
  commit(f.root, "package.json", '{"version":"1.0.0"}\n');
  const base = commit(f.root, ".hehehe/verification-policy.json", JSON.stringify(policy));
  git(f.root, "switch", "-c", "task/update");
  const candidate = commit(f.root, "package.json", '{"version":"1.0.1"}\n');
  process.env.HEHEHE_VERIFICATION_BASE = base;
  process.env.HEHEHE_VERIFICATION_APPROVED_HEAD = candidate; // Fixture's simulated operator decision.
  const state = prepareDelivery({ project: f.root, target: "main", reviewPath: path.join(f.directory, "review"), sources: [candidate] });
  process.env.HEHEHE_DELIVERY_APPROVED_HEAD = candidate;
  process.env.HEHEHE_DELIVERY_APPROVED_TARGET = state.target_base;
  process.env.HEHEHE_DELIVERY_APPROVAL_ID = state.request_id;
  mergeDelivery(f.root);
  const plan = baselinePlan(f.root, candidate);
  process.env.HEHEHE_BASELINE_APPROVED_FROM = plan.from;
  process.env.HEHEHE_BASELINE_APPROVED_TO = plan.to;
  process.env.HEHEHE_BASELINE_APPROVAL_ID = plan.request_id;
  return { ...f, base, candidate, state, plan };
}

test("expired merged evidence can be refreshed under the old policy before separately approved promotion", (t) => {
  const f = delivered(t);
  const RealDate = Date;
  globalThis.Date = class extends RealDate {
    constructor(...args) { super(...(args.length ? args : [RealDate.now() + 3_601_000])); }
    static now() { return RealDate.now() + 3_601_000; }
  };
  let refreshed;
  try {
    assert.throws(() => promoteBaseline(f.root, f.candidate), /receipt expired/);
    refreshed = verifyDelivery(f.root);
    assert.equal(promoteBaseline(f.root, f.candidate).to, f.candidate);
  } finally { globalThis.Date = RealDate; }
  assert.equal(refreshed.status, "merged");
  assert.equal(refreshed.verification_status, "pass");
  assert.equal(refreshed.request_id, f.state.request_id);
  assert.equal(refreshed.target_base, f.state.target_base);
  assert.equal(refreshed.verification_base, f.base);
  assert.equal(baselinePlan(f.root, f.candidate).request_id, f.plan.request_id);
  assert.equal(process.env.HEHEHE_VERIFICATION_BASE, f.base);
  assert.equal(git(f.state.review_path, "branch", "--show-current"), "main");
  assert.equal(git(f.state.review_path, "status", "--porcelain"), "");
  process.env.HEHEHE_BASELINE_APPROVAL_ID = "wrong";
  assert.throws(() => promoteBaseline(f.root, f.candidate), /separate external baseline approval/);
});

test("failed or missing post-merge checks still block baseline promotion without reopening delivery", (t) => {
  const f = delivered(t);
  write(path.join(f.directory, "fail-check"), "fail");
  assert.throws(() => verifyDelivery(f.root), /integrated verification failed/);
  assert.equal(deliveryStatus(f.root).status, "merged");
  assert.equal(deliveryStatus(f.root).verification_status, "fail");
  assert.throws(() => promoteBaseline(f.root, f.candidate), /required verification failed/);
  const receipts = path.join(f.root, ".git/hehehe-verification");
  for (const file of fs.readdirSync(receipts).filter((file) => file.endsWith(".json"))) fs.unlinkSync(path.join(receipts, file));
  assert.throws(() => promoteBaseline(f.root, f.candidate), /verification has not run/);
  fs.unlinkSync(path.join(f.directory, "fail-check"));
  verifyDelivery(f.root);
  assert.equal(promoteBaseline(f.root, f.candidate).to, f.candidate);
});

test("post-merge refresh rejects moved target, changed review source and missing exact-head input approval", (t) => {
  const f = delivered(t);
  const before = fs.readFileSync(path.join(f.root, ".git/hehehe-delivery/state.json"), "utf8");
  write(path.join(f.state.review_path, "base.txt"), "dirty\n");
  assert.throws(() => verifyDelivery(f.root), /clean committed workspace/);
  assert.throws(() => promoteBaseline(f.root, f.candidate), /stale verification/);
  git(f.state.review_path, "restore", "base.txt");
  delete process.env.HEHEHE_VERIFICATION_APPROVED_HEAD;
  assert.throws(() => verifyDelivery(f.root), /protected verification inputs changed/);
  process.env.HEHEHE_VERIFICATION_APPROVED_HEAD = f.candidate;
  const moved = commit(f.state.review_path, "later.txt", "new main\n");
  assert.notEqual(moved, f.candidate);
  assert.throws(() => verifyDelivery(f.root), /review candidate changed|target moved/);
  assert.throws(() => promoteBaseline(f.root, f.candidate), /already delivered/);
  assert.equal(fs.readFileSync(path.join(f.root, ".git/hehehe-delivery/state.json"), "utf8"), before);
  assert.equal(git(f.root, "rev-parse", "main"), moved);
});
