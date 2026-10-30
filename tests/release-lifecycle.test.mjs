import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import cp, { execFileSync } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import test from "node:test";
import { prepareRelease, publishRelease, releasePlan, releaseStatus, verifyRelease } from "../scripts/release-lifecycle.mjs";
import { validateReleasePolicy } from "../scripts/release-policy.mjs";

const envNames = ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD", "HEHEHE_RELEASE_APPROVED_HEAD",
  "HEHEHE_RELEASE_APPROVED_VERSION", "HEHEHE_RELEASE_APPROVAL_ID", "HEHEHE_RELEASE_APPROVED_INTEGRITY"];
function git(root, ...args) {
  return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"] }).trim();
}
function put(root, file, contents) {
  const target = path.join(root, file); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, contents);
}
function commit(root, message) { git(root, "add", "."); git(root, "commit", "-m", message); return git(root, "rev-parse", "HEAD"); }
const policy = { schema_version: 1, package_name: "fixture-release", repository: "fixture/release", target_branch: "main",
  registry: "https://registry.npmjs.org", dist_tag: "latest", tag_prefix: "v", changelog: "CHANGELOG.md" };
function packageVersion(root, version) {
  put(root, "package.json", JSON.stringify({ name: policy.package_name, version,
    files: ["index.js", "plugins/", "CHANGELOG.md"], bin: { "fixture-release": "index.js" },
    scripts: { prepack: 'node -e "require(\'fs\').writeFileSync(\'not-approved.txt\',\'side effect\')"' } }));
  put(root, "plugins/hehehe/.codex-plugin/plugin.json", JSON.stringify({ name: "hehehe", version }));
}
function fixture(t, { adopt = true, bump = true, broken = false } = {}) {
  const saved = Object.fromEntries(envNames.map((name) => [name, process.env[name]])); envNames.forEach((name) => delete process.env[name]);
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-release-core-"));
  t.after(() => {
    envNames.forEach((name) => { if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name]; });
    fs.rmSync(root, { recursive: true, force: true });
  });
  git(root, "init", "-b", "main"); git(root, "config", "user.name", "Release Fixture"); git(root, "config", "user.email", "release@example.test");
  git(root, "config", "core.autocrlf", "false"); git(root, "config", "gc.auto", "0"); git(root, "config", "maintenance.auto", "false");
  const verification = { schema_version: 1, max_age_seconds: 3600, always_required: ["contract"], change_rules: [], protected_paths: ["tests/**"],
    checks: [{ id: "contract", command: ["$node", "-e", 'if(require("fs").readFileSync("index.js","utf8").includes("broken"))process.exit(7)'], kind: "exit", timeout_ms: 5000 }] };
  put(root, ".hehehe/verification-policy.json", JSON.stringify(verification));
  if (adopt) put(root, ".hehehe/release-policy.json", JSON.stringify(policy));
  packageVersion(root, "1.0.0"); put(root, "index.js", "#!/usr/bin/env node\nconsole.log('initial');\n");
  put(root, "CHANGELOG.md", "# Changes\n\n## [1.0.0]\n\n- Initial release.\n");
  const base = commit(root, "reviewed baseline"); git(root, "tag", "v1.0.0");
  if (!adopt) put(root, ".hehehe/release-policy.json", JSON.stringify(policy));
  if (bump) packageVersion(root, "1.0.1");
  put(root, "index.js", `#!/usr/bin/env node\nconsole.log('${broken ? "broken" : "changed"}');\n`);
  put(root, "CHANGELOG.md", `# Changes\n\n## [${bump ? "1.0.1" : "1.0.0"}]\n\n- Explicit reviewed changes.\n`);
  const head = commit(root, "candidate"); process.env.HEHEHE_VERIFICATION_BASE = base;
  return { root, base, head, policy };
}
function approve(record) {
  process.env.HEHEHE_RELEASE_APPROVED_HEAD = record.head;
  process.env.HEHEHE_RELEASE_APPROVED_VERSION = record.version;
  process.env.HEHEHE_RELEASE_APPROVAL_ID = record.request_id;
  process.env.HEHEHE_RELEASE_APPROVED_INTEGRITY = record.artifact.integrity;
}
function gateway(record) {
  const state = { main: record.head, npm: null, latest: "1.0.0", tag: null, github: null, calls: [], failGithub: false };
  const api = {
    remoteMain: async () => state.main,
    getNpmVersion: async () => state.npm,
    getNpmLatest: async () => state.latest,
    getTag: async () => state.tag,
    getGithubRelease: async () => state.github,
    publishNpm: async (value) => {
      state.calls.push("npm"); state.npm = { name: value.name, version: value.version,
        integrity: value.artifact.integrity, bytes: fs.readFileSync(value.artifact.path) }; state.latest = value.version;
    },
    createTag: async (value) => { state.calls.push("tag"); state.tag = { sha: value.head }; },
    createGithubRelease: async (value) => {
      state.calls.push("github"); if (state.failGithub) throw new Error("simulated GitHub outage");
      state.github = { tag: value.tag, body: value.notes.text, draft: false, prerelease: false, target_commitish: value.head };
    },
  };
  return { api, state };
}

test("plan reports pending package changes and version bump without claiming external release success", async (t) => {
  const f = fixture(t, { bump: false });
  const plan = await releasePlan(f.root);
  assert.equal(plan.status, "release_pending"); assert.equal(plan.external_state, "unchecked");
  assert.equal(plan.version_bump_required, true); assert.ok(plan.changes.changed.includes("index.js"));
  await assert.rejects(prepareRelease(f.root), /version bump required/);
});

test("prepare freezes canonical source, ignores pack hooks and produces a reproducible request", async (t) => {
  const f = fixture(t);
  const first = await prepareRelease(f.root);
  assert.match(first.request_id, /^release-[a-f0-9]{24}$/); assert.equal(first.status, "prepared");
  assert.equal(first.release_policy.mode, "trusted"); assert.equal(first.head, f.head);
  assert.ok(first.artifact.files.some((file) => file.path === "index.js"));
  assert.equal(first.artifact.files.some((file) => file.path === "not-approved.txt"), false);
  const second = await prepareRelease(f.root);
  assert.equal(second.request_id, first.request_id); assert.deepEqual(fs.readFileSync(second.artifact.path), fs.readFileSync(first.artifact.path));
});

test("header-only tarball changes remain pending even when all packaged file content is unchanged", async (t) => {
  const f = fixture(t, { bump: false });
  git(f.root, "restore", "--source", f.base, "--", "package.json", "plugins/hehehe/.codex-plugin/plugin.json", "index.js", "CHANGELOG.md");
  put(f.root, "non-package-note.txt", "source change outside the package\n"); commit(f.root, "unchanged package payload");
  const unchanged = await releasePlan(f.root);
  assert.equal(unchanged.artifact_changed, false);
  assert.equal(unchanged.status, "no_package_changes");
  const original = cp.spawnSync;
  let packs = 0;
  cp.spawnSync = (command, args, options) => {
    const result = original(command, args, options);
    if (command === process.execPath && args.includes("pack") && result.status === 0 && ++packs === 2) {
      const report = JSON.parse(result.stdout)[0];
      const file = path.join(args[args.indexOf("--pack-destination") + 1], report.filename);
      const bytes = fs.readFileSync(file);
      assert.deepEqual([...bytes.subarray(0, 2)], [0x1f, 0x8b]);
      bytes[9] ^= 1; // Gzip OS/header metadata changes; uncompressed tar/file bytes remain identical.
      fs.writeFileSync(file, bytes);
    }
    return result;
  };
  syncBuiltinESMExports();
  let changed;
  try { changed = await releasePlan(f.root); }
  finally { cp.spawnSync = original; syncBuiltinESMExports(); }
  assert.equal(packs, 2);
  assert.deepEqual(changed.changes, { added: [], deleted: [], changed: [] });
  assert.equal(changed.artifact_changed, true);
  assert.equal(changed.status, "release_pending");
});

test("provisional release policy cannot authorize verify or any gateway access", async (t) => {
  const f = fixture(t, { adopt: false }), record = await prepareRelease(f.root), remote = gateway(record);
  assert.equal(record.release_policy.mode, "provisional");
  await assert.rejects(verifyRelease(f.root, record.request_id), /provisional/);
  approve(record);
  await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /provisional/);
  assert.deepEqual(remote.state.calls, []);
});

test("missing or failed verification and every exact-approval mismatch block writes", async (t) => {
  const f = fixture(t), record = await prepareRelease(f.root), remote = gateway(record);
  approve(record); await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /verification is missing/);
  await verifyRelease(f.root, record.request_id);
  for (const name of ["HEHEHE_RELEASE_APPROVED_HEAD", "HEHEHE_RELEASE_APPROVED_VERSION", "HEHEHE_RELEASE_APPROVAL_ID", "HEHEHE_RELEASE_APPROVED_INTEGRITY"]) {
    const before = process.env[name]; process.env[name] = "wrong";
    await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /external release approval/); process.env[name] = before;
  }
  assert.deepEqual(remote.state.calls, []);
  const bad = fixture(t, { broken: true }), badRecord = await prepareRelease(bad.root);
  await assert.rejects(verifyRelease(bad.root, badRecord.request_id), /verification failed/);
  approve(badRecord); const badRemote = gateway(badRecord);
  await assert.rejects(publishRelease(bad.root, badRecord.request_id, badRemote.api), /verification is missing or failed/);
  assert.deepEqual(badRemote.state.calls, []);
});

test("expired receipts, source changes and changed artifacts block publication", async (t) => {
  const f = fixture(t), record = await prepareRelease(f.root); await verifyRelease(f.root, record.request_id); approve(record);
  const remote = gateway(record), now = Date.now; Date.now = () => now() + 3_601_000;
  try { await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /receipt expired/); } finally { Date.now = now; }
  put(f.root, "index.js", "source changed\n"); await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /clean committed source/);
  git(f.root, "restore", "index.js");
  fs.appendFileSync(record.artifact.path, "tampered"); await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /artifact changed/);
  assert.deepEqual(remote.state.calls, []);
});

test("every external conflict is detected before npm or other publication writes", async (t) => {
  const f = fixture(t), record = await prepareRelease(f.root); await verifyRelease(f.root, record.request_id); approve(record);
  for (const change of [
    (s) => { s.main = "0".repeat(40); },
    (s) => { s.tag = { sha: "0".repeat(40) }; },
    (s) => { s.tag = { sha: record.head }; s.github = { tag: record.tag, body: "wrong", draft: false, prerelease: false }; },
    (s) => { s.npm = { name: record.name, version: record.version, integrity: record.artifact.integrity, bytes: Buffer.from("different bytes") }; },
    (s) => { s.latest = "9.0.0"; },
  ]) {
    const remote = gateway(record); change(remote.state);
    await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /remote main|conflicts|different source/);
    assert.deepEqual(remote.state.calls, []);
  }
});

test("partial npm/GitHub failure resumes the same immutable request without republishing", async (t) => {
  const f = fixture(t), record = await prepareRelease(f.root); await verifyRelease(f.root, record.request_id); approve(record);
  const remote = gateway(record); remote.state.failGithub = true;
  await assert.rejects(publishRelease(f.root, record.request_id, remote.api), /simulated GitHub outage/);
  assert.equal((await releaseStatus(f.root, record.request_id)).status, "partial");
  const refreshed = await verifyRelease(f.root, record.request_id); assert.equal(refreshed.status, "partial");
  remote.state.failGithub = false;
  const final = await publishRelease(f.root, record.request_id, remote.api);
  assert.equal(final.status, "released"); assert.equal(final.request_id, record.request_id);
  assert.deepEqual(remote.state.calls, ["npm", "tag", "github", "github"]);
  await publishRelease(f.root, record.request_id, remote.api);
  assert.deepEqual(remote.state.calls, ["npm", "tag", "github", "github"]);
});

test("same-request reconstruction after an exact source tag succeeds; another request cannot reuse it", async (t) => {
  const f = fixture(t), record = await prepareRelease(f.root);
  git(f.root, "tag", record.tag);
  const releaseDirectory = path.join(f.root, ".git/hehehe-release"); fs.rmSync(releaseDirectory, { recursive: true });
  await assert.rejects(prepareRelease(f.root), /version bump required/);
  await assert.rejects(prepareRelease(f.root, { resumeRequestId: "release-" + "0".repeat(24) }), /does not match/);
  const recovered = await prepareRelease(f.root, { resumeRequestId: record.request_id });
  assert.equal(recovered.request_id, record.request_id); assert.equal(recovered.artifact.integrity, record.artifact.integrity);
});

test("signed release journal rejects metadata edits and policy schema rejects publication exceptions", async (t) => {
  const f = fixture(t), record = await prepareRelease(f.root);
  const statePath = path.join(f.root, ".git/hehehe-release/requests", record.request_id, "state.json");
  const envelope = JSON.parse(fs.readFileSync(statePath)); envelope.record.status = "released"; fs.writeFileSync(statePath, JSON.stringify(envelope));
  await assert.rejects(releaseStatus(f.root, record.request_id), /integrity check failed/);
  assert.throws(() => validateReleasePolicy({ ...policy, allow_ai_publish: true }), /unsupported release policy/);
  assert.throws(() => validateReleasePolicy({ ...policy, repository: "../repo" }), /unsupported release policy/);
});
