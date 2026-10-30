import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import childProcess from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import { once } from "node:events";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { installGlobal, uninstallGlobal } from "../lib/installer.mjs";

const sourcePluginDir = path.resolve(import.meta.dirname, "../plugins/hehehe");
function fixture(t) {
  const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-global-lock-"));
  t.after(() => fs.rmSync(homeDir, { recursive: true, force: true }));
  const target = path.join(homeDir, "plugins/hehehe");
  const marketplace = path.join(homeDir, ".agents/plugins/marketplace.json");
  const lock = path.join(homeDir, ".agents/.hehehe-global-installer/lock");
  return { homeDir, target, marketplace, lock,
    install: (extra = {}) => installGlobal({ sourcePluginDir, homeDir, activate: false, ...extra }),
    uninstall: (extra = {}) => uninstallGlobal({ homeDir, deactivate: false, ...extra }) };
}
function snapshot(directory, prefix = "") {
  return Object.fromEntries(fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name), file = path.join(directory, entry.name);
    return entry.isDirectory() ? Object.entries(snapshot(file, relative)) : [[relative, fs.readFileSync(file).toString("base64")]];
  }));
}
async function pausedCommit(f, operation, callback) {
  const rename = fsp.rename;
  let release, signal;
  const gate = new Promise((resolve) => { release = resolve; });
  const ready = new Promise((resolve) => { signal = resolve; });
  let paused = false;
  fsp.rename = async (from, to) => {
    if (!paused && to === f.marketplace && from.includes(".write-")) {
      paused = true; signal(); await gate;
    }
    return rename(from, to);
  };
  syncBuiltinESMExports();
  const running = f[operation]();
  try {
    await Promise.race([ready, running.then(() => { throw new Error("operation never reached registry commit"); })]);
    await callback();
  } finally {
    release();
    try { await running; }
    finally { fsp.rename = rename; syncBuiltinESMExports(); }
  }
}

for (const first of ["install", "uninstall"]) {
  test(`global ${first} owns the lock through registry commit and blocks competing mutations`, async (t) => {
    const f = fixture(t); await f.install();
    await pausedCommit(f, first, async () => {
      const before = snapshot(f.homeDir);
      for (const second of ["install", "uninstall"]) {
        await assert.rejects(f[second](), /Another hehehe global .*already in progress/);
        assert.deepEqual(snapshot(f.homeDir), before);
      }
    });
    assert.equal(fs.existsSync(f.target), first === "install");
    assert.equal(JSON.parse(fs.readFileSync(f.marketplace)).plugins.some((p) => p.name === "hehehe"), first === "install");
    assert.equal(fs.existsSync(f.lock), false);
  });
}

test("global dry runs write no lock or files and do not block an independent home", async (t) => {
  const f = fixture(t), other = fixture(t);
  const before = snapshot(f.homeDir);
  await f.install({ dryRun: true }); await f.uninstall({ dryRun: true });
  assert.deepEqual(snapshot(f.homeDir), before);
  await f.install();
  await pausedCommit(f, "uninstall", async () => {
    const paused = snapshot(f.homeDir);
    await f.install({ dryRun: true }); await f.uninstall({ dryRun: true });
    assert.deepEqual(snapshot(f.homeDir), paused);
    await other.install();
    assert.equal(fs.existsSync(other.target), true);
  });
});

test("a global operation failure releases its lock and retains unrelated registrations", async (t) => {
  const f = fixture(t); await f.install();
  const marketplace = JSON.parse(fs.readFileSync(f.marketplace));
  const other = { name: "other", source: { source: "local", path: "./plugins/other" } };
  marketplace.plugins.push(other); fs.writeFileSync(f.marketplace, JSON.stringify(marketplace));
  const before = fs.readFileSync(f.marketplace);
  const rename = fsp.rename;
  fsp.rename = async (from, to) => {
    if (to === f.marketplace && from.includes(".write-")) throw Object.assign(new Error("registry commit failed"), { code: "EACCES" });
    return rename(from, to);
  };
  syncBuiltinESMExports();
  try { await assert.rejects(f.install(), /Could not update JSON/); }
  finally { fsp.rename = rename; syncBuiltinESMExports(); }
  assert.deepEqual(fs.readFileSync(f.marketplace), before);
  assert.equal(fs.existsSync(f.lock), false);
  await f.install(); await f.uninstall();
  assert.deepEqual(JSON.parse(fs.readFileSync(f.marketplace)).plugins, [other]);
});

test("global abandoned locks retain their generation and malformed locks fail closed", async (t) => {
  const f = fixture(t), stopped = spawnSync(process.execPath, ["-e", ""], { windowsHide: true });
  assert.equal(stopped.status, 0);
  const token = randomUUID();
  fs.mkdirSync(f.lock, { recursive: true });
  const owner = { schemaVersion: 1, plugin: "hehehe", operation: "uninstall", pid: stopped.pid, token, startedAt: new Date().toISOString() };
  fs.writeFileSync(path.join(f.lock, "owner.json"), JSON.stringify(owner));
  await f.install();
  const retired = path.join(path.dirname(f.lock), `lock.recovered-${token}`, "owner.json");
  assert.deepEqual(JSON.parse(fs.readFileSync(retired)), owner);
  assert.equal(fs.existsSync(f.lock), false);
  fs.mkdirSync(f.lock); fs.writeFileSync(path.join(f.lock, "owner.json"), "{}");
  const old = new Date(Date.now() - 60_000); fs.utimesSync(f.lock, old, old);
  const before = snapshot(f.homeDir);
  await assert.rejects(f.uninstall(), /Global installer lock metadata is invalid/);
  assert.deepEqual(snapshot(f.homeDir), before);
});

test("global lock paths cannot traverse a junction and missing homes are not created", async (t) => {
  const f = fixture(t), outside = fixture(t);
  fs.mkdirSync(path.join(f.homeDir, ".agents"));
  fs.symlinkSync(outside.homeDir, path.dirname(f.lock), "junction");
  const outsideBefore = snapshot(outside.homeDir);
  await assert.rejects(f.install(), /symbolic link or junction/);
  assert.deepEqual(snapshot(outside.homeDir), outsideBefore);
  const missing = path.join(f.homeDir, "missing-home");
  await assert.rejects(installGlobal({ sourcePluginDir, homeDir: missing, activate: false }), /does not exist/);
  await assert.rejects(uninstallGlobal({ homeDir: missing, deactivate: false }), /does not exist/);
  assert.equal(fs.existsSync(missing), false);
});

test("a global lock also excludes an installer in a separate process", async (t) => {
  const f = fixture(t); await f.install();
  const script = path.join(f.homeDir, "worker.mjs");
  fs.writeFileSync(script, `import fsp from 'node:fs/promises';
import {syncBuiltinESMExports} from 'node:module';
import {once} from 'node:events';
import {uninstallGlobal} from ${JSON.stringify(pathToFileURL(path.resolve(import.meta.dirname, "../lib/installer.mjs")).href)};
const rename=fsp.rename;
fsp.rename=async(from,to)=>{if(to===${JSON.stringify(f.marketplace)}&&from.includes('.write-')){process.stdout.write('locked\\n');await once(process.stdin,'data');}return rename(from,to)};
syncBuiltinESMExports();await uninstallGlobal({homeDir:${JSON.stringify(f.homeDir)},deactivate:false});`);
  const child = spawn(process.execPath, [script], { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
  let errors = ""; child.stderr.on("data", (data) => { errors += data; });
  const closed = once(child, "close");
  try {
    const ready = await Promise.race([once(child.stdout, "data").then(([chunk]) => chunk.toString()), closed.then(() => { throw new Error(`worker exited early: ${errors}`); })]);
    assert.match(ready, /locked/);
    await assert.rejects(f.install(), /Another hehehe global uninstall is already in progress/);
  } finally {
    child.stdin.end("continue\n");
    const [code] = await closed; assert.equal(code, 0, errors);
  }
  assert.equal(fs.existsSync(f.target), false);
  assert.deepEqual(JSON.parse(fs.readFileSync(f.marketplace)).plugins, []);
});

test("global locks remain held during Codex activation and deactivation", async (t) => {
  const f = fixture(t), spawnCommand = childProcess.spawnSync;
  const operations = [];
  childProcess.spawnSync = () => {
    operations.push(JSON.parse(fs.readFileSync(path.join(f.lock, "owner.json"))).operation);
    return { status: 0, stdout: "", stderr: "" };
  };
  syncBuiltinESMExports();
  try {
    await f.install({ activate: true });
    await f.uninstall({ deactivate: true });
  } finally {
    childProcess.spawnSync = spawnCommand; syncBuiltinESMExports();
  }
  assert.deepEqual(operations, ["install", "uninstall"]);
  assert.equal(fs.existsSync(f.lock), false);
});
