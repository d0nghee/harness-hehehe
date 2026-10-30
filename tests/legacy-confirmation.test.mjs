import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { PassThrough, Writable } from "node:stream";
import test from "node:test";
import { installProject, uninstallProject } from "../lib/installer.mjs";
import { confirmLegacyRemoval } from "../lib/confirmation.mjs";

const root = path.resolve(import.meta.dirname, "..");
const sourcePluginDir = path.join(root, "plugins/hehehe");
const cli = path.join(root, "bin/hehehe.mjs");
async function fixture(t, modern = false) {
  const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-confirmation-"));
  t.after(() => fs.rmSync(projectDir, { recursive: true, force: true }));
  if (modern) await installProject({ sourcePluginDir, projectDir });
  const target = path.join(projectDir, "plugins/hehehe");
  fs.mkdirSync(path.join(target, ".codex-plugin"), { recursive: true });
  fs.writeFileSync(path.join(target, ".codex-plugin/plugin.json"), '{"name":"hehehe","version":"0.3.2"}');
  const git = (...args) => execFileSync("git", ["-C", target, ...args], { windowsHide: true, stdio: "pipe" });
  git("init", "-b", "main"); git("config", "user.name", "Confirmation Fixture");
  git("config", "user.email", "confirmation@example.test");
  // Keep Git's background work from changing metadata during full-file snapshots.
  git("config", "maintenance.auto", "false");
  git("config", "gc.auto", "0");
  fs.writeFileSync(path.join(target, "personal.txt"), "committed work\n");
  git("add", "."); git("commit", "-m", "fixture");
  fs.appendFileSync(path.join(target, "personal.txt"), "uncommitted work\n");
  const marketplacePath = path.join(projectDir, ".agents/plugins/marketplace.json");
  fs.mkdirSync(path.dirname(marketplacePath), { recursive: true });
  const other = { name: "other", source: { source: "local", path: "./plugins/other" } };
  const legacy = { name: "hehehe", source: { source: "local", path: "./plugins/hehehe" },
    policy: { installation: "INSTALLED_BY_DEFAULT", authentication: "ON_INSTALL" }, category: "Productivity" };
  fs.writeFileSync(marketplacePath, JSON.stringify({ name: "project-local", plugins: [other, legacy] }));
  return { projectDir, target, marketplacePath, other, options: { sourcePluginDir, projectDir } };
}
function snapshot(directory, relative = "") {
  return Object.fromEntries(fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name), key = path.join(relative, entry.name);
    return entry.isDirectory() ? Object.entries(snapshot(file, key)) : [[key, fs.readFileSync(file).toString("base64")]];
  }));
}
function command(f, operation, ...args) {
  return spawnSync(process.execPath, [cli, operation, "--project", f.projectDir, ...args],
    { encoding: "utf8", windowsHide: true, input: "yes\n" });
}

for (const operation of ["install", "uninstall"]) {
  const run = operation === "install" ? installProject : uninstallProject;
  test(`${operation}: missing, rejected, non-boolean and errored confirmation preserve all project files`, async (t) => {
    const f = await fixture(t, operation === "uninstall");
    const before = snapshot(f.projectDir);
    for (const confirm of [undefined, () => false, () => "yes", () => { throw new Error("confirmation failed"); }]) {
      await assert.rejects(run({ ...f.options, confirmLegacyRemoval: confirm }), /not confirmed|confirmation failed/);
      assert.deepEqual(snapshot(f.projectDir), before);
    }
    assert.match(fs.readFileSync(path.join(f.target, "personal.txt"), "utf8"), /uncommitted work/);
    assert.equal(fs.existsSync(path.join(f.target, ".git/HEAD")), true);
  });
  test(`${operation}: one explicit confirmation allows whole-folder removal and preserves other registrations`, async (t) => {
    const f = await fixture(t, operation === "uninstall");
    const before = snapshot(f.projectDir);
    let calls = 0;
    await run({ ...f.options, confirmLegacyRemoval: async (plan) => {
      calls += 1;
      assert.equal(plan.target, f.target);
      assert.equal(plan.operation, operation === "install" ? "migration" : "uninstall");
      assert.equal(Object.isFrozen(plan), true);
      assert.deepEqual(snapshot(f.projectDir), { ...before,
        // The process lock is the only temporary file allowed before the decision.
        [path.join(".agents", ".hehehe-installer", "lock", "owner.json")]: fs.readFileSync(path.join(f.projectDir, ".agents/.hehehe-installer/lock/owner.json")).toString("base64"),
      });
      return true;
    } });
    assert.equal(calls, 1);
    assert.equal(fs.existsSync(f.target), false);
    assert.deepEqual(JSON.parse(fs.readFileSync(f.marketplacePath)).plugins, [f.other]);
    assert.equal(fs.existsSync(path.join(f.projectDir, ".agents/skills/hehehe-review/SKILL.md")), operation === "install");
  });
  test(`${operation}: dry-run reports the target and never asks for confirmation or changes files`, async (t) => {
    const f = await fixture(t, operation === "uninstall"), before = snapshot(f.projectDir);
    const result = await run({ ...f.options, dryRun: true, confirmLegacyRemoval: () => { throw new Error("must not prompt"); } });
    assert.equal(result.legacyRemoval.target, f.target);
    assert.deepEqual(snapshot(f.projectDir), before);
    const cliResult = command(f, operation, "--dry-run");
    assert.equal(cliResult.status, 0, cliResult.stderr);
    assert.ok(cliResult.stdout.includes(f.target));
    assert.match(cliResult.stdout, /confirmation required/);
    assert.deepEqual(snapshot(f.projectDir), before);
  });
  test(`${operation}: CLI rejects piped yes and a wrong path, and accepts only the explicitly approved target`, async (t) => {
    const f = await fixture(t, operation === "uninstall"), before = snapshot(f.projectDir);
    const missing = command(f, operation);
    assert.notEqual(missing.status, 0);
    assert.match(missing.stderr, /needs user confirmation/);
    assert.deepEqual(snapshot(f.projectDir), before);
    const wrong = command(f, operation, "--confirm-legacy-removal", path.join(f.projectDir, "other"));
    assert.notEqual(wrong.status, 0);
    assert.match(wrong.stderr, /exact absolute target/);
    assert.deepEqual(snapshot(f.projectDir), before);
    const approved = command(f, operation, "--confirm-legacy-removal", f.target);
    assert.equal(approved.status, 0, approved.stderr);
    assert.equal(fs.existsSync(f.target), false);
    assert.deepEqual(JSON.parse(fs.readFileSync(f.marketplacePath)).plugins, [f.other]);
  });
}

test("missing legacy folder and unrelated same-name folder never require deletion consent", async (t) => {
  const f = await fixture(t);
  // Remove only this known temporary fixture target, retaining the stale registration.
  fs.rmSync(f.target, { recursive: true });
  await installProject({ ...f.options, confirmLegacyRemoval: () => { throw new Error("no folder to delete"); } });
  fs.mkdirSync(f.target);
  fs.writeFileSync(path.join(f.target, "personal.txt"), "unowned");
  await uninstallProject({ projectDir: f.projectDir, confirmLegacyRemoval: () => { throw new Error("not managed"); } });
  assert.equal(fs.readFileSync(path.join(f.target, "personal.txt"), "utf8"), "unowned");
});

test("CLI rejects blanket, relative, missing and global legacy removal approvals", () => {
  for (const args of [["install", "--project", "--confirm-legacy-removal"],
    ["install", "--project", "--confirm-legacy-removal", "relative/path"],
    ["uninstall", "--global", "--confirm-legacy-removal", root],
    ["install", "--project", "--yes"]]) {
    const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", windowsHide: true });
    assert.notEqual(result.status, 0);
  }
});

test("interactive confirmation displays the deletion scope and defaults to No, including EOF", async () => {
  const plan = { target: path.join(os.tmpdir(), "legacy-target"), operation: "migration" };
  for (const [answer, expected] of [["y\n", true], ["YES\n", true], ["\n", false], ["no\n", false], [null, false]]) {
    const input = new PassThrough(); input.isTTY = true;
    let prompt = "";
    const output = new Writable({ write(chunk, encoding, done) { prompt += chunk; done(); } }); output.isTTY = true;
    const decision = confirmLegacyRemoval(plan, { input, output });
    if (answer === null) input.end(); else input.write(answer);
    assert.equal(await decision, expected);
    assert.ok(prompt.includes(plan.target));
    assert.match(prompt, /Git history.*uncommitted.*personal/);
    assert.match(prompt, /\[y\/N\]/);
    input.destroy(); output.destroy();
  }
});

test("confirmation cannot be reused automatically by a later invocation", async (t) => {
  const f = await fixture(t);
  await installProject({ ...f.options, confirmLegacyRemoval: () => true });
  fs.mkdirSync(path.join(f.target, ".codex-plugin"), { recursive: true });
  fs.writeFileSync(path.join(f.target, ".codex-plugin/plugin.json"), '{"name":"hehehe","version":"0.3.2"}');
  const marketplace = JSON.parse(fs.readFileSync(f.marketplacePath));
  marketplace.plugins.push({ name: "hehehe", source: { source: "local", path: "./plugins/hehehe" },
    policy: { installation: "INSTALLED_BY_DEFAULT", authentication: "ON_INSTALL" }, category: "Productivity" });
  fs.writeFileSync(f.marketplacePath, JSON.stringify(marketplace));
  const before = snapshot(f.projectDir);
  await assert.rejects(uninstallProject({ projectDir: f.projectDir }), /not confirmed/);
  assert.deepEqual(snapshot(f.projectDir), before);
});
