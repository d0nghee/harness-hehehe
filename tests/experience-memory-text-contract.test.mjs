import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { appendFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import test, { describe } from "node:test";
import { recordExperience, syncExperiences, recallExperiences, memoryContext } from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { canonical, hash } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

const exec = promisify(execFile);
const cli = path.resolve(import.meta.dirname, "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs");
const proseFields = ["title", "problem", "cause", "resolution", "outcome"];
const input = (extra = {}) => ({
  schema_version: 1,
  title: "textcontract source-backed lesson",
  problem: "Accepted notes must remain usable by a later session.",
  cause: "The record and search boundaries used different text rules.",
  resolution: "Check the entire record, index and retrieval flow.",
  outcome: "Keep safe historical context available without changing verification authority.",
  tags: ["textcontract"],
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
  const root = await mkdtemp(path.join(os.tmpdir(), "hehehe-text-contract-"));
  t.after(async () => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    await rm(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  await mkdir(path.join(project, "src"), { recursive: true });
  await writeFile(path.join(project, "src/evidence.txt"), "stable contract evidence\n");
  await git(project, "init", "-b", "main");
  await appendFile(path.join(project, ".git/config"), "\n[user]\n\tname = Memory Contract\n\temail = contract@example.test\n[core]\n\tautocrlf = false\n[maintenance]\n\tauto = false\n[gc]\n\tauto = 0\n");
  await git(project, "add", "src");
  await git(project, "commit", "-m", "isolated text contract evidence");
  async function seed(id, extra = {}) {
    const notePath = await current(project, id);
    const result = recordExperience(project, input(extra));
    assert.equal(result.status, "recorded");
    await current(project, id, "complete");
    return { note: result.record, notePath, original: await readFile(notePath, "utf8") };
  }
  return { root, project, seed, database: path.join(project, ".git/hehehe-memory/experience.sqlite") };
}

function recallOne(project, query, id) {
  const result = recallExperiences(project, query);
  assert.equal(result.status, "ok", JSON.stringify({ query, result }));
  assert.equal(result.authority, "advisory-only");
  assert.equal(result.trust, "untrusted-context");
  assert.ok(result.records.some((record) => record.id === id), JSON.stringify({ query, result }));
  assert.ok(JSON.stringify(result.records).length <= 6000);
  return result.records.find((record) => record.id === id);
}

async function memory(project, ...args) {
  try {
    const result = await exec(process.execPath, [cli, ...args, "--project", project, "--json"], {
      windowsHide: true, maxBuffer: 2 * 1024 * 1024,
    });
    return { code: 0, value: JSON.parse(result.stdout) };
  } catch (error) {
    return { code: error.code, value: JSON.parse(error.stderr || error.stdout) };
  }
}

describe("memory text contract across canonical notes, index and recall", { concurrency: 2 }, () => {
test("literal multilingual words and normalized variants round-trip from every searchable field", async (t) => {
  const f = await fixture(t);
  const first = await f.seed("contract-language-one", {
    title: "İstanbul",
    problem: "हिंदी",
    cause: "άλφα",
    resolution: "اَلْعَرَبِيَّةُ",
    outcome: "น้ำท่วม",
    tags: ["ＡＰＩ", "ﬃxture", "😀"],
  });
  const second = await f.seed("contract-language-two", {
    title: "한글기억".normalize("NFD"),
    problem: "cafe\u0301",
    cause: "Straße",
    resolution: "記憶搜尋",
    outcome: "transactionproof",
    tags: ["կարգավորում", "𐐀𐐁"],
  });
  const indexed = syncExperiences(f.project);
  assert.equal(indexed.indexed, 2);
  const cases = [
    [first, ["İstanbul", "istanbul", "हिंदी", "άλφα", "ΆΛΦΑ", "اَلْعَرَبِيَّةُ", "น้ำท่วม", "ＡＰＩ", "api", "ﬃxture", "ffixture"]],
    [second, ["한글기억", "한글기억".normalize("NFD"), "café", "cafe\u0301", "cafe", "Straße", "straße", "記憶搜尋", "transactionpr", "կարգավորում", "𐐨𐐩"]],
  ];
  const failures = [];
  for (const [saved, queries] of cases) {
    for (const query of queries) {
      try {
        const record = recallOne(f.project, query, saved.note.id);
        for (const field of proseFields) assert.equal(record[field], saved.note[field]);
        assert.deepEqual(record.tags, saved.note.tags);
      } catch (error) { failures.push(`${JSON.stringify(query)}: ${error.message}`); }
    }
    assert.equal(await readFile(saved.notePath, "utf8"), saved.original);
  }
  assert.deepEqual(failures, []);
  await writeFile(path.join(f.project, "src/evidence.txt"), "changed after capture\n");
  const stale = memoryContext(f.project, "İstanbul");
  assert.equal(stale.count, 0);
  assert.equal(stale.authority, "advisory-only");
});

test("normalization-expanded input is rejected before replacing a healthy canonical note or creating a cache", async (t) => {
  const f = await fixture(t);
  const good = await f.seed("contract-byte-budget", { title: "healthycontract evidence" });
  const expanded = "\ufdfa".repeat(1200);
  assert.equal(expanded.length, 1200);
  assert.ok(Buffer.byteLength(expanded) < 32768);
  assert.ok(Buffer.byteLength(expanded.normalize("NFKC")) > 32768);
  assert.equal(existsSync(f.database), false);
  assert.throws(() => recordExperience(f.project, input({ resolution: expanded })), { code: "MEMORY_LIMIT_EXCEEDED" });
  assert.equal(await readFile(good.notePath, "utf8"), good.original);
  assert.equal(existsSync(f.database), false);
  assert.equal(syncExperiences(f.project).indexed, 1);
  const context = memoryContext(f.project, "healthycontract");
  assert.equal(context.status, "ok");
  assert.equal(context.records[0].id, good.note.id);
});

test("retained source-valid over-budget notes are skipped individually without blocking healthy context", async (t) => {
  const f = await fixture(t);
  const good = await f.seed("contract-good-history", { title: "healthycontract evidence" });
  const id = "contract-expanded-history";
  const notePath = await current(f.project, id, "complete");
  const legacy = { ...good.note, run_id: id, title: "legacyexpansion evidence", resolution: "\ufdfa".repeat(1200) };
  delete legacy.id;
  legacy.id = `experience-${hash(canonical(legacy)).slice(0, 32)}`;
  const bytes = JSON.stringify(legacy);
  await writeFile(notePath, bytes);
  const indexed = syncExperiences(f.project);
  assert.equal(indexed.status, "ok");
  assert.equal(indexed.indexed, 1);
  assert.equal(indexed.skipped, 1);
  const context = memoryContext(f.project, "healthycontract");
  assert.equal(context.status, "ok");
  assert.equal(context.count, 1);
  assert.equal(context.records[0].id, good.note.id);
  assert.equal(await readFile(good.notePath, "utf8"), good.original);
  assert.equal(await readFile(notePath, "utf8"), bytes);
});

test("bounded expanding queries, prefixes and stopwords share the safe public CLI search flow", async (t) => {
  const f = await fixture(t);
  const note = await f.seed("contract-query-bounds", {
    title: "boundaryquery search evidence",
    resolution: "\ufdfa".repeat(100),
  });
  assert.equal(syncExperiences(f.project).indexed, 1);
  for (const query of ["\ufdfa", "\ufdfa".repeat(400), "boundaryq", 'boundaryquery") OR repo_id:foreign --']) {
    const result = await memory(f.project, "recall", "--query", query);
    assert.equal(result.code, 0, JSON.stringify(result));
    assert.equal(result.value.count, 1, JSON.stringify({ query, result }));
    assert.equal(result.value.records[0].id, note.note.id);
    assert.equal(result.value.authority, "advisory-only");
  }
  for (const query of ["please help need using build existing", "😀 / () * \"", "\u0301\u0308"]) {
    const result = await memory(f.project, "recall", "--query", query);
    assert.equal(result.code, 0, JSON.stringify(result));
    assert.equal(result.value.count, 0);
  }
  const rejected = await memory(f.project, "recall", "--query", "\ufdfa".repeat(401));
  assert.equal(rejected.code, 1);
  assert.equal(rejected.value.code, "MEMORY_INVALID_INPUT");
  assert.equal(await readFile(note.notePath, "utf8"), note.original);
});

test("the exact normalized UTF-8 index budget is accepted end-to-end and one extra byte cannot replace it", async (t) => {
  const f = await fixture(t);
  const fields = { title: "a", problem: "b", cause: "c", resolution: "\ufdfa".repeat(992) + "a".repeat(24), outcome: "e", tags: [] };
  // Compute the actual representation independently of the production helper:
  // five fields, four separators, NFKC and lowercase, then UTF-8 bytes.
  const body = [fields.title, fields.problem, fields.cause, fields.resolution, fields.outcome]
    .join("\n").normalize("NFKC").toLowerCase();
  assert.equal(Buffer.byteLength(body, "utf8"), 32768);
  const good = await f.seed("contract-exact-byte-budget", fields);
  assert.equal(syncExperiences(f.project).indexed, 1);
  recallOne(f.project, "\ufdfa", good.note.id);

  const overBudget = { ...fields, resolution: fields.resolution + "a" };
  const overBody = [overBudget.title, overBudget.problem, overBudget.cause, overBudget.resolution, overBudget.outcome]
    .join("\n").normalize("NFKC").toLowerCase();
  assert.equal(Buffer.byteLength(overBody, "utf8"), 32769);
  assert.throws(() => recordExperience(f.project, input(overBudget)), { code: "MEMORY_LIMIT_EXCEEDED" });
  assert.equal(await readFile(good.notePath, "utf8"), good.original);
  assert.equal(existsSync(f.database), false);
  recallOne(f.project, "\ufdfa", good.note.id);
});
});
