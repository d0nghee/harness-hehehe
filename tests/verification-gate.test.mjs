import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { validatePolicy } from "../plugins/hehehe/skills/resume/scripts/verification-policy.mjs";
import { installProject } from "../lib/installer.mjs";

const exec = promisify(execFile);
const sourceRoot = path.resolve(import.meta.dirname, "..");
const scriptRoot = path.join(sourceRoot, "plugins/hehehe/skills/resume/scripts");
const runner = path.join(scriptRoot, "run-state.mjs");

async function git(project, args) {
  return (await exec("git", ["-C", project, ...args], { windowsHide: true })).stdout.trim();
}

async function fixture(t, { command, kind = "node-test", minimum = 1, contract, timeout = 5000, rules = [], maxAge = 3600 } = {}) {
  const project = await mkdtemp(path.join(os.tmpdir(), "hehehe-gate-"));
  t.after(() => rm(project, { recursive: true, force: true }));
  await mkdir(path.join(project, ".hehehe"));
  await mkdir(path.join(project, "tests"));
  await mkdir(path.join(project, "src"));
  await writeFile(path.join(project, "src/app.txt"), "ok\n");
  await writeFile(path.join(project, "tests/contract.test.mjs"), contract ?? [
    'import test from "node:test";',
    'import assert from "node:assert/strict";',
    'import fs from "node:fs";',
    'test("approved contract", () => assert.equal(fs.readFileSync("src/app.txt", "utf8").trim(), "ok"));',
  ].join("\n"));
  await writeFile(path.join(project, "package.json"), '{"scripts":{"test":"node --test"}}\n');
  const check = { id: "contract", command: command ?? ["$node", "--test", "--test-reporter=tap", "tests/contract.test.mjs"], kind, timeout_ms: timeout };
  if (kind === "node-test") check.minimum_tests = minimum;
  const policy = { schema_version: 1, max_age_seconds: maxAge, checks: [check], always_required: ["contract"],
    change_rules: rules, protected_paths: ["tests/**", "package.json", "plugins/hehehe/skills/resume/scripts/**"] };
  await writeFile(path.join(project, ".hehehe/verification-policy.json"), JSON.stringify(policy));
  await cp(scriptRoot, path.join(project, "plugins/hehehe/skills/resume/scripts"), { recursive: true });
  await mkdir(path.join(project, "plugins/hehehe/templates"), { recursive: true });
  await cp(path.join(sourceRoot, "plugins/hehehe/templates/done-criteria.md"), path.join(project, "plugins/hehehe/templates/done-criteria.md"));
  await git(project, ["init", "-b", "main"]);
  await git(project, ["config", "user.name", "Gate Test"]);
  await git(project, ["config", "user.email", "gate@example.test"]);
  await git(project, ["add", "."]);
  await git(project, ["commit", "-m", "reviewed verification baseline"]);
  const base = await git(project, ["rev-parse", "HEAD"]);
  const env = { ...process.env, HEHEHE_VERIFICATION_BASE: base };
  delete env.HEHEHE_VERIFICATION_APPROVED_HEAD;
  delete env.NODE_TEST_CONTEXT;
  async function run(args, options = {}) {
    try {
      const result = await exec(process.execPath, [options.script ?? runner, ...args, "--project", project, "--json"], {
        windowsHide: true, env: options.env ?? env, maxBuffer: 4 * 1024 * 1024,
      });
      return { code: 0, ...result };
    } catch (error) { return { code: error.code, stdout: error.stdout, stderr: error.stderr }; }
  }
  assert.equal((await run(["init", "--goal", "Gate contract", "--run-id", "gate-test"])).code, 0);
  const runDirectory = path.join(project, ".hehehe/runs/gate-test");
  return { project, base, env, run, runDirectory, policy };
}

test("completion requires real verification, ignoring handwritten pass claims", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.runDirectory, "checks.md"), "All required checks PASS\n");
  await writeFile(path.join(f.runDirectory, "verification.json"), '{"status":"pass"}');
  const result = await f.run(["complete"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /has not run/);
});

test("successful trusted checks allow completion and preserve evidence", async (t) => {
  const f = await fixture(t);
  const verified = await f.run(["verify"]);
  assert.equal(verified.code, 0, verified.stderr);
  const completed = await f.run(["complete"]);
  assert.equal(completed.code, 0, completed.stderr);
  assert.equal(JSON.parse(completed.stdout).status, "complete");
  assert.equal(JSON.parse(completed.stdout).verification.base, f.base);
});

test("failed checks block completion, including after an earlier pass", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run(["verify"])).code, 0);
  await writeFile(path.join(f.project, "src/app.txt"), "broken\n");
  assert.notEqual((await f.run(["verify"])).code, 0);
  const result = await f.run(["complete"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /verification failed/);
});

test("source edits and new untracked files invalidate successful evidence", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run(["verify"])).code, 0);
  await writeFile(path.join(f.project, "src/new.txt"), "new input\n");
  const added = await f.run(["complete"]);
  assert.notEqual(added.code, 0);
  assert.match(added.stderr, /stale verification/);
  assert.equal((await f.run(["verify"])).code, 0);
  await writeFile(path.join(f.project, "src/app.txt"), "ok\nmodified after test\n");
  const edited = await f.run(["complete"]);
  assert.notEqual(edited.code, 0);
  assert.match(edited.stderr, /stale verification/);
});

test("HEAD changes invalidate evidence even when source content is identical", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run(["verify"])).code, 0);
  await git(f.project, ["commit", "--allow-empty", "-m", "different revision"]);
  const result = await f.run(["complete"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /stale verification/);
});

test("expired verification and missing execution logs block completion", async (t) => {
  const f = await fixture(t, { maxAge: 1 });
  assert.equal((await f.run(["verify"])).code, 0);
  await new Promise((resolve) => setTimeout(resolve, 1100));
  assert.match((await f.run(["complete"])).stderr, /receipt expired/);
  const logs = await fixture(t);
  assert.equal((await logs.run(["verify"])).code, 0);
  await rm(path.join(logs.runDirectory, "verification-contract.log"));
  assert.match((await logs.run(["complete"])).stderr, /evidence is missing/);
});

test("policy weakening and switching trust commits cannot authorize completion", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.project, ".hehehe/verification-policy.json"), JSON.stringify({ ...f.policy, always_required: [] }));
  assert.match((await f.run(["verify"])).stderr, /policy changed/);
  await git(f.project, ["add", ".hehehe/verification-policy.json"]);
  await git(f.project, ["commit", "-m", "unauthorized weaker policy"]);
  const replacement = await git(f.project, ["rev-parse", "HEAD"]);
  assert.match((await f.run(["verify"], { env: { ...f.env, HEHEHE_VERIFICATION_BASE: replacement } })).stderr, /base changed/);
});

test("deleting or weakening existing tests and changing package scripts is blocked", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.project, "tests/contract.test.mjs"), 'import test from "node:test"; test("fake", () => {});');
  assert.match((await f.run(["verify"])).stderr, /protected verification inputs changed/);
  await git(f.project, ["restore", "tests/contract.test.mjs"]);
  await writeFile(path.join(f.project, "package.json"), '{"scripts":{"test":"echo PASS"}}');
  assert.match((await f.run(["verify"])).stderr, /protected verification inputs changed/);
});

test("renaming a protected test does not hide its deletion", async (t) => {
  const f = await fixture(t);
  await git(f.project, ["mv", "tests/contract.test.mjs", "renamed.test.mjs"]);
  assert.match((await f.run(["verify"])).stderr, /protected verification inputs changed/);
});

test("external exact-head review permits protected updates but never relaxes baseline checks", async (t) => {
  const f = await fixture(t);
  const changedPolicy = structuredClone(f.policy);
  changedPolicy.checks[0].command = ["$node", "-e", "process.exit(0)"];
  changedPolicy.checks[0].kind = "exit";
  delete changedPolicy.checks[0].minimum_tests;
  await writeFile(path.join(f.project, ".hehehe/verification-policy.json"), JSON.stringify(changedPolicy));
  await git(f.project, ["add", ".hehehe/verification-policy.json"]);
  await git(f.project, ["commit", "-m", "independently reviewed future policy"]);
  const reviewed = await git(f.project, ["rev-parse", "HEAD"]);
  f.env.HEHEHE_VERIFICATION_APPROVED_HEAD = reviewed;
  await writeFile(path.join(f.project, "src/app.txt"), "broken\n");
  // The new no-op command is ignored. The original approved behavioral test still fails.
  assert.match((await f.run(["verify"])).stderr, /verification failed: contract/);
  await writeFile(path.join(f.project, "src/app.txt"), "ok\n");
  assert.equal((await f.run(["verify"])).code, 0);
  assert.equal((await f.run(["complete"])).code, 0);
});

test("an external approval cannot cover later uncommitted protected edits", async (t) => {
  const f = await fixture(t);
  f.env.HEHEHE_VERIFICATION_APPROVED_HEAD = f.base;
  await writeFile(path.join(f.project, "tests/contract.test.mjs"), 'console.log("weakened")');
  assert.match((await f.run(["verify"])).stderr, /protected verification inputs changed/);
});

test("a check that mutates the source cannot leave a passing receipt", async (t) => {
  const f = await fixture(t, { kind: "exit", command: ["$node", "-e", 'require("fs").writeFileSync("src/app.txt", "changed")'] });
  const result = await f.run(["verify"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /source changed/);
  assert.notEqual((await f.run(["complete"])).code, 0);
});

test("replacing a source parent with an external junction invalidates a passing receipt", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run(["verify"])).code, 0);
  const outside = await mkdtemp(path.join(os.tmpdir(), "hehehe-outside-source-"));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(path.join(outside, "app.txt"), "ok\n");
  await rename(path.join(f.project, "src"), path.join(f.project, "original-src"));
  // Keep the original source outside discovery so the link itself is the only identity change.
  await rename(path.join(f.project, "original-src"), path.join(outside, "original-src"));
  await symlink(outside, path.join(f.project, "src"), "junction");
  const completed = await f.run(["complete"]);
  assert.notEqual(completed.code, 0);
  assert.match(completed.stderr, /linked source path|outside the repository/);
  assert.notEqual((await f.run(["verify"])).code, 0);
});

test("zero tests, skipped tests and malformed reports fail closed", async (t) => {
  for (const [name, options] of [
    ["zero", { command: ["$node", "-e", 'console.log("# tests 0\\n# pass 0\\n# fail 0\\n# cancelled 0\\n# skipped 0\\n# todo 0")'] }],
    ["skip", { contract: 'import test from "node:test"; test.skip("not executed", () => {});' }],
    ["missing", { command: ["$node", "-e", 'console.log("success without report")'] }],
  ]) {
    await t.test(name, async (sub) => {
      const f = await fixture(sub, options);
      assert.notEqual((await f.run(["verify"])).code, 0);
      assert.notEqual((await f.run(["complete"])).code, 0);
    });
  }
});

test("timeout, missing executable and nonzero exit are failures", async (t) => {
  for (const command of [["$node", "-e", "setInterval(() => {}, 1000)"], ["hehehe-command-that-does-not-exist"], ["$node", "-e", "process.exit(3)"]]) {
    const f = await fixture(t, { command, kind: "exit", timeout: 100 });
    assert.notEqual((await f.run(["verify"])).code, 0);
    assert.notEqual((await f.run(["complete"])).code, 0);
  }
});

test("blocked runs, invalid phases and force flags cannot bypass the gate", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run(["verify"])).code, 0);
  assert.notEqual((await f.run(["advance", "--phase", "invented", "--next", "skip tests"])).code, 0);
  assert.notEqual((await f.run(["complete", "--force", "true"])).code, 0);
  assert.equal((await f.run(["advance", "--phase", "blocked", "--status", "blocked", "--next", "permission missing"])).code, 0);
  assert.match((await f.run(["complete"])).stderr, /only active runs/);
});

test("missing external trust anchor never falls back to HEAD", async (t) => {
  const f = await fixture(t);
  const env = { ...f.env };
  delete env.HEHEHE_VERIFICATION_BASE;
  assert.match((await f.run(["verify"], { env })).stderr, /no HEAD fallback/);
});

test("tampered receipts are rejected and workspace copies are not authoritative", async (t) => {
  const f = await fixture(t);
  assert.equal((await f.run(["verify"])).code, 0);
  const receiptRoot = path.join(f.project, ".git/hehehe-verification");
  const { readdir } = await import("node:fs/promises");
  const receipt = (await readdir(receiptRoot)).find((file) => file.endsWith(".json"));
  const target = path.join(receiptRoot, receipt);
  const envelope = JSON.parse(await readFile(target, "utf8"));
  envelope.payload.status = "fail";
  await writeFile(target, JSON.stringify(envelope));
  assert.match((await f.run(["complete"])).stderr, /invalid or modified/);
});

test("conditional required checks are selected from changed paths", async (t) => {
  const f = await fixture(t);
  // Define a second required check in the reviewed baseline, not in the worktree policy.
  f.policy.checks.push({ id: "authorization", command: ["$node", "-e", "process.exit(8)"], kind: "exit", timeout_ms: 5000 });
  f.policy.change_rules.push({ paths: ["src/auth/**"], required: ["authorization"] });
  await writeFile(path.join(f.project, ".hehehe/verification-policy.json"), JSON.stringify(f.policy));
  await git(f.project, ["add", ".hehehe/verification-policy.json"]);
  await git(f.project, ["commit", "-m", "fixture reviewed rule"]);
  const base = await git(f.project, ["rev-parse", "HEAD"]);
  f.env.HEHEHE_VERIFICATION_BASE = base;
  // A distinct run is initialized with the new externally supplied reviewed baseline.
  await rm(path.join(f.project, ".hehehe/current.json"));
  assert.equal((await f.run(["init", "--goal", "auth change", "--run-id", "auth-run"])).code, 0);
  await mkdir(path.join(f.project, "src/auth"));
  await writeFile(path.join(f.project, "src/auth/new.txt"), "auth boundary");
  const result = await f.run(["verify"]);
  assert.notEqual(result.code, 0);
  assert.match(result.stderr, /authorization/);
});

test("CI adapter executes the runner from the trusted commit", async (t) => {
  const f = await fixture(t);
  const result = await exec(process.execPath, [path.join(scriptRoot, "ci-verification.mjs"), f.project], { env: f.env, windowsHide: true });
  assert.match(result.stdout, /"status": "complete"/);
  const current = JSON.parse(await readFile(path.join(f.project, ".hehehe/current.json"), "utf8"));
  assert.equal(current.active_run, "runs/gate-test/state.json");
});

test("CI rejects a head-controlled no-op verifier and restores the original pointer", async (t) => {
  const f = await fixture(t);
  await writeFile(path.join(f.project, "plugins/hehehe/skills/resume/scripts/run-state.mjs"), "process.exit(0);\n");
  await assert.rejects(exec(process.execPath, [path.join(scriptRoot, "ci-verification.mjs"), f.project], { env: f.env, windowsHide: true }), /Command failed/);
  const current = JSON.parse(await readFile(path.join(f.project, ".hehehe/current.json"), "utf8"));
  assert.equal(current.active_run, "runs/gate-test/state.json");
});

test("project-installed resume bundles and executes the verification dependencies", async (t) => {
  const f = await fixture(t);
  const installed = await installProject({ sourcePluginDir: path.join(sourceRoot, "plugins/hehehe"), projectDir: f.project });
  const installedRunner = path.join(installed.targetSkillsDir, "hehehe-resume/scripts/run-state.mjs");
  const verified = await f.run(["verify"], { script: installedRunner });
  assert.equal(verified.code, 0, verified.stderr);
  const completed = await f.run(["complete"], { script: installedRunner });
  assert.equal(completed.code, 0, completed.stderr);
});

test("concurrent state mutations fail without stealing the lock", async (t) => {
  const f = await fixture(t);
  const lock = path.join(f.project, ".hehehe/run-state.lock");
  await writeFile(lock, "another active mutation\n");
  assert.match((await f.run(["verify"])).stderr, /locked by another mutation/);
  assert.equal(await readFile(lock, "utf8"), "another active mutation\n");
});

test("policy schema rejects omitted checks, typos and undefined required ids", () => {
  assert.throws(() => validatePolicy({ schema_version: 1, max_age_seconds: 3600 }), /checks/);
  const policy = { schema_version: 1, max_age_seconds: 3600, checks: [{ id: "test", command: ["$node", "--test"], kind: "exit", timeout_ms: 1000 }],
    always_required: ["test"], change_rules: [], protected_paths: ["tests/**"] };
  assert.throws(() => validatePolicy({ ...policy, skip_on_error: true }), /unknown field/);
  assert.throws(() => validatePolicy({ ...policy, always_required: ["undefined"] }), /not defined/);
  assert.throws(() => validatePolicy({ ...policy, always_required: [] }), /unique strings/);
});
