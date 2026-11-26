import assert from "node:assert/strict";
import test from "node:test";
import { queryTerms, queryText, searchTokens } from "../plugins/hehehe/skills/experience-memory/scripts/text-contract.mjs";

const normalized = (value) => value.normalize("NFKC").toLowerCase();
const terms = (query) => queryTerms(queryText(query));
// The same rule recall applies: a note matches when any of its words starts with a query term.
const matches = (text, query) => {
  const words = searchTokens(normalized(text));
  return terms(query).some((term) => words.some((word) => word.startsWith(term)));
};

test("notes and queries share word boundaries across scripts and combining marks", () => {
  const corpus = [
    ["i\u0307stanbul", ["i\u0307stanbul", "istanbul", "İstanbul"]],
    ["café", ["café", "cafe", "cafe\u0301"]],
    ["हिंदी", ["हिंदी"]],
    ["מִבְחָן", ["מִבְחָן"]],
    ["مُعَالَجَة", ["مُعَالَجَة"]],
    ["การทดสอบ", ["การทดสอบ"]],
    ["κόσμος", ["κόσμος", "ΚΌΣΜΟΣ"]],
    ["한글", ["한글"]],
    ["字", ["字"]],
    ["\u{10400}\u{10401}", ["\u{10400}\u{10401}", "\u{10428}\u{10429}"]],
    ["\ue000\ue001", ["\ue000\ue001"]],
  ];
  for (const [text, queries] of corpus) {
    for (const query of queries) assert.ok(matches(text, query), `${JSON.stringify(text)} <- ${JSON.stringify(query)}`);
  }
  assert.deepEqual(terms("\"*():_"), []);
  assert.deepEqual(terms("😀"), []);
  assert.equal(matches("한글", "字"), false);
});

test("stopwords are removed after tokenization and before the first sixteen distinct terms", () => {
  const words = Array.from({ length: 17 }, (_, index) => `word${String(index).padStart(2, "0")}`);
  const selected = terms(`BUILD-with ${words[16]} ${words.toReversed().join(" ")}`);
  assert.equal(selected.length, 16);
  assert.ok(!selected.includes("word00"), "query order selects the first sixteen distinct terms");
  assert.ok(selected.includes("word16"), "a repeated term must not consume another slot");
  assert.ok(!selected.includes("build") && !selected.includes("with"));
  assert.deepEqual(terms("PLEASE build-with this"), []);
});

test("long words keep their distinguishing suffix while prefix search remains available", () => {
  const first = `${"x".repeat(160)}alpha`;
  const second = `${"x".repeat(160)}beta`;
  assert.equal(matches(first, first), true);
  assert.equal(matches(second, first), false);
  assert.equal(matches(first, "x".repeat(160)), true);
  assert.equal(matches(second, "x".repeat(160)), true);
});

test("query syntax characters are plain separators and invalid queries are rejected", () => {
  assert.deepEqual(terms("sqlite\" OR repo_id:private NOT ( -- * NEAR()"), ["sqlite", "repo", "id", "private", "near"]);
  for (const query of [null, true, 1, {}, [], "", "   ", "bad\0text", "\ud800", "x".repeat(401)]) {
    assert.throws(() => queryText(query), { code: "MEMORY_INVALID_INPUT" }, JSON.stringify(query));
  }
  for (const value of [null, 1, {}, []]) assert.throws(() => searchTokens(value), { code: "MEMORY_INVALID_INPUT" });
});
