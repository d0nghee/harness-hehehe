import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test, { describe } from "node:test";

const exec = promisify(execFile);
const cli = path.resolve(import.meta.dirname, "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs");

async function git(project, ...args) {
  return (await exec("git", ["-C", project, ...args], { windowsHide: true })).stdout.trim();
}

async function memory(project, ...args) {
  const result = await exec(process.execPath, [cli, ...args, "--project", project, "--json"], {
    windowsHide: true, maxBuffer: 2 * 1024 * 1024,
  });
  return JSON.parse(result.stdout);
}

const noteInput = (sourcePaths, extra = {}) => ({
  schema_version: 1,
  title: "compactjournal source-checked experience",
  problem: "Repeated investigation obscured an earlier useful lesson.",
  cause: "The earlier lesson could not be retrieved.",
  resolution: "Keep selected source-backed experiences available to later tasks.",
  outcome: "The experience can be inspected before applying it.",
  tags: ["compactjournal"],
  source_paths: sourcePaths,
  ...extra,
});

async function fixture(t, count = 1) {
  const root = await mkdtemp(path.join(os.tmpdir(), "hehehe-memory-recall-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, "repo");
  await mkdir(path.join(project, "src"), { recursive: true });
  const sourcePaths = Array.from({ length: count }, (_, index) => count === 1
    ? "src/evidence.txt"
    : `src/${String(index).padStart(2, "0")}-${"evidence-".repeat(11)}.txt`);
  for (const source of sourcePaths) await writeFile(path.join(project, source), "stable evidence\n");
  await git(project, "init", "-b", "main");
  await appendFile(path.join(project, ".git/config"), "\n[user]\n\tname = Memory Recall\n\temail = recall@example.test\n[maintenance]\n\tauto = false\n[gc]\n\tauto = 0\n[core]\n\tautocrlf = false\n");
  await git(project, "add", "src");
  await git(project, "commit", "-m", "isolated recall evidence");
  const runId = "recall-source";
  const directory = path.join(project, ".hehehe/runs", runId);
  await mkdir(directory, { recursive: true });
  const state = { schema_version: 1, run_id: runId, status: "active" };
  await writeFile(path.join(directory, "state.json"), JSON.stringify(state));
  await writeFile(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${runId}/state.json` }));
  const notePath = path.join(directory, "experience.json");
  const completed = new Set();
  async function seed(extra, id = runId, { sync = true } = {}) {
    const selectedDirectory = path.join(project, ".hehehe/runs", id);
    const selectedState = { ...state, run_id: id };
    await mkdir(selectedDirectory, { recursive: true });
    await writeFile(path.join(selectedDirectory, "state.json"), JSON.stringify(selectedState));
    await writeFile(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${id}/state.json` }));
    const input = path.join(root, "input.json");
    await writeFile(input, JSON.stringify(noteInput(sourcePaths, extra)));
    const recorded = await memory(project, "record", "--input", input);
    assert.equal(recorded.status, "recorded");
    assert.equal(recorded.authority, "advisory-only");
    await writeFile(path.join(selectedDirectory, "state.json"), JSON.stringify({ ...selectedState, status: "complete" }));
    completed.add(id);
    if (sync) {
      const synced = await memory(project, "sync");
      assert.equal(synced.status, "ok");
      assert.equal(synced.indexed, completed.size);
    }
    return recorded.record;
  }
  return { root, project, sourcePaths, notePath, seed };
}

function assertContext(result, count = 1) {
  assert.equal(result.authority, "advisory-only");
  assert.equal(result.trust, "untrusted-context");
  assert.equal(result.records.length, count);
  assert.ok(result.records.length <= 5);
  assert.ok(JSON.stringify(result.records).length <= 6000);
  return result.records;
}

function longContent() {
  const repeated = (length) => "compactjournal ".repeat(Math.ceil(length / 15)).slice(0, length).trimEnd();
  return {
    title: repeated(160), problem: repeated(800), cause: repeated(800), resolution: repeated(1200), outcome: repeated(400),
    tags: Array.from({ length: 8 }, (_, index) => `${index}${"lesson".repeat(6)}`),
  };
}

describe("experience recall regressions", { concurrency: 2 }, () => {
test("valid long experiences remain retrievable within the context budget without altering their source note", async (t) => {
  const f = await fixture(t, 16);
  const note = await f.seed(longContent());
  const original = await readFile(f.notePath, "utf8");
  assert.ok(JSON.stringify({ ...note, origin: { root: f.project, path: ".hehehe/runs/recall-source/experience.json" } }).length > 6000);
  const recalled = await memory(f.project, "recall", "--query", "compactjournal", "--limit", "5");
  const [record] = assertContext(recalled);
  assert.equal(record.id, note.id);
  assert.equal(record.title, note.title);
  assert.equal(record.context_compacted, true);
  assert.equal(record.source_count, 16);
  assert.equal(record.origin.root, f.project);
  assert.equal(record.origin.path, ".hehehe/runs/recall-source/experience.json");
  assert.equal(record.trust, "untrusted-context");
  for (const field of ["problem", "cause", "resolution", "outcome"]) {
    assert.equal(typeof record[field], "string");
    assert.ok(record[field].length > 0);
  }
  assert.equal(await readFile(f.notePath, "utf8"), original);
});

test("compacting a long experience does not admit changed notes or stale source evidence", async (t) => {
  const f = await fixture(t, 16);
  await f.seed(longContent());
  const original = await readFile(f.notePath, "utf8");
  const tampered = JSON.parse(original);
  tampered.resolution = "Unindexed replacement instructions.";
  await writeFile(f.notePath, JSON.stringify(tampered));
  assertContext(await memory(f.project, "recall", "--query", "compactjournal"), 0);
  await writeFile(f.notePath, original);
  await writeFile(path.join(f.project, f.sourcePaths[0]), "changed after capture\n");
  assertContext(await memory(f.project, "recall", "--query", "compactjournal"), 0);
  await writeFile(path.join(f.project, f.sourcePaths[0]), "stable evidence\n");
  assertContext(await memory(f.project, "recall", "--query", "compactjournal"));
  assert.equal(await readFile(f.notePath, "utf8"), original);
});

test("short experiences preserve their full existing record shape", async (t) => {
  const f = await fixture(t);
  const note = await f.seed();
  const [record] = assertContext(await memory(f.project, "recall", "--query", "compactjournal"));
  assert.deepEqual(record, { ...note, origin: { root: f.project, path: ".hehehe/runs/recall-source/experience.json" } });
});

test("Unicode-equivalent queries match normalized index text while preserving the original note", async (t) => {
  const f = await fixture(t);
  const title = `ＡＰＩ 설정 경험 ﬃxture Straße ${"한글".normalize("NFD")}`;
  const note = await f.seed({ title });
  const original = await readFile(f.notePath, "utf8");
  for (const query of ["ＡＰＩ", "API", "ﬃxture", "ffixture", "Straße", "straße", "한글", "한글".normalize("NFD")]) {
    const recalled = await memory(f.project, "recall", "--query", query);
    const [record] = assertContext(recalled);
    assert.equal(record.id, note.id, query);
    assert.equal(record.title, title, query);
  }
  assert.equal(await readFile(f.notePath, "utf8"), original);
});

test("escaped prose is explicitly truncated within the JSON budget without splitting Unicode characters", async (t) => {
  const f = await fixture(t);
  const pattern = `${'"\\\n'.repeat(6)}😀`;
  assert.equal(pattern.length, 20);
  const escaped = (length) => pattern.repeat(length / pattern.length);
  const note = await f.seed({
    title: "escapedjournal retained context",
    problem: escaped(800), cause: escaped(800), resolution: escaped(1200), outcome: escaped(400),
  });
  const original = await readFile(f.notePath, "utf8");
  assert.ok(JSON.stringify(Object.fromEntries(["title", "problem", "cause", "resolution", "outcome"].map((key) => [key, note[key]]))).length > 6000);
  const [record] = assertContext(await memory(f.project, "recall", "--query", "escapedjournal"));
  assert.equal(record.id, note.id);
  assert.equal(record.context_compacted, true);
  assert.ok(Array.isArray(record.truncated_fields));
  assert.ok(record.truncated_fields.length > 0);
  for (const field of ["problem", "cause", "resolution", "outcome"]) {
    for (const character of record[field]) {
      const code = character.codePointAt(0);
      assert.ok(code < 0xd800 || code > 0xdfff, `${field} contains an unpaired surrogate`);
    }
    if (record.truncated_fields.includes(field)) {
      assert.ok(record[field].endsWith("…"));
      assert.ok(note[field].startsWith(record[field].slice(0, -1)));
      assert.ok(record[field].length < note[field].length);
    } else assert.equal(record[field], note[field]);
  }
  assert.equal(await readFile(f.notePath, "utf8"), original);
});

test("multiple matching experiences respect the serialized array budget and requested record limit", async (t) => {
  const f = await fixture(t);
  const notes = [];
  for (let index = 0; index < 6; index += 1) {
    const id = `budget-source-${index}`;
    const note = await f.seed({
      title: `budgetjournal experience ${index}`,
      problem: "Repeated source investigation. ".repeat(20),
      cause: "A retained lesson was relevant. ".repeat(6),
      resolution: "Inspect the selected current sources before using this historical experience. ".repeat(7),
      outcome: "Current evidence remains authoritative. ".repeat(4),
    }, id, { sync: false });
    const file = path.join(f.project, ".hehehe/runs", id, "experience.json");
    notes.push({ id: note.id, file, original: await readFile(file, "utf8") });
  }
  const synced = await memory(f.project, "sync");
  assert.equal(synced.status, "ok");
  assert.equal(synced.indexed, 6);
  const recalled = await memory(f.project, "recall", "--query", "budgetjournal", "--limit", "5");
  const records = assertContext(recalled, recalled.records.length);
  assert.ok(records.length >= 2);
  assert.ok(recalled.omitted >= 1);
  assert.equal(new Set(records.map((record) => record.id)).size, records.length);
  for (const record of records) assert.ok(notes.some((note) => note.id === record.id));
  assertContext(await memory(f.project, "recall", "--query", "budgetjournal", "--limit", "2"), 2);
  for (const note of notes) assert.equal(await readFile(note.file, "utf8"), note.original);
});
});
