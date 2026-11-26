import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import * as contract from "../plugins/hehehe/skills/experience-memory/scripts/text-contract.mjs";
import { recordExperience, syncExperiences, memoryContext } from "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs";
import { canonical, hash } from "../plugins/hehehe/skills/experience-memory/scripts/source-evidence.mjs";

const cli = path.resolve(import.meta.dirname, "../plugins/hehehe/skills/experience-memory/scripts/memory.mjs");
const NativeDate = Date;
const NOW = NativeDate.parse("2026-11-03T12:34:56.789Z");
const MAX_AGE = 90 * 86400000;
const input = (extra = {}) => ({ schema_version: 1, title: "expirycontract source-backed lesson",
  problem: "Keep the explicitly requested expiry rather than rolling its calendar forward.",
  cause: "Date parsing alone may accept impossible dates.",
  resolution: "Validate actual UTC calendar fields and preserve the original note on rejection.",
  outcome: "Healthy retained memories remain available within the established retention limit.",
  tags: ["expirycontract"], source_paths: ["src/proof.txt"], ...extra });
const iso = (time) => new NativeDate(time).toISOString();
const invalid = (action) => assert.throws(action, { code: "MEMORY_INVALID_INPUT" });

function withClock(time, action) {
  const PreviousDate = globalThis.Date;
  globalThis.Date = class extends NativeDate {
    constructor(...args) { super(...(args.length ? args : [time])); }
    static now() { return time; }
  };
  try { return action(); } finally { globalThis.Date = PreviousDate; }
}

function current(project, id, status = "active") {
  const directory = path.join(project, ".hehehe/runs", id);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, "state.json"), JSON.stringify({ schema_version: 1, run_id: id, status }));
  fs.writeFileSync(path.join(project, ".hehehe/current.json"), JSON.stringify({ schema_version: 1, active_run: `runs/${id}/state.json` }));
  return path.join(directory, "experience.json");
}

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-expiry-contract-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const project = path.join(root, "repo");
  fs.mkdirSync(path.join(project, "src"), { recursive: true });
  fs.writeFileSync(path.join(project, "src/proof.txt"), "stable expiry proof\n");
  const git = (...args) => execFileSync("git", ["-C", project, ...args], { encoding: "utf8", windowsHide: true });
  git("init", "-b", "main");
  fs.appendFileSync(path.join(project, ".git/config"), "\n[user]\n name = Expiry Contract\n email = expiry@example.test\n[core]\n autocrlf = false\n[maintenance]\n auto = false\n[gc]\n auto = 0\n");
  git("add", "src"); git("commit", "-m", "isolated expiry contract source");
  const notePath = current(project, "expiry-source");
  const clock = path.join(root, "clock.mjs");
  // This preload is scoped to the private memory CLI fixture, never a trusted
  // verifier or delivery process. Calendar/TTL boundaries remain deterministic.
  fs.writeFileSync(clock, `const NativeDate=Date;const time=${NOW};globalThis.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[time]));}static now(){return time;}};\n`);
  return { root, project, notePath, clock, database: path.join(project, ".git/hehehe-memory/experience.sqlite") };
}

function command(f, ...args) {
  const result = spawnSync(process.execPath, ["--import", pathToFileURL(f.clock).href, cli, ...args, "--project", f.project, "--json"],
    { encoding: "utf8", windowsHide: true, timeout: 15000 });
  assert.equal(result.error, undefined);
  return { code: result.status, stdout: result.stdout, stderr: result.stderr,
    value: JSON.parse(result.status === 0 ? result.stdout : result.stderr || result.stdout) };
}

test("UTC dates preserve real calendar boundaries across a full Gregorian leap-year cycle", () => {
  assert.equal(contract.MAX_RETENTION_MS, MAX_AGE);
  assert.equal(typeof contract.utcDate, "function");
  const leap = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = (year, month) => [31, leap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  for (let year = 1900; year < 2300; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const prefix = `${year}-${String(month).padStart(2, "0")}-`;
      const last = days(year, month);
      const valid = `${prefix}${last}T23:59:59.999Z`;
      assert.equal(contract.utcDate(valid), valid);
      invalid(() => contract.utcDate(`${prefix}${last + 1}T00:00:00Z`));
    }
  }
  assert.equal(contract.utcDate("0000-02-29T00:00:00Z"), "0000-02-29T00:00:00.000Z");
  assert.equal(contract.utcDate("2000-02-29T12:00:00Z"), "2000-02-29T12:00:00.000Z");
  assert.equal(contract.utcDate("2024-02-29T12:00:00.001Z"), "2024-02-29T12:00:00.001Z");
});

test("UTC date type, syntax and clock fields reject rollover and unsupported spellings", () => {
  for (const value of [null, undefined, 0, true, {}, [], new NativeDate(NOW), "", "2026-11-31T00:00:00Z",
    "2025-02-29T00:00:00Z", "1900-02-29T00:00:00Z", "2100-02-29T00:00:00Z", "2026-02-30T00:00:00Z",
    "2026-00-01T00:00:00Z", "2026-13-01T00:00:00Z", "2026-11-00T00:00:00Z", "2026-11-01T24:00:00Z",
    "2026-11-01T23:60:00Z", "2026-11-01T23:59:60Z", "2026-11-01T00:00:00.1Z", "2026-11-01T00:00:00.0000Z",
    "2026-11-01T00:00:00+00:00", "2026-11-01t00:00:00Z", "2026-11-01T00:00:00z", "2026-11-01",
    " 2026-11-01T00:00:00Z", "2026-11-01T00:00:00Z\n", "2026-11-01T00:00:00Z\0"]) {
    invalid(() => contract.utcDate(value));
  }
  for (const value of ["2026-11-01T00:00:00.000Z", "2026-11-01T23:59:59.999Z"]) assert.equal(contract.utcDate(value), value);
});

test("record expiry defaults and exact future/90-day edges preserve the existing note on rejection", (t) => {
  const f = fixture(t);
  withClock(NOW, () => {
    const initial = recordExperience(f.project, input());
    assert.equal(initial.record.recorded_at, iso(NOW));
    assert.equal(initial.record.expires_at, iso(NOW + MAX_AGE));
    for (const expires_at of [iso(NOW + 1), iso(NOW + MAX_AGE), "2026-11-30T00:00:00Z"]) {
      const result = recordExperience(f.project, input({ expires_at }));
      assert.equal(result.record.expires_at, new NativeDate(expires_at).toISOString());
    }
    const original = fs.readFileSync(f.notePath);
    for (const expires_at of [null, false, 0, {}, [], "", iso(NOW), iso(NOW - 1), iso(NOW + MAX_AGE + 1),
      "2026-11-31T00:00:00Z", "2026-11-04T24:00:00Z"]) {
      invalid(() => recordExperience(f.project, input({ expires_at })));
      assert.deepEqual(fs.readFileSync(f.notePath), original);
    }
    assert.equal(fs.existsSync(f.database), false);
  });
});

test("public CLI rejects an impossible calendar expiry without replacing a valid note", (t) => {
  const f = fixture(t);
  const file = path.join(f.root, "input.json");
  fs.writeFileSync(file, JSON.stringify(input({ expires_at: "2026-11-30T00:00:00Z" })));
  const valid = command(f, "record", "--input", file);
  assert.equal(valid.code, 0, valid.stderr);
  assert.equal(valid.value.record.expires_at, "2026-11-30T00:00:00.000Z");
  const original = fs.readFileSync(f.notePath);
  fs.writeFileSync(file, JSON.stringify(input({ expires_at: "2026-11-31T00:00:00Z" })));
  const rejected = command(f, "record", "--input", file);
  assert.equal(rejected.code, 1);
  assert.equal(rejected.stdout, "");
  assert.equal(rejected.value.code, "MEMORY_INVALID_INPUT");
  assert.equal(rejected.value.authority, "advisory-only");
  assert.deepEqual(fs.readFileSync(f.notePath), original);
  assert.equal(fs.existsSync(f.database), false);
});

test("retained calendar, expiry and future-clock boundaries exclude only ineligible notes", (t) => {
  const f = fixture(t);
  withClock(NOW, () => {
    const healthy = recordExperience(f.project, input()).record;
    current(f.project, "expiry-source", "complete");
    const original = fs.readFileSync(f.notePath);
    function retained(runId, changes) {
      const destination = current(f.project, runId, "complete");
      const note = { ...healthy, run_id: runId, ...changes };
      delete note.id;
      note.id = `experience-${hash(canonical(note)).slice(0, 32)}`;
      fs.writeFileSync(destination, JSON.stringify(note));
      return note;
    }
    retained("invalid-expiry-calendar", { expires_at: "2026-11-31T00:00:00Z" });
    retained("invalid-recorded-calendar", { recorded_at: "2026-09-31T12:34:56.789Z", expires_at: "2026-11-04T12:34:56.789Z" });
    const skew = retained("allowed-clock-skew", { recorded_at: iso(NOW + 60000), expires_at: iso(NOW + 86400000) });
    retained("excess-clock-skew", { recorded_at: iso(NOW + 60001), expires_at: iso(NOW + 86400000) });
    retained("expired-at-now", { recorded_at: iso(NOW - 1000), expires_at: iso(NOW) });
    retained("expired-before-now", { recorded_at: iso(NOW - 1000), expires_at: iso(NOW - 1) });
    const future = retained("expires-after-now", { recorded_at: iso(NOW - 1000), expires_at: iso(NOW + 1) });
    retained("excess-retention", { expires_at: iso(NOW + MAX_AGE + 1) });
    const synced = syncExperiences(f.project);
    assert.equal(synced.indexed, 3);
    assert.equal(synced.skipped, 6);
    const context = memoryContext(f.project, "expirycontract");
    assert.equal(context.status, "ok");
    assert.equal(context.authority, "advisory-only");
    assert.equal(context.count, 3);
    assert.deepEqual(new Set(context.records.map(note => note.id)), new Set([healthy.id, skew.id, future.id]));
    assert.deepEqual(fs.readFileSync(f.notePath), original);
  });
});
