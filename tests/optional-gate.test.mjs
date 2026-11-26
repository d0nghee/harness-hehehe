import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const runState = fileURLToPath(new URL("../plugins/hehehe/skills/resume/scripts/run-state.mjs", import.meta.url));
const policy = JSON.stringify({
  schema_version: 1, max_age_seconds: 3600,
  checks: [{ id: "contract", command: ["$node", "-e", "process.exit(0)"], kind: "exit", timeout_ms: 5000 }],
  always_required: ["contract"], change_rules: [], protected_paths: [".hehehe/verification-policy.json"],
});

function fixture(t, { repository = true, adopt = false } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-optional-gate-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "src/app.txt"), "application\n");
  const git = (...args) => execFileSync("git", ["-C", project, ...args], { encoding: "utf8", windowsHide: true }).trim();
  const policyFile = path.join(project, ".hehehe/verification-policy.json");
  if (adopt) {
    fs.mkdirSync(path.dirname(policyFile), { recursive: true });
    fs.writeFileSync(policyFile, policy);
  }
  if (repository) {
    git("init", "-b", "main");
    for (const [key, value] of [["user.name", "Optional Gate"], ["user.email", "optional-gate@example.test"],
      ["maintenance.auto", "false"], ["gc.auto", "0"], ["core.autocrlf", "false"]]) git("config", key, value);
    git("add", ".");
    git("commit", "-m", "fixture baseline");
  }
  function run(args, extra = {}) {
    const env = { ...process.env, ...extra };
    for (const name of ["HEHEHE_VERIFICATION_BASE", "HEHEHE_VERIFICATION_APPROVED_HEAD", "NODE_TEST_CONTEXT"]) {
      if (!Object.hasOwn(extra, name)) delete env[name];
    }
    const result = spawnSync(process.execPath, [runState, ...args, "--project", project, "--json"],
      { encoding: "utf8", windowsHide: true, env });
    return { code: result.status, stderr: result.stderr, value: result.status === 0 ? JSON.parse(result.stdout) : null };
  }
  const stored = (runId) => JSON.parse(fs.readFileSync(path.join(project, ".hehehe/runs", runId, "state.json"), "utf8"));
  return { project, git, run, stored, policyFile };
}

test("a repository that never adopted a policy completes without the trusted gate and says so", (t) => {
  const f = fixture(t);
  assert.equal(f.run(["init", "--goal", "plain change", "--run-id", "plain-run"]).code, 0);
  const verified = f.run(["verify"]);
  assert.equal(verified.code, 0, verified.stderr);
  assert.equal(verified.value.verification_result.status, "ungated");
  assert.deepEqual(verified.value.verification_result.results, []);
  const completed = f.run(["complete"]);
  assert.equal(completed.code, 0, completed.stderr);
  assert.equal(completed.value.status, "complete");
  assert.equal(completed.value.verification.mode, "ungated");
  const saved = f.stored("plain-run");
  assert.equal(saved.status, "complete");
  assert.equal(saved.verification.mode, "ungated");
  assert.equal(saved.verification_base, null);
});

test("completion without verify is also allowed when no policy was adopted", (t) => {
  const f = fixture(t);
  assert.equal(f.run(["init", "--goal", "direct completion", "--run-id", "direct-run"]).code, 0);
  assert.equal(f.run(["complete"]).value.verification.mode, "ungated");
});

test("a directory that is not a Git repository is treated as never having adopted a policy", (t) => {
  const f = fixture(t, { repository: false });
  assert.equal(f.run(["init", "--goal", "scratch change", "--run-id", "scratch-run"]).code, 0);
  const completed = f.run(["complete"]);
  assert.equal(completed.code, 0, completed.stderr);
  assert.equal(completed.value.verification.mode, "ungated");
});

test("an adopted policy keeps the gate mandatory when no trusted base is supplied", (t) => {
  const f = fixture(t, { adopt: true });
  assert.equal(f.run(["init", "--goal", "gated change", "--run-id", "gated-run"]).code, 0);
  assert.match(f.run(["complete"]).stderr, /has not run/);
  assert.match(f.run(["verify"]).stderr, /no HEAD fallback/);
  assert.equal(f.stored("gated-run").status, "active");
});

test("deleting an adopted policy, in the working tree or in a commit, does not leave the gate", (t) => {
  const f = fixture(t, { adopt: true });
  assert.equal(f.run(["init", "--goal", "remove the gate", "--run-id", "removal-run"]).code, 0);
  fs.rmSync(f.policyFile);
  assert.match(f.run(["complete"]).stderr, /has not run/);
  f.git("add", "-A", ".hehehe/verification-policy.json");
  f.git("commit", "-m", "delete the policy");
  assert.match(f.run(["complete"]).stderr, /has not run/);
  assert.match(f.run(["verify"]).stderr, /no HEAD fallback/);
  assert.equal(f.stored("removal-run").status, "active");
});

test("an operator-supplied base makes the gate mandatory even where no policy exists", (t) => {
  const f = fixture(t);
  const base = f.git("rev-parse", "HEAD");
  const env = { HEHEHE_VERIFICATION_BASE: base };
  assert.equal(f.run(["init", "--goal", "pinned change", "--run-id", "pinned-run"], env).code, 0);
  assert.equal(f.stored("pinned-run").verification_base, base);
  assert.match(f.run(["verify"], env).stderr, /trusted commit has no verification policy/);
  // The pin is stored in run state, so dropping the variable later does not release the run.
  assert.match(f.run(["complete"]).stderr, /required verification has not run|no HEAD fallback/);
  assert.equal(f.stored("pinned-run").status, "active");
});

test("a gated repository still completes through verify with a trusted base", (t) => {
  const f = fixture(t, { adopt: true });
  const env = { HEHEHE_VERIFICATION_BASE: f.git("rev-parse", "HEAD") };
  assert.equal(f.run(["init", "--goal", "trusted change", "--run-id", "trusted-run"], env).code, 0);
  assert.equal(f.run(["verify"], env).code, 0);
  const completed = f.run(["complete"], env);
  assert.equal(completed.code, 0, completed.stderr);
  assert.equal(completed.value.verification.base, env.HEHEHE_VERIFICATION_BASE);
  assert.equal(Object.hasOwn(completed.value.verification, "mode"), false);
});
