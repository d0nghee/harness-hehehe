import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { releaseSource } from "../scripts/release-policy.mjs";
import { packCommitted, integrityOf } from "../scripts/release-store.mjs";
import { prepareRelease, verifyRelease, publishRelease, releaseStatus } from "../scripts/release-lifecycle.mjs";

function git(project, ...args) {
  return execFileSync("git", ["-C", project, ...args], {
    encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
function write(project, file, contents) {
  const target = path.join(project, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}
function repository(t) {
  const project = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-release-review-"));
  t.after(() => fs.rmSync(project, { recursive: true, force: true }));
  git(project, "init", "-b", "main");
  git(project, "config", "user.name", "Release Review");
  git(project, "config", "user.email", "release-review@example.test");
  git(project, "config", "core.autocrlf", "false");
  git(project, "config", "maintenance.auto", "false");
  git(project, "config", "gc.auto", "0");
  return project;
}

const environmentNames = ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD",
  "HEHEHE_RELEASE_APPROVED_HEAD", "HEHEHE_RELEASE_APPROVED_VERSION", "HEHEHE_RELEASE_APPROVAL_ID", "HEHEHE_RELEASE_APPROVED_INTEGRITY"];
async function candidate(t, { trustedReleasePolicy = true, verified = true } = {}) {
  const saved = Object.fromEntries(environmentNames.map((name) => [name, process.env[name]]));
  environmentNames.forEach((name) => delete process.env[name]);
  t.after(() => environmentNames.forEach((name) => {
    if (saved[name] === undefined) delete process.env[name]; else process.env[name] = saved[name];
  }));
  const project = repository(t);
  const policy = { schema_version: 1, package_name: "release-review-fixture", repository: "release-review/fixture",
    target_branch: "main", registry: "https://registry.npmjs.org", dist_tag: "latest", tag_prefix: "v", changelog: "CHANGELOG.md" };
  const verification = { schema_version: 1, max_age_seconds: 3600,
    checks: [{ id: "required", command: ["$node", "-e", "process.exit(0)"], kind: "exit", timeout_ms: 5000 }],
    always_required: ["required"], change_rules: [], protected_paths: ["package.json", ".hehehe/release-policy.json"] };
  write(project, "package.json", JSON.stringify({ name: policy.package_name, version: "1.0.0", files: ["dist", "plugins/hehehe"] }));
  write(project, "plugins/hehehe/.codex-plugin/plugin.json", '{"name":"hehehe","version":"1.0.0"}');
  write(project, "dist/public.js", "export const published = true;\n");
  write(project, "CHANGELOG.md", "# History\n\n## [1.0.0]\n\nExplicit reviewed release notes.\n");
  write(project, ".hehehe/verification-policy.json", JSON.stringify(verification));
  if (trustedReleasePolicy) write(project, ".hehehe/release-policy.json", JSON.stringify(policy));
  git(project, "add", "."); git(project, "commit", "-m", "reviewed fixture baseline");
  const base = git(project, "rev-parse", "HEAD");
  if (!trustedReleasePolicy) {
    write(project, ".hehehe/release-policy.json", JSON.stringify(policy));
    git(project, "add", "."); git(project, "commit", "-m", "unapproved release policy proposal");
  }
  process.env.HEHEHE_VERIFICATION_BASE = base;
  const record = await prepareRelease(project);
  if (verified) await verifyRelease(project, record.request_id);
  return { project, record };
}
function approve(record) {
  process.env.HEHEHE_RELEASE_APPROVED_HEAD = record.head;
  process.env.HEHEHE_RELEASE_APPROVED_VERSION = record.version;
  process.env.HEHEHE_RELEASE_APPROVAL_ID = record.request_id;
  process.env.HEHEHE_RELEASE_APPROVED_INTEGRITY = record.artifact.integrity;
}
function external(record) {
  const state = { head: record.head, npm: null, latest: null, tag: null, github: null,
    writes: [], reads: 0, failGithubOnce: false };
  const observed = (value) => { state.reads += 1; return value; };
  const gateway = {
    async remoteMain() { return observed(state.head); },
    async getNpmVersion() { return observed(state.npm); },
    async getNpmLatest() { return observed(state.latest); },
    async getTag() { return observed(state.tag); },
    async getGithubRelease() { return observed(state.github); },
    async publishNpm(value) {
      state.writes.push("npm");
      const bytes = fs.readFileSync(value.artifact.path);
      state.npm = { name: value.name, version: value.version, integrity: integrityOf(bytes), bytes };
      state.latest = value.version;
    },
    async createTag(value) { state.writes.push("tag"); state.tag = { sha: value.head }; },
    async createGithubRelease(value) {
      state.writes.push("github");
      if (state.failGithubOnce) { state.failGithubOnce = false; throw new Error("injected GitHub outage"); }
      state.github = { tag: value.tag, body: value.notes.text, draft: false, prerelease: false, target_commitish: value.head };
    },
  };
  return { state, gateway };
}

test("release clean-source gate rejects a tracked rename disguised as runtime records", (t) => {
  const project = repository(t);
  write(project, "abc.hehehe/current.json", '{"application":"source"}\n');
  git(project, "add", "."); git(project, "commit", "-m", "tracked application source");
  fs.mkdirSync(path.join(project, ".hehehe/runs"), { recursive: true });
  git(project, "mv", "abc.hehehe/current.json", ".hehehe/runs/renamed-source.json");
  assert.match(git(project, "status", "--porcelain=v1", "-z"), /R  \.hehehe\/runs\/renamed-source\.json\0abc\.hehehe\/current\.json/);
  assert.throws(() => releaseSource(project), /clean committed source/);
});

test("canonical release packing excludes ignored working files even when npm would include their directory", (t) => {
  const project = repository(t);
  write(project, "package.json", JSON.stringify({ name: "release-review-fixture", version: "1.0.0", files: ["dist"] }));
  write(project, ".npmignore", "");
  write(project, ".gitignore", "dist/private.txt\n");
  write(project, "dist/public.js", "export const published = true;\n");
  git(project, "add", "."); git(project, "commit", "-m", "canonical package source");
  write(project, "dist/private.txt", "ignored development secret; never publish\n");
  assert.equal(git(project, "status", "--porcelain"), "");
  const packed = packCommitted(project, git(project, "rev-parse", "HEAD"));
  const paths = packed.files.map((file) => file.path);
  assert.ok(paths.includes("package.json"));
  assert.ok(paths.includes("dist/public.js"));
  assert.equal(paths.includes("dist/private.txt"), false);
  assert.equal(fs.readFileSync(path.join(project, "dist/private.txt"), "utf8"), "ignored development secret; never publish\n");
  assert.equal(git(project, "status", "--porcelain"), "");
});

test("proposed release policy absent from the trusted baseline cannot authorize verification or publication", async (t) => {
  const { project, record } = await candidate(t, { trustedReleasePolicy: false, verified: false });
  assert.equal(record.release_policy.mode, "provisional");
  await assert.rejects(verifyRelease(project, record.request_id), /policy is provisional/);
  approve(record);
  const { state, gateway } = external(record);
  await assert.rejects(publishRelease(project, record.request_id, gateway), /policy is provisional/);
  assert.equal(state.reads, 0);
  assert.deepEqual(state.writes, []);
});

test("successful npm upload followed by journal failure resumes without publishing npm again", async (t) => {
  const { project, record } = await candidate(t);
  approve(record);
  const { state, gateway } = external(record);
  const statePath = path.join(project, ".git/hehehe-release/requests", record.request_id, "state.json");
  const rename = fs.renameSync;
  let interrupted = false;
  fs.renameSync = (from, to) => {
    if (!interrupted && path.resolve(to) === path.resolve(statePath)) {
      const next = JSON.parse(fs.readFileSync(from, "utf8")).record;
      if (next.steps?.npm === true && next.in_flight === null) {
        interrupted = true;
        throw Object.assign(new Error("injected post-npm journal failure"), { code: "ENOSPC" });
      }
    }
    return rename(from, to);
  };
  try { await assert.rejects(publishRelease(project, record.request_id, gateway), /post-npm journal failure/); }
  finally { fs.renameSync = rename; }
  assert.equal(interrupted, true);
  assert.deepEqual(state.writes, ["npm"]);
  assert.equal((await releaseStatus(project, record.request_id)).status, "partial");
  assert.equal((await publishRelease(project, record.request_id, gateway)).status, "released");
  assert.deepEqual(state.writes, ["npm", "tag", "github"]);
});

test("matching npm name and version cannot hide different downloaded package bytes", async (t) => {
  const { project, record } = await candidate(t);
  approve(record);
  const { state, gateway } = external(record);
  const bytes = Buffer.from("different package bytes with the same claimed identity");
  state.latest = record.version;
  for (const integrity of [integrityOf(bytes), record.artifact.integrity]) {
    state.npm = { name: record.name, version: record.version, integrity, bytes };
    await assert.rejects(publishRelease(project, record.request_id, gateway), /conflicts with the approved tarball bytes/);
    assert.deepEqual(state.writes, []);
    assert.notEqual((await releaseStatus(project, record.request_id)).status, "released");
  }
});

test("advanced remote main blocks every remaining write while resuming a partial release", async (t) => {
  const { project, record } = await candidate(t);
  approve(record);
  const { state, gateway } = external(record);
  state.failGithubOnce = true;
  await assert.rejects(publishRelease(project, record.request_id, gateway), /injected GitHub outage/);
  assert.deepEqual(state.writes, ["npm", "tag", "github"]);
  assert.equal((await releaseStatus(project, record.request_id)).status, "partial");
  state.head = "f".repeat(40);
  const before = [...state.writes];
  await assert.rejects(publishRelease(project, record.request_id, gateway), /remote main is not the exact approved/);
  assert.deepEqual(state.writes, before);
});
