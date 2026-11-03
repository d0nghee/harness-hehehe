import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { main, recordExperience, syncExperiences, recallExperiences, memoryContext, memoryStatus }
  from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { relativeFile, validateSourcePaths } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

const prose = ["title", "problem", "cause", "resolution", "outcome"];
const required = ["schema_version", ...prose, "tags", "source_paths"];
const input = (extra = {}) => ({ schema_version: 1, title: "publicmatrix input lesson",
  problem: "Curated input must have an explicit contract.", cause: "An unchecked boundary can accept unreadable records.",
  resolution: "Check each public field before publishing the note.", outcome: "Keep source-backed advisory context available.",
  tags: ["publicmatrix"], source_paths: ["src/evidence-0.txt"], ...extra });

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-public-inputs-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  const sourcePaths = Array.from({ length: 17 }, (_, index) => `src/evidence-${index}.txt`);
  for (const file of sourcePaths) fs.writeFileSync(path.join(project, file), `stable source ${file}\n`);
  const unicodePaths = ["src/line\u2028name.txt", "src/paragraph\u2029name.txt"];
  for (const file of unicodePaths) fs.writeFileSync(path.join(project, file), "stable Unicode filename evidence\n");
  const git = (...args) => execFileSync("git", ["-C", project, ...args], { encoding: "utf8", windowsHide: true });
  git("init", "-b", "main");
  fs.appendFileSync(path.join(project, ".git/config"), "\n[user]\n name = Public Input Matrix\n email = matrix@example.test\n[core]\n autocrlf = false\n[maintenance]\n auto = false\n[gc]\n auto = 0\n");
  git("add", "src"); git("commit", "-m", "isolated public input evidence");
  const run = "public-input-source", directory = path.join(project, ".hehehe/runs", run);
  fs.mkdirSync(directory, { recursive: true });
  const statePath = path.join(directory, "state.json"), pointerPath = path.join(project, ".hehehe/current.json");
  const state = { schema_version: 1, run_id: run, status: "active" };
  const pointer = { schema_version: 1, active_run: `runs/${run}/state.json` };
  fs.writeFileSync(statePath, JSON.stringify(state)); fs.writeFileSync(pointerPath, JSON.stringify(pointer));
  const notePath = path.join(directory, "experience.json"), database = path.join(project, ".git/hehehe-memory/experience.sqlite");
  const file = path.join(root, "input.json");
  const bytes = (target) => fs.existsSync(target) ? fs.readFileSync(target) : null;
  const snapshot = () => ({ note: bytes(notePath), database: bytes(database), state: bytes(statePath), pointer: bytes(pointerPath) });
  const unchanged = (before) => {
    const after = snapshot();
    const same = (left, right) => left === null || right === null ? left === right : left.equals(right);
    assert.ok(same(after.note, before.note), "Rejected input changed the canonical note bytes");
    assert.ok(same(after.database, before.database), "Rejected input created or changed the cache bytes");
    assert.ok(same(after.state, before.state), "Memory input changed the run state bytes");
    assert.ok(same(after.pointer, before.pointer), "Memory input changed the current-run pointer bytes");
  };
  recordExperience(project, input());
  return { root, project, run, sourcePaths, unicodePaths, state, pointer, statePath, pointerPath, notePath, database, file,
    snapshot, unchanged, complete() { fs.writeFileSync(statePath, JSON.stringify({ ...state, status: "complete" })); } };
}

function rejected(f, action, code) {
  const before = f.snapshot();
  assert.throws(action, code ? { code } : (error) => /^MEMORY_[A-Z_]+$/.test(error.code));
  f.unchanged(before);
}

// main() is synchronous. Capture only its structured transport output, without
// subprocess startup per parser case or modifying real CLI/module dependencies.
function cli(argv) {
  const oldOut = process.stdout.write, oldError = process.stderr.write;
  let stdout = "", stderr = "";
  try {
    process.stdout.write = (value) => { stdout += String(value); return true; };
    process.stderr.write = (value) => { stderr += String(value); return true; };
    const code = main(argv);
    return { code, stdout, stderr, value: JSON.parse(stdout || stderr) };
  } finally { process.stdout.write = oldOut; process.stderr.write = oldError; }
}

function cliRejected(f, argv, code = "MEMORY_INVALID_INPUT") {
  const before = f.snapshot(), result = cli(argv);
  assert.equal(result.code, 1, JSON.stringify(argv));
  assert.equal(result.stdout, "");
  assert.equal(result.value.code, code, JSON.stringify(argv));
  assert.equal(result.value.authority, "advisory-only");
  assert.deepEqual(Object.keys(result.value).sort(), ["authority", "code", "message", "status"]);
  f.unchanged(before);
}

test("record input keys require exact schema and required properties before mutation", (t) => {
  const f = fixture(t);
  for (const key of required) {
    const proposal = input(); delete proposal[key];
    rejected(f, () => recordExperience(f.project, proposal), "MEMORY_INVALID_INPUT");
  }
  for (const schema_version of [null, false, true, 0, 2, "1", {}, []]) {
    rejected(f, () => recordExperience(f.project, input({ schema_version })), "MEMORY_INVALID_INPUT");
  }
  for (const [key, value] of [...prose.map((key) => [key, null]), ["tags", null], ["source_paths", null], ["expires_at", null]]) {
    rejected(f, () => recordExperience(f.project, input({ [key]: value })), "MEMORY_INVALID_INPUT");
  }
  for (const value of [null, 1, "record", [], {}]) rejected(f, () => recordExperience(f.project, value), "MEMORY_INVALID_INPUT");
  for (const key of ["unknown", "approval", "verification", "required_checks", "constructor", "__proto__"]) {
    const proposal = JSON.parse(JSON.stringify(input()).slice(0, -1) + `,${JSON.stringify(key)}:true}`);
    rejected(f, () => recordExperience(f.project, proposal), "MEMORY_INVALID_INPUT");
  }
  const result = recordExperience(f.project, input({ tags: [], expires_at: undefined }));
  assert.equal(result.status, "recorded");
  assert.equal(result.authority, "advisory-only");
  assert.deepEqual(result.record.tags, []);
  assert.equal(Date.parse(result.record.expires_at) - Date.parse(result.record.recorded_at), 90 * 86400000);
  assert.equal(fs.existsSync(f.database), false);
});

test("source path arrays enforce count, shape, path and source identity boundaries", (t) => {
  const f = fixture(t);
  assert.deepEqual(validateSourcePaths([f.sourcePaths[0]]), [f.sourcePaths[0]]);
  assert.equal(validateSourcePaths(f.sourcePaths.slice(0, 16)).length, 16);
  const at400 = `${"a".repeat(199)}/${"b".repeat(200)}`;
  assert.equal(at400.length, 400);
  assert.equal(relativeFile(at400), at400);
  assert.throws(() => relativeFile(at400 + "b"), { code: "MEMORY_UNSAFE_PATH" });
  for (const source_paths of [[], f.sourcePaths, [f.sourcePaths[0], f.sourcePaths[0]], Array(1), [null], [undefined], [1], "src/evidence-0.txt"]) {
    rejected(f, () => recordExperience(f.project, input({ source_paths })),
      Array.isArray(source_paths) && source_paths.length === 1 ? "MEMORY_UNSAFE_PATH" : "MEMORY_INVALID_INPUT");
  }
  for (const file of ["../outside", "/absolute", "src//file", "src/./file", "src/../file", "C:/file", "src\\file", "src/file\0.txt",
    "src/file\n.txt", "src/file\ud800.txt", "src/file.", "src/file ", "src/NUL.txt", "src/.git/config", "src/.hehehe/current.json", "src/.env.local", "src/id_rsa"]) {
    rejected(f, () => recordExperience(f.project, input({ source_paths: [file] })), "MEMORY_UNSAFE_PATH");
  }
  for (const file of ["src/not-tracked.txt", "src"]) {
    rejected(f, () => recordExperience(f.project, input({ source_paths: [file] })), "MEMORY_INVALID_SOURCE");
  }
  const link = path.join(f.root, "source-hardlink.txt");
  fs.linkSync(path.join(f.project, f.sourcePaths[0]), link);
  try { rejected(f, () => recordExperience(f.project, input()), "MEMORY_UNSAFE_PATH"); }
  finally { fs.unlinkSync(link); }
  const sourceDirectory = path.join(f.project, "src"), originalDirectory = path.join(f.project, "source-original");
  fs.renameSync(sourceDirectory, originalDirectory);
  fs.symlinkSync(originalDirectory, sourceDirectory, process.platform === "win32" ? "junction" : "dir");
  try { rejected(f, () => recordExperience(f.project, input()), "MEMORY_UNSAFE_PATH"); }
  finally { fs.unlinkSync(sourceDirectory); fs.renameSync(originalDirectory, sourceDirectory); }
  const recorded = recordExperience(f.project, input({ source_paths: f.sourcePaths.slice(0, 16).toReversed() }));
  assert.equal(recorded.record.sources.length, 16);
  assert.deepEqual(recorded.record.sources.map((source) => source.path), [...f.sourcePaths.slice(0, 16)].sort());
  f.complete(); assert.equal(syncExperiences(f.project).indexed, 1);
  assert.equal(recallExperiences(f.project, "publicmatrix").count, 1);
  fs.writeFileSync(path.join(f.project, f.sourcePaths[0]), "changed source\n");
  assert.equal(recallExperiences(f.project, "publicmatrix").count, 0);
  const sourceFile = path.join(f.project, f.sourcePaths[0]);
  fs.writeFileSync(sourceFile, Buffer.alloc(4 * 1024 * 1024, "x"));
  assert.equal(recordExperience(f.project, input()).status, "recorded");
  fs.appendFileSync(sourceFile, "x");
  rejected(f, () => recordExperience(f.project, input()), "MEMORY_INVALID_SOURCE");
  for (const file of f.unicodePaths) {
    assert.equal(relativeFile(file), file);
    const result = recordExperience(f.project, input({ source_paths: [file] }));
    assert.equal(result.status, "recorded"); assert.equal(result.record.sources[0].path, file);
    assert.equal(syncExperiences(f.project).indexed, 1);
    assert.equal(recallExperiences(f.project, "publicmatrix").records[0].id, result.record.id);
  }
});

test("query, limit and context options reject invalid types without changing stored notes", (t) => {
  const f = fixture(t);
  for (const options of [null, false, true, 1, "false", [], { unknown: true },
    new Date(), new Map(), new Set(), /query/, new Boolean(false), Object.create({ limit: 1 }), Object.create({ sync: false })]) {
    rejected(f, () => recallExperiences(f.project, "publicmatrix", options), "MEMORY_INVALID_INPUT");
    const before = f.snapshot(), result = memoryContext(f.project, "publicmatrix", options);
    assert.equal(result.status, "unavailable"); assert.equal(result.code, "MEMORY_INVALID_INPUT");
    assert.equal(result.authority, "advisory-only"); f.unchanged(before);
  }
  for (const query of [undefined, null, 1, false, {}, [], "", " \t\n ", "x".repeat(401), "bad\0query", "bad\udfffquery"]) {
    const before = f.snapshot(), result = memoryContext(f.project, query);
    assert.equal(result.status, "unavailable"); assert.equal(result.code, "MEMORY_INVALID_INPUT");
    assert.equal(result.authority, "advisory-only"); assert.equal(result.count, 0); f.unchanged(before);
  }
  f.complete(); syncExperiences(f.project);
  for (const limit of [1, 5]) {
    const result = recallExperiences(f.project, "publicmatrix", { limit });
    assert.equal(result.count, 1); assert.equal(result.authority, "advisory-only");
  }
  const dictionaryLimit = Object.assign(Object.create(null), { limit: 1 });
  assert.equal(recallExperiences(f.project, "publicmatrix", dictionaryLimit).count, 1);
  const dictionarySync = Object.assign(Object.create(null), { sync: false }), beforeDictionary = f.snapshot();
  assert.equal(memoryContext(f.project, "publicmatrix", dictionarySync).count, 1); f.unchanged(beforeDictionary);
  for (const limit of [0, 6, -1, 1.5, NaN, Infinity, null, true, "1", {}, []]) {
    rejected(f, () => recallExperiences(f.project, "publicmatrix", { limit }), "MEMORY_INVALID_INPUT");
  }
  for (const query of [undefined, null, 1, false, {}, [], "", " \t\n ", "x".repeat(401), "bad\0query", "bad\udfffquery"]) {
    rejected(f, () => recallExperiences(f.project, query), "MEMORY_INVALID_INPUT");
  }
  for (const sync of [false, true]) assert.equal(memoryContext(f.project, "publicmatrix", { sync }).count, 1);
  for (const sync of [null, 0, 1, "true", {}, []]) {
    const before = f.snapshot(), result = memoryContext(f.project, "publicmatrix", { sync });
    assert.equal(result.status, "unavailable"); assert.equal(result.code, "MEMORY_INVALID_INPUT");
    assert.equal(result.authority, "advisory-only"); assert.equal(result.count, 0); f.unchanged(before);
  }
  assert.equal(recallExperiences(f.project, "build-with this").count, 0);
  assert.equal(recallExperiences(f.project, "😀").count, 0);
});

test("project and current-run inputs fail safely without note or cache mutations", (t) => {
  const f = fixture(t), before = f.snapshot();
  for (const project of [null, 1, {}, f.root, path.join(f.root, "missing"), path.join(f.project, "src"), path.join(f.project, f.sourcePaths[0])]) {
    rejected(f, () => memoryStatus(project));
  }
  assert.equal(memoryStatus(path.relative(process.cwd(), f.project)).database_exists, false);
  assert.equal(memoryStatus(f.project + path.sep).database_exists, false);
  const alias = path.join(f.root, "project-alias");
  fs.symlinkSync(f.project, alias, process.platform === "win32" ? "junction" : "dir");
  try { rejected(f, () => memoryStatus(alias), "MEMORY_UNSAFE_PATH"); }
  finally { fs.unlinkSync(alias); }
  for (const pointer of [{ ...f.pointer, schema_version: 2 }, { ...f.pointer, active_run: "../state.json" }, { ...f.pointer, active_run: null },
    ...[[f.pointer.active_run], [], {}, 1, true].map((active_run) => ({ ...f.pointer, active_run })),
    ...["\n", "\r", "\u2028", "\u2029"].map((suffix) => ({ ...f.pointer, active_run: f.pointer.active_run + suffix }))]) {
    fs.writeFileSync(f.pointerPath, JSON.stringify(pointer));
    rejected(f, () => recordExperience(f.project, input()), "MEMORY_INVALID_RUN");
  }
  fs.writeFileSync(f.pointerPath, JSON.stringify(f.pointer));
  for (const state of [{ ...f.state, schema_version: 2 }, { ...f.state, run_id: "other-source" }, { ...f.state, status: "blocked" }]) {
    fs.writeFileSync(f.statePath, JSON.stringify(state));
    rejected(f, () => recordExperience(f.project, input()), "MEMORY_INVALID_RUN");
  }
  fs.writeFileSync(f.statePath, JSON.stringify(f.state));
  f.unchanged(before);
});

test("CLI commands and flag grammar preserve safe structured responses", (t) => {
  const f = fixture(t); fs.writeFileSync(f.file, JSON.stringify(input()));
  const args = (command, ...rest) => [command, "--project", f.project, "--json", ...rest];
  for (const argv of [null, {}, false, 1, "status", [null], [1], ["status", , "--json"]]) cliRejected(f, argv);
  for (const argv of [[], ["unknown"], ["--help"], ["constructor"], ["toString"], ["__proto__"], args("record"), args("recall"),
    ["status", "--project"], args("status", "--query", "publicmatrix"), args("sync", "--limit", "1"),
    args("context", "--limit", "1"), args("status", "--unknown", "value"), args("status", "positional"),
    args("record", "--input", "--json"), args("record", "--input", f.file, "--input", f.file),
    args("recall", "--query", "publicmatrix", "--query", "other"), args("recall", "--query", "publicmatrix", "--limit", "1", "--limit", "2")]) {
    cliRejected(f, argv);
  }
  const beforeContext = f.snapshot(), missingContext = cli(args("context"));
  assert.equal(missingContext.code, 1);
  assert.equal(missingContext.value.status, "unavailable");
  assert.equal(missingContext.value.code, "MEMORY_INVALID_INPUT");
  assert.equal(missingContext.value.authority, "advisory-only");
  assert.equal(missingContext.stderr, ""); f.unchanged(beforeContext);
  for (const limit of ["0", "6", "-1", "1.5", "NaN", "Infinity", "five", "1\n", "1\r", "1\u2028", "1\u2029"]) cliRejected(f, args("recall", "--query", "publicmatrix", "--limit", limit));
  const recorded = cli(args("record", "--input", f.file));
  assert.equal(recorded.code, 0); assert.equal(recorded.value.status, "recorded");
  f.complete();
  for (const argv of [args("sync"), args("status"), args("recall", "--query", "publicmatrix", "--limit", "1"),
    args("context", "--query", "publicmatrix"), ["status", "--project", path.join(f.root, "missing"), "--project", f.project, "--json", "--json"]]) {
    const result = cli(argv); assert.equal(result.code, 0, result.stderr); assert.equal(result.stderr, "");
    assert.equal(result.value.authority, "advisory-only");
  }
  const compact = cli(["status", "--project", f.project]);
  assert.equal(compact.code, 0); assert.equal(compact.stdout.trim().split("\n").length, 1);
});

test("CLI input files enforce JSON, UTF-8, regular-file and exact20k bounds", (t) => {
  const f = fixture(t), argv = ["record", "--project", f.project, "--input", f.file, "--json"];
  for (const value of [null, [], 1, "input", {}]) {
    fs.writeFileSync(f.file, JSON.stringify(value)); cliRejected(f, argv);
  }
  for (const bytes of [Buffer.alloc(0), Buffer.from('{"schema_version":'), Buffer.from([0xc3, 0x28]),
    Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(JSON.stringify(input()))])]) {
    fs.writeFileSync(f.file, bytes); cliRejected(f, argv, "MEMORY_INVALID_SOURCE");
  }
  const serialized = JSON.stringify(input()), atLimit = " ".repeat(20000 - Buffer.byteLength(serialized)) + serialized;
  assert.equal(Buffer.byteLength(atLimit), 20000);
  fs.writeFileSync(f.file, atLimit); assert.equal(cli(argv).code, 0);
  fs.writeFileSync(f.file, " " + atLimit); cliRejected(f, argv, "MEMORY_INVALID_SOURCE");
  fs.writeFileSync(f.file, JSON.stringify(input()));
  const hardlink = path.join(f.root, "input-hardlink.json"); fs.linkSync(f.file, hardlink);
  try { cliRejected(f, argv, "MEMORY_UNSAFE_PATH"); }
  finally { fs.unlinkSync(hardlink); }
  const directory = path.join(f.root, "input-original"), alias = path.join(f.root, "input-alias");
  fs.mkdirSync(directory); fs.writeFileSync(path.join(directory, "input.json"), JSON.stringify(input()));
  fs.symlinkSync(directory, alias, process.platform === "win32" ? "junction" : "dir");
  try { cliRejected(f, ["record", "--project", f.project, "--input", path.join(alias, "input.json"), "--json"], "MEMORY_UNSAFE_PATH"); }
  finally { fs.unlinkSync(alias); }
  fs.unlinkSync(f.file); cliRejected(f, argv, "MEMORY_INVALID_SOURCE");
  fs.mkdirSync(f.file); cliRejected(f, argv, "MEMORY_INVALID_SOURCE");
});
