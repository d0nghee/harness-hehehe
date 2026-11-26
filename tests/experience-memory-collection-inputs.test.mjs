import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { recordExperience, memoryStatus } from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { createExperienceService } from "../plugins/hehehe/skills/experience-memory/scripts/experience.mjs";
import { invokeStore } from "../plugins/hehehe/skills/experience-memory/scripts/sqlite-store.mjs";
import { canonical, hash, repository, registeredRoots } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-collection-input-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "src/proof.txt"), "collection source\n");
  const git = (...args) => execFileSync("git", ["-C", project, ...args], { encoding: "utf8", windowsHide: true });
  git("init", "-b", "main");
  fs.appendFileSync(path.join(project, ".git/config"), "\n[user]\n name = Collection Input\n email = collection@example.test\n[core]\n autocrlf = false\n[maintenance]\n auto = false\n[gc]\n auto = 0\n");
  git("add", "src"); git("commit", "-m", "private collection boundary evidence");
  const runs = path.join(project, ".hehehe/runs");
  const run = "collection-source";
  const directory = path.join(runs, run);
  fs.mkdirSync(directory, { recursive: true });
  const state = { schema_version: 1, run_id: run, status: "active" };
  fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify(state));
  fs.writeFileSync(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${run}/state.json` }));
  const note = recordExperience(project, { schema_version: 1, title: "collectionproof", problem: "bounded", cause: "input",
    resolution: "preserve", outcome: "safe", tags: [], source_paths: ["src/proof.txt"] }).record;
  fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify({ ...state, status: "complete" }));
  const observed = [];
  const service = createExperienceService(request => {
    if (request.operation === "sync") observed.push(Buffer.byteLength(JSON.stringify(request)));
    return invokeStore(request);
  });
  function add(id) {
    const directory = path.join(runs, id);
    fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify({ schema_version: 1, run_id: id, status: "complete" }));
    const copy = { ...note, run_id: id }; delete copy.id;
    copy.id = `experience-${hash(canonical(copy)).slice(0, 32)}`;
    fs.writeFileSync(path.join(directory, "experience.json"), JSON.stringify(copy));
  }
  return { root, project, runs, git, service, observed, add, database: path.join(project, ".git/hehehe-memory/experience.sqlite") };
}

test("service synchronization accepts512 eligible notes and rejects513 without replacing the cache", (t) => {
  const f = fixture(t);
  for (let index = 1; index < 512; index += 1) f.add(`eligible-${String(index).padStart(4, "0")}`);
  assert.equal(f.service.syncExperiences(f.project).indexed, 512);
  assert.equal(f.observed.length, 1);
  assert.ok(f.observed[0] < 1024 * 1024, "the test isolates note count rather than the request-byte limit");
  const bytes = fs.readFileSync(f.database);
  f.add("eligible-over-limit");
  assert.throws(() => f.service.syncExperiences(f.project), { code: "MEMORY_LIMIT_EXCEEDED" });
  assert.equal(f.observed.length, 1, "over-limit input must never reach the store replacement");
  assert.deepEqual(fs.readFileSync(f.database), bytes);
  assert.equal(memoryStatus(f.project).count, 512);
});

test("run scanning accepts1024 entries and rejects1025 before a partial cache refresh", (t) => {
  const f = fixture(t);
  for (let index = 1; index < 1024; index += 1) fs.mkdirSync(path.join(f.runs, `missing-state-${String(index).padStart(4, "0")}`));
  const result = f.service.syncExperiences(f.project);
  assert.equal(result.indexed, 1);
  assert.equal(result.skipped, 1023);
  assert.equal(f.observed.length, 1);
  const bytes = fs.readFileSync(f.database);
  fs.mkdirSync(path.join(f.runs, "missing-state-over-limit"));
  assert.throws(() => f.service.syncExperiences(f.project), { code: "MEMORY_LIMIT_EXCEEDED" });
  assert.equal(f.observed.length, 1);
  assert.deepEqual(fs.readFileSync(f.database), bytes);
  assert.equal(memoryStatus(f.project).count, 1);
});

test("registered checkout collection accepts64 real worktrees and rejects65 without creating memory", (t) => {
  const f = fixture(t);
  const trees = path.join(f.root, "trees"); fs.mkdirSync(trees);
  for (let index = 1; index < 64; index += 1) {
    f.git("worktree", "add", "--detach", "--no-checkout", "--quiet", path.join(trees, `tree-${index}`), "HEAD");
  }
  assert.equal(registeredRoots(repository(f.project)).length, 64);
  f.git("worktree", "add", "--detach", "--no-checkout", "--quiet", path.join(trees, "tree-over-limit"), "HEAD");
  assert.throws(() => registeredRoots(repository(f.project)), { code: "MEMORY_LIMIT_EXCEEDED" });
  assert.equal(fs.existsSync(path.dirname(f.database)), false);
});
