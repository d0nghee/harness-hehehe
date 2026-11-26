import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test, { describe } from "node:test";
import { recordExperience, syncExperiences, memoryContext } from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { canonical, hash, relativeFile } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

const exec = promisify(execFile);
const cli = path.resolve(import.meta.dirname, "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs");
const textFields = ["title", "problem", "cause", "resolution", "outcome"];
const input = (extra = {}) => ({
  schema_version: 1,
  title: "inputjournal source-checked experience",
  problem: "A historical note could obstruct healthy session context.",
  cause: "Record and index validation disagreed about accepted text.",
  resolution: "Validate the representation stored before publishing any note.",
  outcome: "Healthy historical context remains available without changing verification authority.",
  tags: ["inputjournal"],
  source_paths: ["src/evidence.txt"],
  ...extra,
});

async function git(project, ...args) {
  return (await exec("git", ["-C", project, ...args], { windowsHide: true })).stdout.trim();
}

async function current(project, id, status = "active") {
  const directory = path.join(project, ".hehehe/runs", id);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "state.json"), JSON.stringify({ schema_version: 1, run_id: id, status }));
  await writeFile(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${id}/state.json` }));
  return path.join(directory, "experience.json");
}

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "hehehe-memory-input-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, "repo");
  await mkdir(path.join(project, "src"), { recursive: true });
  await writeFile(path.join(project, "src/evidence.txt"), "stable input validation evidence\n");
  await git(project, "init", "-b", "main");
  await appendFile(path.join(project, ".git/config"), "\n[user]\n\tname = Memory Input\n\temail = input@example.test\n[maintenance]\n\tauto = false\n[gc]\n\tauto = 0\n[core]\n\tautocrlf = false\n");
  await git(project, "add", "src");
  await git(project, "commit", "-m", "isolated input validation evidence");
  const notePath = await current(project, "input-source");
  return { root, project, notePath, database: path.join(project, ".git/hehehe-memory/experience.sqlite") };
}

async function memory(project, ...args) {
  try {
    const result = await exec(process.execPath, [cli, ...args, "--project", project, "--json"], {
      windowsHide: true, maxBuffer: 2 * 1024 * 1024,
    });
    return { code: 0, value: JSON.parse(result.stdout), stderr: result.stderr };
  } catch (error) {
    return { code: error.code, stdout: error.stdout, value: JSON.parse(error.stderr), stderr: error.stderr };
  }
}

describe("experience input validation regressions", { concurrency: 2 }, () => {
test("source paths reject unpaired surrogates while preserving supplementary Unicode filenames", () => {
  for (const name of ["src/\ud800evidence.txt", "src/evidence\udfff.txt", "src/\ud800\udbff.txt", "src/\udc00\udfff.txt"]) {
    assert.throws(() => relativeFile(name), { code: "MEMORY_UNSAFE_PATH" });
  }
  for (const name of ["src/😀-evidence.txt", "src/한글-\ud800\udc00-\udbff\udfff.txt"]) assert.equal(relativeFile(name), name);
});

test("malformed UTF-16 is rejected in every prose field and tag before replacing a healthy note", async (t) => {
  const f = await fixture(t);
  recordExperience(f.project, input());
  const original = await readFile(f.notePath, "utf8");
  // Both surrogate ranges, both string boundaries, and consecutive same-range
  // surrogates must be rejected instead of silently becoming replacement text.
  const malformed = ["\ud800leading", "trailing\udbff", "\udc00leading", "trailing\udfff", "\ud800\udbff", "\udc00\udfff"];
  const failures = [];
  for (const field of [...textFields, "tags"]) {
    for (const value of malformed) {
      const proposal = input({ [field]: field === "tags" ? [value] : value });
      let rejected = false;
      try { recordExperience(f.project, proposal); }
      catch (error) { rejected = error.code === "MEMORY_INVALID_INPUT"; }
      if (!rejected) failures.push(`${field}:${JSON.stringify(value)} was not rejected as invalid input`);
      if (await readFile(f.notePath, "utf8") !== original) {
        failures.push(`${field}:${JSON.stringify(value)} replaced the healthy note`);
        await writeFile(f.notePath, original);
      }
    }
  }
  assert.equal(existsSync(f.database), false);
  assert.deepEqual(failures, []);
});

test("tags are checked for duplicates after whitespace and line-ending normalization", async (t) => {
  const f = await fixture(t);
  recordExperience(f.project, input());
  const original = await readFile(f.notePath, "utf8");
  const failures = [];
  for (const tags of [["memory", " memory "], ["memory", "\tmemory\n"], ["line\r\nbreak", "line\nbreak"], ["same", "same"]]) {
    let rejected = false;
    try { recordExperience(f.project, input({ tags })); }
    catch (error) { rejected = error.code === "MEMORY_INVALID_INPUT"; }
    if (!rejected) failures.push(`${JSON.stringify(tags)} was accepted`);
    if (await readFile(f.notePath, "utf8") !== original) {
      failures.push(`${JSON.stringify(tags)} replaced the healthy note`);
      await writeFile(f.notePath, original);
    }
  }
  assert.equal(existsSync(f.database), false);
  assert.deepEqual(failures, []);
});

test("valid surrogate pairs and distinct normalized tags survive CLI recording, indexing and recall unchanged", async (t) => {
  const f = await fixture(t);
  const prose = "inputjournal 한글 😀 \ud800\udc00 \udbff\udfff �";
  const proposal = input({ ...Object.fromEntries(textFields.map((field) => [field, prose])), tags: [" memory ", "line\r\nbreak", "😀", "Memory"] });
  const file = path.join(f.root, "valid-input.json");
  await writeFile(file, JSON.stringify(proposal));
  const recorded = await memory(f.project, "record", "--input", file);
  assert.equal(recorded.code, 0, recorded.stderr);
  assert.equal(recorded.value.status, "recorded");
  for (const field of textFields) assert.equal(recorded.value.record[field], prose);
  assert.deepEqual(recorded.value.record.tags, ["memory", "line\nbreak", "😀", "Memory"]);
  const original = await readFile(f.notePath, "utf8");
  await current(f.project, "input-source", "complete");
  const synced = await memory(f.project, "sync");
  assert.equal(synced.code, 0, synced.stderr);
  assert.equal(synced.value.indexed, 1);
  const recalled = await memory(f.project, "recall", "--query", "inputjournal");
  assert.equal(recalled.code, 0, recalled.stderr);
  assert.equal(recalled.value.authority, "advisory-only");
  assert.equal(recalled.value.trust, "untrusted-context");
  assert.equal(recalled.value.count, 1);
  for (const field of textFields) assert.equal(recalled.value.records[0][field], prose);
  assert.deepEqual(recalled.value.records[0].tags, ["memory", "line\nbreak", "😀", "Memory"]);
  assert.equal(await readFile(f.notePath, "utf8"), original);
});

test("legacy malformed notes are excluded without poisoning healthy sync or automatic session context", async (t) => {
  const f = await fixture(t);
  const healthy = recordExperience(f.project, input()).record;
  await current(f.project, "input-source", "complete");
  assert.equal(syncExperiences(f.project).indexed, 1);
  const healthyBytes = await readFile(f.notePath, "utf8");
  // These notes have consistent canonical IDs and valid source/run metadata.
  // Rejection must come from their malformed field, not incidental ID tampering.
  for (const [index, field] of [...textFields, "tags"].entries()) {
    const id = `legacy-invalid-${index}`;
    const destination = await current(f.project, id, "complete");
    const note = { ...healthy, run_id: id, [field]: field === "tags" ? ["bad\ud800"] : "bad\udfff" };
    delete note.id;
    note.id = `experience-${hash(canonical(note)).slice(0, 32)}`;
    await writeFile(destination, JSON.stringify(note));
  }
  const duplicateId = "legacy-normalized-duplicate";
  const duplicatePath = await current(f.project, duplicateId, "complete");
  const duplicate = { ...healthy, run_id: duplicateId, tags: ["memory", "memory"] };
  delete duplicate.id;
  duplicate.id = `experience-${hash(canonical(duplicate)).slice(0, 32)}`;
  await writeFile(duplicatePath, JSON.stringify(duplicate));
  const invalidPathId = "legacy-invalid-source-path";
  const invalidPathDestination = await current(f.project, invalidPathId, "complete");
  const invalidPath = { ...healthy, run_id: invalidPathId,
    sources: [{ ...healthy.sources[0], path: "src/evidence\ud800.txt" }] };
  invalidPath.source_fingerprint = hash(canonical(invalidPath.sources));
  delete invalidPath.id;
  invalidPath.id = `experience-${hash(canonical(invalidPath)).slice(0, 32)}`;
  await writeFile(invalidPathDestination, JSON.stringify(invalidPath));
  const synced = syncExperiences(f.project);
  assert.equal(synced.status, "ok");
  assert.equal(synced.indexed, 1);
  assert.equal(synced.skipped, 8);
  const context = memoryContext(f.project, "inputjournal");
  assert.equal(context.status, "ok");
  assert.equal(context.authority, "advisory-only");
  assert.equal(context.trust, "untrusted-context");
  assert.equal(context.count, 1);
  assert.equal(context.records[0].id, healthy.id);
  assert.equal(await readFile(f.notePath, "utf8"), healthyBytes);
});

test("CLI refuses malformed escaped JSON text and normalized duplicate tags without creating a note or cache", async (t) => {
  const f = await fixture(t);
  const file = path.join(f.root, "invalid-input.json");
  for (const proposal of [input({ title: "escaped\ud800" }), input({ tags: ["memory", " memory "] })]) {
    await writeFile(file, JSON.stringify(proposal));
    const result = await memory(f.project, "record", "--input", file);
    assert.equal(result.code, 1);
    assert.equal(result.stdout, "");
    assert.equal(result.value.code, "MEMORY_INVALID_INPUT");
    assert.equal(result.value.authority, "advisory-only");
    assert.equal(existsSync(f.notePath), false);
    assert.equal(existsSync(f.database), false);
  }
});
});
