import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { invokeStore } from "../plugins/hehehe/skills/experience-memory/scripts/sqlite-store.mjs";

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-native-tokenizer-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, database: path.join(root, "memory.sqlite"), repoId: "native-tokenizer" };
}

const row = (id, text) => ({ id, text, payload: { id } });
const call = (f, operation, options = {}) => invokeStore({ operation, database: f.database, repoId: f.repoId, ...options });
function matches(f, terms, options = {}) {
  const result = call(f, "search", { terms, limit: 50, ...options });
  assert.ok(["ok", "empty"].includes(result.status), JSON.stringify(result));
  return result.records.map((record) => record.id);
}

test("query words use the index's native unicode61 boundaries across scripts and combining marks", (t) => {
  const f = fixture(t);
  const corpus = [
    ["turkish", "i\u0307stanbul", ["i\u0307stanbul", "istanbul", "İstanbul"]],
    ["accent", "café", ["café", "cafe", "cafe\u0301"]],
    ["hindi", "हिंदी", ["हिंदी"]],
    ["hebrew", "מִבְחָן", ["מִבְחָן"]],
    ["arabic", "مُعَالَجَة", ["مُعَالَجَة"]],
    ["thai", "การทดสอบ", ["การทดสอบ"]],
    ["greek", "κόσμος", ["κόσμος", "ΚΌΣΜΟΣ"]],
    ["korean", "한글", ["한글"]],
    ["chinese", "字", ["字"]],
    ["deseret", "\u{10400}\u{10401}", ["\u{10400}\u{10401}", "\u{10428}\u{10429}"]],
    ["kawi", "\u{11f04}\u{11f05}", ["\u{11f04}\u{11f05}"]],
    ["tangut", "\u{17000}\u{17001}", ["\u{17000}\u{17001}"]],
    ["toto", "\u{1e290}\u{1e291}", ["\u{1e290}\u{1e291}"]],
    ["private", "\ue000\ue001", ["\ue000\ue001"]],
  ];
  assert.equal(call(f, "sync", { records: corpus.map(([id, text]) => row(id, text)) }).status, "ok");
  for (const [id, , queries] of corpus) {
    for (const query of queries) assert.ok(matches(f, query).includes(id), `${id}: ${JSON.stringify(query)}`);
  }
  assert.deepEqual(matches(f, "\"*():_"), []);
  assert.deepEqual(matches(f, "😀"), []);
});

test("ignored words are filtered after native tokenization before the first sixteen distinct terms", (t) => {
  const f = fixture(t);
  const terms = Array.from({ length: 17 }, (_, index) => `word${String(index).padStart(2, "0")}`);
  assert.equal(call(f, "sync", { records: terms.map((term) => row(term, term)) }).status, "ok");
  const query = `BUILD-with ${terms[16]} ${terms.toReversed().join(" ")}`;
  const found = matches(f, query, { ignored_terms: ["build", "with"] });
  assert.equal(found.length, 16);
  assert.ok(!found.includes("word00"), "query order, rather than alphabetical vocabulary order, selects the first sixteen distinct terms");
  assert.ok(found.includes("word16"), "a repeated term must not consume another slot");
  assert.deepEqual(matches(f, "PLEASE build-with this", { ignored_terms: ["please", "build", "with", "this"] }), []);
});

test("long literal query words retain their distinguishing suffix while prefix search remains available", (t) => {
  const f = fixture(t);
  const first = `${"x".repeat(160)}alpha`;
  const second = `${"x".repeat(160)}beta`;
  assert.equal(call(f, "sync", { records: [row("first", first), row("second", second)] }).status, "ok");
  assert.deepEqual(matches(f, first), ["first"]);
  assert.deepEqual(new Set(matches(f, "x".repeat(160))), new Set(["first", "second"]));
});

test("native tokenization preserves bounded validation and cannot mutate persisted records", (t) => {
  const f = fixture(t);
  assert.equal(call(f, "sync", { records: [row("healthy", "sqlite unchanged")] }).status, "ok");
  const bytes = fs.readFileSync(f.database);
  const identity = fs.statSync(f.database).ino;
  for (const terms of [null, true, 1, {}, [1], ["valid", null], "bad\0text", "\ud800", "x".repeat(32769), "界".repeat(10923)]) {
    assert.equal(call(f, "search", { terms }).error_code, "MEMORY_INVALID_INPUT", JSON.stringify(terms).slice(0, 100));
  }
  for (const ignored_terms of [null, "build", {}, [1], [""], ["bad\0term"], ["\udfff"], ["x".repeat(129)], Array(257).fill("word")]) {
    assert.equal(call(f, "search", { terms: "sqlite", ignored_terms }).error_code, "MEMORY_INVALID_INPUT");
  }
  assert.deepEqual(matches(f, "sqlite\" OR repo_id:private NOT ( -- * NEAR()"), ["healthy"]);
  assert.deepEqual(fs.readFileSync(f.database), bytes);
  assert.equal(fs.statSync(f.database).ino, identity);
});

test("query tokenization is fileless for absent stores and read-only for valid stores", (t) => {
  const f = fixture(t);
  f.database = path.join(f.root, "absent", "nested", "memory.sqlite");
  const absent = call(f, "search", { terms: "İstanbul हिंदी", ignored_terms: ["build"] });
  assert.equal(absent.status, "empty");
  assert.equal(absent.database_exists, false);
  assert.deepEqual(fs.readdirSync(f.root), []);
  assert.equal(call(f, "sync", { records: [row("healthy", "i\u0307stanbul हिंदी")] }).status, "ok");
  const bytes = fs.readFileSync(f.database);
  const directory = fs.readdirSync(path.dirname(f.database));
  assert.deepEqual(matches(f, "İstanbul हिंदी"), ["healthy"]);
  assert.deepEqual(fs.readFileSync(f.database), bytes);
  assert.deepEqual(fs.readdirSync(path.dirname(f.database)), directory);
});
