import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { textLimits, memoryFields, indexText, queryText, queryStopwords, assertNoteSize,
  INDEX_TEXT_BYTES, QUERY_CHARACTERS, NOTE_CANONICAL_BYTES, NOTE_READ_BYTES,
} from "../plugins/hehehe/skills/experience-memory/scripts/text-contract.mjs";
import { recordExperience } from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { canonical, hash, validateSourcePaths } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

const limits = { title: 160, problem: 800, cause: 800, resolution: 1200, outcome: 400 };
const base = (extra = {}) => ({ schema_version: 1, title: "a", problem: "b", cause: "c", resolution: "d", outcome: "e", tags: [], ...extra });
const invalid = (action, code = "MEMORY_INVALID_INPUT") => assert.throws(action, { code });

test("memory text limits keep the reviewed character, canonical and index budgets", () => {
  assert.deepEqual(textLimits, limits);
  assert.equal(INDEX_TEXT_BYTES, 32768);
  assert.equal(QUERY_CHARACTERS, 400);
  assert.equal(NOTE_CANONICAL_BYTES, 18000);
  assert.equal(NOTE_READ_BYTES, 20000);
  assert.ok(Object.isFrozen(queryStopwords));
  assert.equal(new Set(queryStopwords).size, queryStopwords.length);
  for (const word of ["the", "implement", "build", "using"]) assert.ok(queryStopwords.includes(word));
  for (const word of ["sqlite", "transaction", "unicode"]) assert.ok(!queryStopwords.includes(word));
});

test("all prose fields enforce exact UTF-16 limits and preserve complete supplementary characters", () => {
  for (const [field, maximum] of Object.entries(limits)) {
    const ascii = "x".repeat(maximum);
    const paired = "😀".repeat(maximum / 2);
    assert.equal(memoryFields(base({ [field]: ascii }))[field], ascii, field);
    assert.equal(memoryFields(base({ [field]: paired }))[field], paired, field);
    invalid(() => memoryFields(base({ [field]: ascii + "x" })));
    invalid(() => memoryFields(base({ [field]: paired + "x" })));
    for (const value of [null, undefined, 1, true, {}, [], "", " \r\n\t "]) {
      invalid(() => memoryFields(base({ [field]: value })));
    }
  }
});

test("both complete lone-surrogate ranges are rejected at prose, tag and query boundaries", () => {
  // Every high and low surrogate is exercised independently. String boundaries
  // and a neighboring valid pair guard against accidentally accepting repair.
  for (let code = 0xd800; code <= 0xdfff; code += 1) {
    const lone = String.fromCharCode(code);
    invalid(() => memoryFields(base({ title: `before${lone}` })));
    invalid(() => memoryFields(base({ tags: [`${lone}after`] })));
    invalid(() => queryText(`before${lone}after`));
  }
  for (const lone of ["\ud800", "\udbff", "\udc00", "\udfff"]) {
    for (const field of Object.keys(limits)) {
      for (const value of [lone + "text", "text" + lone, "😀" + lone, lone + "😀"]) {
        invalid(() => memoryFields(base({ [field]: value })));
      }
    }
  }
  for (const pair of ["\ud800\udc00", "\udbff\udfff", "😀"]) {
    assert.equal(memoryFields(base({ title: pair })).title, pair);
    assert.equal(queryText(pair), pair);
  }
});

test("dense tags are bounded and checked for duplicates after canonical whitespace normalization", () => {
  assert.deepEqual(memoryFields(base()).tags, []);
  const eight = Array.from({ length: 8 }, (_, index) => `${index}${"x".repeat(39)}`);
  assert.deepEqual(memoryFields(base({ tags: eight })).tags, eight);
  assert.deepEqual(memoryFields(base({ tags: [" memory ", "line\r\nbreak", "Memory", "😀"] })).tags,
    ["memory", "line\nbreak", "Memory", "😀"]);
  for (const tags of [null, {}, "tag", ["x".repeat(41)], [...eight, "ninth"], ["same", " same "],
    ["line\r\nbreak", "line\nbreak"], [null], [undefined], [1], Array(1), ["valid", , "other"]]) {
    invalid(() => memoryFields(base({ tags })));
  }
  const expandingIterator = ["one"];
  expandingIterator[Symbol.iterator] = function* () { yield* [...eight, "ninth"]; };
  invalid(() => memoryFields(base({ tags: expandingIterator })));
});

test("derived UTF-8 budgets are exact after normalization rather than based on input characters", () => {
  const expanded = "\ufdfa".repeat(992);
  assert.equal(Buffer.byteLength(expanded), 2976);
  assert.equal(Buffer.byteLength(expanded.normalize("NFKC")), 32736);
  for (const padding of [23, 24]) {
    const content = memoryFields(base({ resolution: expanded + "a".repeat(padding) }));
    const indexed = indexText(content);
    assert.equal(Buffer.byteLength(indexed), 32744 + padding);
    assert.ok(Buffer.byteLength(indexed) <= INDEX_TEXT_BYTES);
  }
  const tooLarge = memoryFields(base({ resolution: expanded + "a".repeat(25) }));
  invalid(() => indexText(tooLarge), "MEMORY_LIMIT_EXCEEDED");
  // A different compatibility expansion and a different distribution of fields
  // prevent the size contract being special-cased to the reported Arabic form.
  const distributed = memoryFields(base(Object.fromEntries(Object.entries(limits)
    .map(([field, maximum]) => [field, "\u337f".repeat(maximum)]))));
  invalid(() => indexText(distributed), "MEMORY_LIMIT_EXCEEDED");
});

test("a source-shaped canonical note passes exactly18000 bytes and rejects18001 independently of index size", () => {
  // Use the actual note layout, legal field lengths and sixteen legal paths.
  // The per-component lengths stay below common filesystem limits; neither an
  // artificial extra key nor an impossible nested shape drives the size check.
  const sources = Array.from({ length: 16 }, (_, index) => {
    const prefix = `src/${String(index).padStart(2, "0")}/${"p".repeat(190)}/`;
    const suffix = "/evidence.txt";
    return { path: prefix + "q".repeat(400 - prefix.length - suffix.length) + suffix, sha256: "a".repeat(64) };
  });
  validateSourcePaths(sources.map((source) => source.path));
  const note = { ...base(), repo_id: "a".repeat(64), run_id: "n".repeat(80),
    recorded_at: "2026-11-03T05:33:00.000Z", expires_at: "2026-12-03T05:33:00.000Z",
    head: "a".repeat(40), sources, source_fingerprint: hash(canonical(sources)),
    trust: "untrusted-context", id: "experience-" + "a".repeat(32) };
  let remaining = 18000 - Buffer.byteLength(canonical(note));
  for (const [field, maximum] of Object.entries(limits)) {
    const capacity = maximum - note[field].length;
    const chinese = Math.min(Math.floor(remaining / 3), capacity);
    note[field] += "界".repeat(chinese);
    remaining -= chinese * 3;
    const ascii = Math.min(remaining, capacity - chinese);
    note[field] += "x".repeat(ascii);
    remaining -= ascii;
  }
  assert.equal(remaining, 0);
  const { id: ignoredId, ...identified } = note;
  note.id = `experience-${hash(canonical(identified)).slice(0, 32)}`;
  assert.equal(Buffer.byteLength(canonical(note)), 18000);
  assert.ok(Buffer.byteLength(`${JSON.stringify(note, null, 2)}\n`) < 20000);
  assert.ok(Buffer.byteLength(indexText(memoryFields(note))) < 32768);
  assert.doesNotThrow(() => assertNoteSize(note));
  const room = Object.keys(limits).find((field) => note[field].length < limits[field]);
  assert.ok(room, "The extra byte must still respect the prose field limit");
  const tooLarge = { ...note, [room]: note[room] + "x" };
  assert.doesNotThrow(() => memoryFields(tooLarge));
  assert.equal(Buffer.byteLength(canonical(tooLarge)), 18001);
  invalid(() => assertNoteSize(tooLarge), "MEMORY_LIMIT_EXCEEDED");
});

test("query bounds include UTF-16 units and preserve all accepted text for the tokenizer", () => {
  assert.equal(queryText("A".repeat(400)), "a".repeat(400));
  assert.equal(queryText("😀".repeat(200)), "😀".repeat(200));
  invalid(() => queryText("a".repeat(401)));
  invalid(() => queryText("😀".repeat(200) + "a"));
  for (const value of [null, undefined, 1, {}, [], "", " \r\n\t ", "a\0b", "a\u0001b", "a\u007fb", "a\u200bb", "a\u202eb", "a\u2066b"]) {
    invalid(() => queryText(value));
  }
  const expanded = queryText("\ufdfa".repeat(400));
  assert.equal(Buffer.byteLength(expanded), 13200);
  assert.ok(Buffer.byteLength(expanded) <= INDEX_TEXT_BYTES);
  for (const value of ["İstanbul", "हिंदी", "ＡＢＣ", "ﬃ", "cafe\u0301", "가", "Å", "Σίσυφος", "㍿"]) {
    const note = memoryFields(base({ title: value }));
    const original = structuredClone(note);
    const query = queryText(value);
    assert.ok(indexText(note).includes(query), value);
    assert.equal(query, value.normalize("NFKC").toLowerCase(), value);
    assert.deepEqual(note, original, "Index preparation must not mutate canonical fields");
  }
});

test("sampled Unicode scalar ranges round-trip canonically and use one index/query representation", () => {
  const prohibited = new Set([0x200b, 0x200c, 0x200d, 0x200e, 0x200f,
    0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x2066, 0x2067, 0x2068, 0x2069]);
  const points = new Set([0x00ad, 0x0130, 0x0301, 0x034f, 0x093f, 0x200a,
    0x2028, 0x2029, 0x337f, 0xfdfa, 0xfeff, 0x11f04, 0x17000, 0x1e290, 0x1f600]);
  for (let plane = 0; plane <= 16; plane += 1) {
    if (plane) points.add(plane << 16);
    points.add((plane << 16) + 0xffff);
  }
  for (let code = 0xa0; code <= 0x10ffff; code += 257) points.add(code);
  let checked = 0;
  for (const code of points) {
    if (code >= 0xd800 && code <= 0xdfff || prohibited.has(code)) continue;
    const character = String.fromCodePoint(code);
    const title = `v${character}x`;
    const note = memoryFields(base({ title, tags: [`tag${character}`] }));
    assert.equal(note.title, title, `U+${code.toString(16)}`);
    assert.deepEqual(memoryFields(JSON.parse(JSON.stringify(note))), note, `U+${code.toString(16)}`);
    assert.ok(indexText(note).includes(queryText(title)), `U+${code.toString(16)}`);
    checked += 1;
  }
  assert.ok(checked > 4300, checked);
});

test("secret screening remains active in all prose fields and tags", () => {
  const secrets = ["ghp_" + "a".repeat(25), "api_key=not-a-real-credential", "-----BEGIN PRIVATE KEY-----"];
  for (const value of secrets) {
    for (const field of Object.keys(limits)) invalid(() => memoryFields(base({ [field]: value })), "MEMORY_SECRET_REJECTED");
    invalid(() => memoryFields(base({ tags: [value] })), "MEMORY_SECRET_REJECTED");
  }
});

test("public record API rejects sparse tags before replacing an existing note or creating a store", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-memory-contract-api-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "src/source.txt"), "stable evidence\n");
  const git = (...args) => execFileSync("git", ["-C", project, ...args], { encoding: "utf8", windowsHide: true });
  git("init", "-b", "main");
  fs.appendFileSync(path.join(project, ".git/config"), "\n[user]\n name = Contract API\n email = api@example.test\n[core]\n autocrlf = false\n[maintenance]\n auto = false\n[gc]\n auto = 0\n");
  git("add", "src");
  git("commit", "-m", "isolated API contract evidence");
  const run = "contract-api-source";
  const directory = path.join(project, ".hehehe/runs", run);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify({ schema_version: 1, run_id: run, status: "active" }));
  fs.writeFileSync(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${run}/state.json` }));
  const input = base({ tags: ["proof"], source_paths: ["src/source.txt"] });
  assert.equal(recordExperience(project, input).status, "recorded");
  const notePath = path.join(directory, "experience.json");
  const original = fs.readFileSync(notePath);
  for (const tags of [Array(1), ["valid", , "other"], [undefined]]) {
    invalid(() => recordExperience(project, { ...input, tags }));
    assert.deepEqual(fs.readFileSync(notePath), original);
  }
  assert.equal(fs.existsSync(path.join(project, ".git/hehehe-memory/experience.sqlite")), false);
});
