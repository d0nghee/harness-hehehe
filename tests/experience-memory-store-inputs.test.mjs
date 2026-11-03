import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { invokeStore } from "../plugins/hehehe/skills/experience-memory/scripts/sqlite-store.mjs";

const worker = fileURLToPath(new URL("../plugins/hehehe/skills/experience-memory/scripts/sqlite_worker.py", import.meta.url));
const python = (process.env.HEHEHE_MEMORY_PYTHON ? [[process.env.HEHEHE_MEMORY_PYTHON, []]]
  : process.platform === "win32" ? [["python", []], ["py", ["-3"]]] : [["python3", []], ["python", []]])
  .find(([command, prefix]) => spawnSync(command, [...prefix, "-I", "-B", "-S", "-c", "import sqlite3"],
    { windowsHide: true, timeout: 10000 }).status === 0);

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-store-input-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, database: path.join(root, "memory.sqlite"), repoId: "input-contract" };
}
const row = (id = "healthy", text = "inputcontract", payload = { id }) => ({ id, text, payload });
const call = (f, operation, extra = {}) => invokeStore({ operation, database: f.database, repoId: f.repoId, ...extra });
function direct(input) {
  return directRaw(JSON.stringify(input));
}
function directRaw(input) {
  assert.ok(python, "existing Python SQLite runtime is required by the integration tests");
  const [command, prefix] = python;
  const result = spawnSync(command, [...prefix, "-I", "-B", "-S", worker], {
    input, encoding: "utf8", windowsHide: true, timeout: 10000,
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test("invalid UTF-16 repository and record identities fail before creating or replacing a store", (t) => {
  const f = fixture(t);
  const variants = [
    { repoId: "bad\ud800" }, { repoId: "bad\udfff" },
    { records: [row("bad\ud800")] }, { records: [row("bad\udfff")] },
  ];
  const failures = [];
  for (const [index, variant] of variants.entries()) {
    const database = path.join(f.root, `fresh-${index}`, "memory.sqlite");
    const result = call(f, "sync", { database, records: [row()], ...variant });
    if (result.error_code !== "MEMORY_INVALID_INPUT") failures.push({ index, result });
    if (fs.existsSync(path.dirname(database))) failures.push({ index, unexpectedDirectory: true });
  }
  assert.deepEqual(failures, []);
  assert.equal(call(f, "sync", { records: [row()] }).status, "ok");
  const bytes = fs.readFileSync(f.database);
  for (const variant of variants) {
    assert.equal(call(f, "sync", { records: [row()], ...variant }).error_code, "MEMORY_INVALID_INPUT");
    assert.deepEqual(fs.readFileSync(f.database), bytes);
  }
});

test("invalid UTF-16 database names and direct worker identities cannot create parent paths", (t) => {
  const f = fixture(t);
  const failures = [];
  for (const [index, lone] of ["\ud800", "\udfff"].entries()) {
    const database = path.join(f.root, `bad-${index}-${lone}`, "memory.sqlite");
    const result = call(f, "sync", { database, records: [row()] });
    if (result.error_code !== "MEMORY_INVALID_INPUT") failures.push({ index, result });
  }
  if (fs.readdirSync(f.root).length) failures.push({ unexpectedPaths: fs.readdirSync(f.root) });
  for (const [index, variant] of [{ repoId: "bad\ud800" }, { records: [row("bad\udfff")] }].entries()) {
    const database = path.join(f.root, `direct-${index}`, "memory.sqlite");
    const result = direct({ operation: "sync", database, repoId: f.repoId, records: [row()], ...variant });
    if (result.error_code !== "MEMORY_INVALID_INPUT") failures.push({ direct: index, result });
    if (fs.existsSync(path.dirname(database))) failures.push({ direct: index, unexpectedDirectory: true });
  }
  assert.deepEqual(failures, []);
});

test("bridge operations, database paths, repository identities and result limits keep their boundary types", (t) => {
  const f = fixture(t);
  for (const input of [null, undefined, true, [], {}, { operation: "unknown" }]) {
    assert.equal(invokeStore(input).error_code, "MEMORY_INVALID_INPUT");
  }
  const overlongAbsolute = path.parse(f.database).root + "x".repeat(4097 - path.parse(f.database).root.length);
  assert.equal(overlongAbsolute.length, 4097);
  assert.ok(path.isAbsolute(overlongAbsolute));
  for (const database of [null, 1, false, "relative.sqlite", "bad\0path", "x".repeat(4097), overlongAbsolute]) {
    assert.equal(call(f, "status", { database }).error_code, "MEMORY_INVALID_INPUT");
  }
  assert.equal(call(f, "status", { database: f.root }).error_code, "MEMORY_UNSAFE_PATH");
  for (const repoId of [undefined, null, 1, false, "", "x".repeat(201), "bad\0id"]) {
    assert.equal(call(f, "status", { repoId }).error_code, "MEMORY_INVALID_INPUT");
  }
  for (const limit of [0, 51, -1, 1.5, "1", null, true, false]) {
    assert.equal(call(f, "search", { limit, terms: "inputcontract" }).error_code, "MEMORY_INVALID_INPUT");
  }
  assert.deepEqual(fs.readdirSync(f.root), []);
  const unicodeDatabase = path.join(f.root, "한글-😀", "memory.sqlite");
  assert.equal(call(f, "status", { database: unicodeDatabase }).database_exists, false);
  assert.equal(fs.existsSync(path.dirname(unicodeDatabase)), false);
  assert.equal(call(f, "sync", { database: unicodeDatabase, records: [row("unicode-path")] }).count, 1);
  assert.equal(call(f, "search", { database: unicodeDatabase, terms: "inputcontract" }).count, 1);
  const maximumIdentity = "😀".repeat(200);
  assert.equal(call(f, "sync", { repoId: maximumIdentity, records: [row(maximumIdentity)] }).status, "ok");
  for (const limit of [1, 50]) {
    const result = call(f, "search", { repoId: maximumIdentity, terms: "inputcontract", limit });
    assert.equal(result.count, 1);
    assert.deepEqual(result.records, [{ id: maximumIdentity }]);
  }
  assert.equal(call(f, "status", { repoId: maximumIdentity }).count, 1);
});

test("record arrays enforce exact row shape, identity and the zero/512/513 collection boundary", (t) => {
  const f = fixture(t);
  assert.equal(call(f, "sync", { records: [row()] }).status, "ok");
  const bytes = fs.readFileSync(f.database);
  const invalidRows = [undefined, null, {}, false, [null], [[]],
    [{ id: "missing-payload", text: "valid" }], [{ ...row(), extra: true }],
    ...[null, 1, false, "", "x".repeat(201), "bad\0id"].map(id => [row(id)]),
    [row("duplicate"), row("duplicate")],
    ...[null, 1, false, "bad\0text", "\ud800"].map(text => [row("text", text)])];
  for (const records of invalidRows) {
    assert.equal(call(f, "sync", { records }).error_code, "MEMORY_INVALID_INPUT");
    assert.deepEqual(fs.readFileSync(f.database), bytes);
  }
  assert.equal(call(f, "sync", { records: [] }).count, 0);
  const records = Array.from({ length: 512 }, (_, index) => row(`record-${index}`, "collectioncontract", index));
  assert.equal(call(f, "sync", { records }).count, 512);
  const full = fs.readFileSync(f.database);
  assert.equal(call(f, "sync", { records: [...records, row("record-513")] }).error_code, "MEMORY_INVALID_INPUT");
  assert.deepEqual(fs.readFileSync(f.database), full);
  assert.equal(call(f, "status").count, 512);
});

test("UTF-8 text and opaque JSON payloads accept exact byte limits without weakening replacement atomicity", (t) => {
  const f = fixture(t);
  const payload = "p".repeat(65534);
  assert.equal(Buffer.byteLength(JSON.stringify(payload)), 65536);
  const text = "界".repeat(10922) + "xx";
  assert.equal(Buffer.byteLength(text), 32768);
  assert.equal(call(f, "sync", { records: [row("maximum", text, payload)] }).status, "ok");
  const bytes = fs.readFileSync(f.database);
  for (const records of [[row("too-large-text", text + "x")], [row("too-large-payload", "valid", payload + "p")]]) {
    assert.equal(call(f, "sync", { records }).error_code, "MEMORY_INVALID_INPUT");
    assert.deepEqual(fs.readFileSync(f.database), bytes);
  }
  for (const invalidPayload of [NaN, Infinity, -Infinity, { nested: NaN }, [Infinity]]) {
    assert.equal(call(f, "sync", { records: [row("invalid-json", "valid", invalidPayload)] }).error_code, "MEMORY_INVALID_INPUT");
    assert.deepEqual(fs.readFileSync(f.database), bytes);
    const database = path.join(f.root, "invalid-json", "memory.sqlite");
    assert.equal(call(f, "sync", { database, records: [row("invalid-json", "valid", invalidPayload)] }).error_code, "MEMORY_INVALID_INPUT");
    assert.equal(fs.existsSync(path.dirname(database)), false);
  }
  assert.deepEqual(call(f, "search", { terms: "界界" }).records, [payload]);
  const values = [null, true, 7, ["opaque"], { extra: { allowed: true } }, Number.MAX_VALUE, Number.MIN_VALUE];
  assert.equal(call(f, "sync", { records: values.map((value, index) => row(`opaque-${index}`, "opaquepayload", value)) }).count, values.length);
  assert.deepEqual(call(f, "search", { terms: "opaquepayload", limit: 50 }).records, values);
  assert.equal(call(f, "sync", { records: [row("empty-text", "", null)] }).count, 1);
  assert.equal(call(f, "search", { terms: [] }).status, "empty");
});

test("native query source and ignored-token arrays accept their exact bridge limits read-only", (t) => {
  const f = fixture(t);
  const maximum = "x".repeat(32768);
  assert.equal(call(f, "sync", { records: [row("maximum-query", maximum)] }).status, "ok");
  const bytes = fs.readFileSync(f.database);
  const ignored_terms = Array.from({ length: 256 }, (_, index) => `${index}`.padEnd(128, "i"));
  assert.equal(call(f, "search", { terms: maximum, ignored_terms }).count, 1);
  assert.equal(call(f, "search", { terms: maximum + "x", ignored_terms }).error_code, "MEMORY_INVALID_INPUT");
  assert.equal(call(f, "search", { terms: "x", ignored_terms: [...ignored_terms, "extra"] }).error_code, "MEMORY_INVALID_INPUT");
  assert.equal(call(f, "search", { terms: "x", ignored_terms: ["x".repeat(129)] }).error_code, "MEMORY_INVALID_INPUT");
  assert.equal(call(f, "search", { terms: [], ignored_terms: [] }).status, "empty");
  assert.equal(call(f, "search", { terms: " ", ignored_terms: [] }).status, "empty");
  assert.deepEqual(fs.readFileSync(f.database), bytes);
});

test("bridge envelope and configured-runtime inputs stay bounded without filesystem side effects", (t) => {
  const f = fixture(t);
  const request = { operation: "probe", padding: "" };
  request.padding = "x".repeat(1024 * 1024 - Buffer.byteLength(JSON.stringify(request)));
  assert.equal(Buffer.byteLength(JSON.stringify(request)), 1024 * 1024);
  assert.equal(invokeStore(request).status, "ok");
  assert.equal(invokeStore({ ...request, padding: request.padding + "x" }).error_code, "MEMORY_INVALID_INPUT");
  const cyclic = { operation: "probe" }; cyclic.self = cyclic;
  assert.equal(invokeStore(cyclic).error_code, "MEMORY_INVALID_INPUT");
  const previous = process.env.HEHEHE_MEMORY_PYTHON;
  try {
    for (const configured of ["relative-python", path.join(f.root, "missing-python.exe"), process.execPath]) {
      process.env.HEHEHE_MEMORY_PYTHON = configured;
      assert.equal(invokeStore({ operation: "probe" }).error_code, "MEMORY_RUNTIME_UNAVAILABLE");
    }
    assert.ok(python);
    const [command, prefix] = python;
    const executable = spawnSync(command, [...prefix, "-I", "-B", "-S", "-c", "import sys;print(sys.executable)"], {
      encoding: "utf8", windowsHide: true, timeout: 10000,
    });
    assert.equal(executable.status, 0, executable.stderr);
    process.env.HEHEHE_MEMORY_PYTHON = executable.stdout.trim();
    assert.equal(invokeStore({ operation: "probe" }).status, "ok");
  } finally {
    if (previous === undefined) delete process.env.HEHEHE_MEMORY_PYTHON;
    else process.env.HEHEHE_MEMORY_PYTHON = previous;
  }
  assert.deepEqual(fs.readdirSync(f.root), []);
});

test("direct JSON numbers share Node's finite range before writes and when reading persisted payloads", (t) => {
  const f = fixture(t);
  for (const [index, literal] of ["1" + "0".repeat(400), "1e400", "-1e400", "[1e400]", '{"nested":1e400}'].entries()) {
    const database = path.join(f.root, `overflow-${index}`, "memory.sqlite");
    const request = JSON.stringify({ operation: "sync", database, repoId: f.repoId, records: [row("overflow", "numericproof", "PLACEHOLDER")] });
    assert.equal(directRaw(request.replace('"PLACEHOLDER"', literal)).error_code, "MEMORY_INVALID_INPUT");
    assert.equal(fs.existsSync(path.dirname(database)), false);
  }
  assert.equal(call(f, "sync", { records: [row("healthy", "numericproof", Number.MAX_VALUE)] }).status, "ok");
  assert.deepEqual(call(f, "search", { terms: "numericproof" }).records, [Number.MAX_VALUE]);
  const [command, prefix] = python;
  const corrupt = spawnSync(command, [...prefix, "-I", "-B", "-S", "-c",
    'import sqlite3,sys\nc=sqlite3.connect(sys.argv[1]);c.execute("UPDATE memory_records SET payload = ?",(sys.argv[2],));c.commit();c.close()',
    f.database, "1" + "0".repeat(400)], { encoding: "utf8", windowsHide: true, timeout: 10000 });
  assert.equal(corrupt.status, 0, corrupt.stderr);
  const bytes = fs.readFileSync(f.database);
  assert.equal(call(f, "search", { terms: "numericproof" }).error_code, "MEMORY_STORE_CORRUPT");
  assert.deepEqual(fs.readFileSync(f.database), bytes);
});
