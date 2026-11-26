import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test from "node:test";
import { installProject } from "../lib/installer.mjs";

const exec = promisify(execFile);
const source = path.resolve(import.meta.dirname, "../plugins/hehehe");

test("project installation recalls the same experience through namespaced skills without unrelated context", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hehehe-memory-install-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, "repo");
  await mkdir(path.join(project, "src"), { recursive: true });
  await mkdir(path.join(project, ".hehehe"));
  await writeFile(path.join(project, "src/lock.txt"), "serialize shared journal writes\n");
  await writeFile(path.join(project, ".hehehe/verification-policy.json"), JSON.stringify({
    schema_version: 1, max_age_seconds: 3600,
    checks: [{ id: "contract", command: ["$node", "-e", "process.exit(0)"], kind: "exit", timeout_ms: 5000 }],
    always_required: ["contract"], change_rules: [], protected_paths: [".hehehe/verification-policy.json"],
  }));
  await installProject({ projectDir: project, sourcePluginDir: source });
  const git = async (...args) => (await exec("git", ["-C", project, ...args], { windowsHide: true })).stdout.trim();
  await git("init", "-b", "main");
  await git("config", "user.name", "Memory Install Test");
  await git("config", "user.email", "memory-install@example.test");
  await git("config", "maintenance.auto", "false");
  await git("config", "gc.auto", "0");
  await git("add", ".");
  await git("commit", "-m", "isolated installed skill baseline");
  const env = { ...process.env, HEHEHE_VERIFICATION_BASE: await git("rev-parse", "HEAD") };
  delete env.HEHEHE_VERIFICATION_APPROVED_HEAD;
  delete env.NODE_TEST_CONTEXT;
  const invoke = async (skill, args) => JSON.parse((await exec(process.execPath,
    [path.join(project, ".agents/skills", `hehehe-${skill}`, "scripts", skill === "resume" ? "run-state.mjs" : "memory.mjs"),
      ...args, "--project", project, "--json"], { env, windowsHide: true, maxBuffer: 2 * 1024 * 1024 })).stdout);
  assert.equal((await invoke("resume", ["init", "--goal", "Investigate journal serialization", "--run-id", "journal-source"])).status, "active");
  const input = path.join(root, "experience-input.json");
  await writeFile(input, JSON.stringify({ schema_version: 1, title: "Serialize journal writes",
    problem: "Concurrent journal writes lost updates.", cause: "Writers shared one journal without serialization.",
    resolution: "Serialize mutations before committing journal changes.", outcome: "The regression passed with no lost journal updates.",
    tags: ["journal", "serialization"], source_paths: ["src/lock.txt"] }));
  await invoke("experience-memory", ["record", "--input", input]);
  await invoke("resume", ["verify"]);
  assert.equal((await invoke("resume", ["complete"])).memory_capture.indexed, 1);
  const next = await invoke("resume", ["init", "--goal", "Investigate journal serialization", "--run-id", "next-session"]);
  assert.equal(next.memory_context.count, 1);
  assert.equal(next.memory_context.authority, "advisory-only");
  const stored = JSON.parse(await readFile(path.join(project, ".hehehe/runs/next-session/state.json"), "utf8"));
  assert.equal(Object.hasOwn(stored, "memory_context"), false);
  const irrelevant = await invoke("experience-memory", ["recall", "--query", "Build a weather dashboard with charts"]);
  assert.equal(irrelevant.count, 0, "generic task words must not pull unrelated journal experience into a weather task");
  const generic = await invoke("experience-memory", ["recall", "--query", "Please build it with this"]);
  assert.equal(generic.status, "empty");
  assert.equal(generic.count, 0);
  await writeFile(path.join(project, "src/lock.txt"), "changed current implementation\n");
  assert.equal((await invoke("resume", ["status"])).memory_context.count, 0);
});
