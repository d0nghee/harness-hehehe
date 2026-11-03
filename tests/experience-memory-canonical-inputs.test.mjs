import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { recordExperience, syncExperiences, recallExperiences } from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { createExperienceService } from "../plugins/hehehe/skills/experience-memory/scripts/experience.mjs";
import { canonical, hash } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-canonical-input-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "src/proof.txt"), "canonical input evidence\n");
  const git = (...args) => execFileSync("git", ["-C", project, ...args], { encoding: "utf8", windowsHide: true });
  git("init", "-b", "main");
  fs.appendFileSync(path.join(project, ".git/config"), "\n[user]\n name = Canonical Input\n email = canonical@example.test\n[core]\n autocrlf = false\n[maintenance]\n auto = false\n[gc]\n auto = 0\n");
  git("add", "src"); git("commit", "-m", "private canonical input evidence");
  const run = "canonical-source";
  function state(id, value = { schema_version: 1, run_id: id, status: "complete" }) {
    const directory = path.join(project, ".hehehe/runs", id);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify(value));
    return path.join(directory, "experience.json");
  }
  const notePath = state(run, { schema_version: 1, run_id: run, status: "active" });
  fs.writeFileSync(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${run}/state.json` }));
  const input = { schema_version: 1, title: "canonicalproof source-backed lesson",
    problem: "Every retained input must be checked against current evidence.",
    cause: "Cached metadata is not authority.", resolution: "Reread the canonical note and its source.",
    outcome: "Keep eligible context while excluding invalid entries.", tags: ["canonicalproof"], source_paths: ["src/proof.txt"] };
  const note = recordExperience(project, input).record;
  state(run);
  return { root, project, run, note, notePath, input, state };
}

function identity(note) {
  const { id, ...rest } = note;
  return `experience-${hash(canonical(rest)).slice(0, 32)}`;
}

test("canonical notes require all sixteen known keys and valid derived source metadata", (t) => {
  const f = fixture(t);
  const keys = ["schema_version", "title", "problem", "cause", "resolution", "outcome", "tags", "expires_at",
    "id", "repo_id", "run_id", "recorded_at", "head", "sources", "source_fingerprint", "trust"];
  assert.deepEqual(Object.keys(f.note).sort(), [...keys].sort());
  const original = fs.readFileSync(f.notePath);
  let number = 0;
  function invalid(mutate, { preserveId = false, sourceFingerprint = false } = {}) {
    const run = `invalid-canonical-${number++}`;
    const note = { ...structuredClone(f.note), run_id: run };
    mutate(note);
    if (sourceFingerprint) note.source_fingerprint = hash(canonical(note.sources));
    if (!preserveId) note.id = identity(note);
    fs.writeFileSync(f.state(run), JSON.stringify(note));
  }
  for (const key of keys) {
    invalid(note => { delete note[key]; }, { preserveId: key === "id" });
    invalid(note => { note[key] = null; }, { preserveId: key === "id" });
    for (const value of [[], {}, true, 1]) {
      if (key === "schema_version" && value === 1 || key === "tags" && Array.isArray(value)) continue;
      invalid(note => { note[key] = value; }, { preserveId: key === "id" });
    }
  }
  for (const changes of [{ schema_version: 2 }, { repo_id: "foreign-repository" }, { run_id: "another-run" },
    { trust: "trusted" }, { head: "g".repeat(40) }, { head: "a".repeat(39) }, { source_fingerprint: "a".repeat(63) },
    { source_fingerprint: "0".repeat(64) }, { approval: true },
    { head: [f.note.head] }, { source_fingerprint: [f.note.source_fingerprint] }]) {
    invalid(note => Object.assign(note, changes));
  }
  for (const sources of [[], Array(17).fill(f.note.sources[0]), [f.note.sources[0], f.note.sources[0]],
    [{ path: "../outside.txt", sha256: f.note.sources[0].sha256 }], [{ path: "src/proof.txt" }],
    [{ sha256: f.note.sources[0].sha256 }], [{ ...f.note.sources[0], extra: true }],
    [{ ...f.note.sources[0], sha256: "0".repeat(63) }], [{ ...f.note.sources[0], sha256: "g".repeat(64) }],
    ...[[], {}, true, 1, [f.note.sources[0].sha256]].map(sha256 => [{ ...f.note.sources[0], sha256 }])]) {
    invalid(note => { note.sources = sources; }, { sourceFingerprint: true });
  }
  const indexed = syncExperiences(f.project);
  assert.equal(indexed.indexed, 1);
  assert.equal(indexed.skipped, number);
  const recalled = recallExperiences(f.project, "canonicalproof");
  assert.equal(recalled.count, 1);
  assert.equal(recalled.records[0].id, f.note.id);
  assert.deepEqual(fs.readFileSync(f.notePath), original);
});

test("cached note, origin and digest inputs are checked against the real canonical source", (t) => {
  const f = fixture(t);
  const healthy = { note: f.note, origin: { root: f.project, path: `.hehehe/runs/${f.run}/experience.json` },
    digest: hash(canonical(f.note)) };
  const variants = [null, [], 1];
  for (const key of ["note", "origin", "digest"]) {
    const missing = structuredClone(healthy); delete missing[key]; variants.push(missing);
    variants.push({ ...structuredClone(healthy), [key]: null });
  }
  variants.push({ ...structuredClone(healthy), approval: true });
  variants.push({ ...structuredClone(healthy), digest: "0".repeat(64) });
  variants.push({ ...structuredClone(healthy), note: { ...f.note, problem: "Forged cached content" } });
  for (const origin of [null, [], {}, { path: healthy.origin.path }, { root: f.project },
    { root: 1, path: healthy.origin.path }, { root: path.join(f.root, "foreign"), path: healthy.origin.path },
    { root: f.project, path: "../experience.json" }, { root: f.project, path: `.hehehe/runs/missing-run/experience.json` },
    { ...healthy.origin, approval: true }]) variants.push({ ...structuredClone(healthy), origin });
  const service = createExperienceService(() => ({ status: "ok", records: [...variants, healthy], database_exists: true, search_engine: "sqlite-fts5" }));
  const result = service.recallExperiences(f.project, "canonicalproof");
  assert.equal(result.count, 1);
  assert.equal(result.omitted, variants.length);
  assert.equal(result.records[0].id, f.note.id);
  assert.equal(result.authority, "advisory-only");
  assert.equal(fs.existsSync(path.join(f.project, ".git/hehehe-memory")), false);
});

test("retained run schema, identity and completed eligibility remain independent of note contents", (t) => {
  const f = fixture(t);
  for (const state of [null, [], {}, { schema_version: 2, run_id: f.run, status: "complete" },
    { schema_version: 1, run_id: "different-run", status: "complete" },
    { schema_version: 1, run_id: f.run, status: "active" },
    { schema_version: 1, run_id: f.run, status: "blocked" }]) {
    f.state(f.run, state);
    const result = syncExperiences(f.project);
    assert.equal(result.indexed, 0);
    assert.equal(result.skipped, 1);
  }
  f.state(f.run);
  assert.equal(syncExperiences(f.project).indexed, 1);
  assert.equal(recallExperiences(f.project, "canonicalproof").count, 1);
});

test("pointer, run-state and canonical-file byte limits accept exact valid JSON and reject one extra byte", (t) => {
  const f = fixture(t);
  const pointerPath = path.join(f.project, ".hehehe/current.json");
  const statePath = path.join(f.project, ".hehehe/runs", f.run, "state.json");
  const pointer = { schema_version: 1, active_run: `runs/${f.run}/state.json` };
  const state = { schema_version: 1, run_id: f.run, status: "complete" };
  function padded(value, maximum) {
    const json = JSON.stringify(value);
    return json + " ".repeat(maximum - Buffer.byteLength(json));
  }
  for (const [target, value, maximum] of [[pointerPath, pointer, 4096], [statePath, state, 65536]]) {
    fs.writeFileSync(target, padded(value, maximum));
    assert.equal(fs.statSync(target).size, maximum);
    assert.equal(recordExperience(f.project, f.input).status, "recorded");
    const original = fs.readFileSync(f.notePath);
    fs.writeFileSync(target, padded(value, maximum + 1));
    assert.throws(() => recordExperience(f.project, f.input), { code: "MEMORY_INVALID_SOURCE" });
    assert.deepEqual(fs.readFileSync(f.notePath), original);
    assert.equal(fs.existsSync(path.join(f.project, ".git/hehehe-memory")), false);
    fs.writeFileSync(target, JSON.stringify(value));
  }
  const captured = JSON.parse(fs.readFileSync(f.notePath, "utf8"));
  const otherRun = "canonical-other-source";
  const other = { ...captured, run_id: otherRun }; other.id = identity(other);
  const otherPath = f.state(otherRun);
  fs.writeFileSync(otherPath, JSON.stringify(other));
  const otherBytes = fs.readFileSync(otherPath);
  fs.writeFileSync(f.notePath, padded(captured, 20000));
  assert.equal(syncExperiences(f.project).indexed, 2);
  assert.equal(recallExperiences(f.project, "canonicalproof").count, 2);
  fs.writeFileSync(f.notePath, padded(captured, 20001));
  const indexed = syncExperiences(f.project);
  assert.equal(indexed.indexed, 1);
  assert.equal(indexed.skipped, 1);
  const recalled = recallExperiences(f.project, "canonicalproof");
  assert.equal(recalled.count, 1);
  assert.equal(recalled.records[0].run_id, otherRun);
  assert.equal(fs.statSync(f.notePath).size, 20001, "invalid retained notes are excluded, not rewritten");
  assert.deepEqual(fs.readFileSync(otherPath), otherBytes);
});
