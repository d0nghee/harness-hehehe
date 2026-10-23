import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { syncBuiltinESMExports } from "node:module";
import test from "node:test";
import { installGlobal, installProject } from "../lib/installer.mjs";

const plugin = path.resolve(import.meta.dirname, "../plugins/hehehe");
function fixture(t) {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-installer-recovery-"));
  t.after(() => fs.rmSync(homeDir, { recursive: true, force: true }));
  const target = path.join(homeDir, "plugins/hehehe");
  const marketplace = path.join(homeDir, ".agents/plugins/marketplace.json");
  const install = () => installGlobal({ sourcePluginDir: plugin, homeDir, activate: false });
  return { homeDir, target, marketplace, install };
}
async function intercept(changes, callback) {
  const originals = Object.fromEntries(Object.keys(changes).map((key) => [key, fsp[key]]));
  for (const [key, wrapper] of Object.entries(changes)) fsp[key] = wrapper(originals[key]);
  syncBuiltinESMExports();
  try { return await callback(); }
  finally { Object.assign(fsp, originals); syncBuiltinESMExports(); }
}
function fault() { return Object.assign(new Error("injected filesystem failure"), { code: "EACCES" }); }
function backups(target) {
  return fs.readdirSync(path.dirname(target)).filter((name) => name.startsWith(`${path.basename(target)}.backup-`))
    .map((name) => path.join(path.dirname(target), name));
}

test("failed replacement and rollback retain the complete original and report its backup path", async (t) => {
  const f = fixture(t); await f.install();
  fs.writeFileSync(path.join(f.target, "original.txt"), "previous installation");
  let injected = 0;
  await intercept({ rename: (original) => async (from, to) => {
    if (to === f.target && (from.includes(".install-") || from.includes(".backup-"))) { injected += 1; throw fault(); }
    return original(from, to);
  } }, async () => {
    await assert.rejects(f.install(), (error) => {
      assert.match(error.message, /original backup preserved at/);
      assert.ok(error.cause instanceof AggregateError);
      assert.equal(error.cause.errors.length, 2);
      const preserved = backups(f.target);
      assert.equal(preserved.length, 1);
      assert.ok(error.message.includes(preserved[0]));
      assert.equal(fs.readFileSync(path.join(preserved[0], "original.txt"), "utf8"), "previous installation");
      return true;
    });
  });
  assert.equal(injected, 2);
  assert.equal(fs.existsSync(f.target), false);
  const preserved = backups(f.target)[0];
  await f.install();
  assert.equal(fs.existsSync(f.target), true);
  assert.equal(fs.readFileSync(path.join(preserved, "original.txt"), "utf8"), "previous installation", "successful retry never deletes a separately preserved backup");
});

test("a failed replacement restores the old directory when rollback remains available", async (t) => {
  const f = fixture(t); await f.install();
  fs.writeFileSync(path.join(f.target, "original.txt"), "keep");
  await intercept({ rename: (original) => async (from, to) => {
    if (to === f.target && from.includes(".install-")) throw fault();
    return original(from, to);
  } }, async () => assert.rejects(f.install(), /Could not install/));
  assert.equal(fs.readFileSync(path.join(f.target, "original.txt"), "utf8"), "keep");
  assert.deepEqual(backups(f.target), []);
});

test("rollback never overwrites a newly occupied target and preserves its old backup", async (t) => {
  const f = fixture(t); await f.install();
  fs.writeFileSync(path.join(f.target, "original.txt"), "old");
  await intercept({ rename: (original) => async (from, to) => {
    if (to === f.target && from.includes(".install-")) {
      fs.mkdirSync(f.target); fs.writeFileSync(path.join(f.target, "new-user.txt"), "new owner"); throw fault();
    }
    return original(from, to);
  } }, async () => assert.rejects(f.install(), /original backup preserved at/));
  assert.equal(fs.readFileSync(path.join(f.target, "new-user.txt"), "utf8"), "new owner");
  assert.equal(fs.readFileSync(path.join(backups(f.target)[0], "original.txt"), "utf8"), "old");
});

test("backup cleanup failure does not retry destructive cleanup or lose the committed install", async (t) => {
  const f = fixture(t); await f.install();
  fs.writeFileSync(path.join(f.target, "original.txt"), "keep backup");
  let cleanupCalls = 0;
  await intercept({ rm: (original) => async (target, options) => {
    if (target.startsWith(`${f.target}.backup-`)) { cleanupCalls += 1; throw fault(); }
    return original(target, options);
  } }, async () => assert.rejects(f.install(), /original backup preserved at/));
  assert.equal(cleanupCalls, 1);
  assert.equal(fs.existsSync(path.join(f.target, ".codex-plugin/plugin.json")), true);
  assert.equal(fs.readFileSync(path.join(backups(f.target)[0], "original.txt"), "utf8"), "keep backup");
});

test("failed atomic JSON replacement preserves every marketplace entry and supports a clean retry", async (t) => {
  const f = fixture(t); await f.install();
  const marketplace = JSON.parse(fs.readFileSync(f.marketplace));
  const other = { name: "other-plugin", source: { source: "local", path: "./plugins/other" } };
  marketplace.plugins.push(other);
  fs.writeFileSync(f.marketplace, JSON.stringify(marketplace));
  const before = fs.readFileSync(f.marketplace);
  let oldMoved = 0;
  await intercept({ rename: (original) => async (from, to) => {
    if (from === f.marketplace) oldMoved += 1;
    if (to === f.marketplace && from.includes(".write-")) throw fault();
    return original(from, to);
  } }, async () => assert.rejects(f.install(), /Could not update JSON file/));
  assert.equal(oldMoved, 0);
  assert.deepEqual(fs.readFileSync(f.marketplace), before);
  await f.install();
  assert.deepEqual(JSON.parse(fs.readFileSync(f.marketplace)).plugins.find((entry) => entry.name === other.name), other);
  assert.equal(fs.readdirSync(path.dirname(f.marketplace)).some((name) => /\.write-|\.backup-/.test(name)), false);
});

test("temporary JSON cleanup failure still preserves the old shared marketplace", async (t) => {
  const f = fixture(t); await f.install();
  const before = fs.readFileSync(f.marketplace);
  await intercept({
    rename: (original) => async (from, to) => {
      if (to === f.marketplace && from.includes(".write-")) throw fault();
      return original(from, to);
    },
    rm: (original) => async (target, options) => {
      if (target.startsWith(`${f.marketplace}.write-`)) throw fault();
      return original(target, options);
    },
  }, async () => assert.rejects(f.install(), /temporary file remains at/));
  assert.deepEqual(fs.readFileSync(f.marketplace), before);
});

test("project state JSON remains intact after its atomic commit fails and rerun can finish", async (t) => {
  const f = fixture(t);
  const options = { sourcePluginDir: plugin, projectDir: f.homeDir };
  const installed = await installProject(options);
  const before = fs.readFileSync(installed.statePath);
  await intercept({ rename: (original) => async (from, to) => {
    if (to === installed.statePath && from.includes(".write-")) throw fault();
    return original(from, to);
  } }, async () => assert.rejects(installProject(options), /interrupted/));
  assert.deepEqual(fs.readFileSync(installed.statePath), before);
  await installProject(options);
  assert.equal(JSON.parse(fs.readFileSync(installed.statePath)).status, "installed");
});

test("staging cleanup failure cannot hide or delete an original whose rollback also failed", async (t) => {
  const f = fixture(t); await f.install();
  fs.writeFileSync(path.join(f.target, "original.txt"), "keep original");
  await intercept({
    rename: (original) => async (from, to) => {
      if (to === f.target && (from.includes(".install-") || from.includes(".backup-"))) throw fault();
      return original(from, to);
    },
    rm: (original) => async (target, options) => {
      if (target.startsWith(`${f.target}.install-`)) throw fault();
      return original(target, options);
    },
  }, async () => assert.rejects(f.install(), (error) => {
    assert.match(error.message, /original backup preserved at/);
    assert.equal(error.cause.errors.length, 3);
    return true;
  }));
  assert.equal(fs.readFileSync(path.join(backups(f.target)[0], "original.txt"), "utf8"), "keep original");
});
