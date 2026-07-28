import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  checkKnowledge,
  fingerprintSources,
  inventoryProject,
  parseArguments,
  recordKnowledge,
} from "../plugins/hehehe/skills/repository-knowledge/scripts/knowledge-system.mjs";

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "hehehe-knowledge-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function put(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");
}

async function createBaseline(projectDir) {
  await put(
    path.join(projectDir, "AGENTS.md"),
    "# Project guide\n\nSee [project knowledge](docs/README.md).\n",
  );
  await put(
    path.join(projectDir, "docs", "README.md"),
    "# Project knowledge\n\n- [Architecture overview](architecture/overview.md)\n",
  );
  await put(
    path.join(projectDir, "docs", "architecture", "overview.md"),
    "# Architecture overview\n\nThe source lives under `src`.\n",
  );
  await put(path.join(projectDir, "package.json"), "{\"name\":\"fixture\"}\n");
  await put(path.join(projectDir, "src", "index.js"), "export const value = 1;\n");
  await recordKnowledge({
    projectDir,
    document: "docs/README.md",
    kind: "index",
    sourcePaths: ["package.json"],
  });
  await recordKnowledge({
    projectDir,
    document: "docs/architecture/overview.md",
    kind: "architecture",
    sourcePaths: ["src", "package.json"],
  });
}

test("inventory reports the missing common baseline", async (t) => {
  const projectDir = await fixture(t);

  const inventory = await inventoryProject(projectDir);

  assert.equal(inventory.baseline["AGENTS.md"], false);
  assert.equal(inventory.baseline["docs/README.md"], false);
  assert.equal(inventory.baseline["docs/architecture/overview.md"], false);
  assert.equal(inventory.baseline[".hehehe/knowledge.json"], false);
});

test("check treats a missing baseline as stale", async (t) => {
  const projectDir = await fixture(t);

  const result = await checkKnowledge({ projectDir });

  assert.equal(result.status, "STALE");
  assert.equal(result.counts.errors, 4);
  assert.equal(
    result.issues.filter((issue) => issue.code === "missing_baseline").length,
    4,
  );
});

test("recorded and indexed knowledge is fresh", async (t) => {
  const projectDir = await fixture(t);
  await createBaseline(projectDir);

  const result = await checkKnowledge({ projectDir });

  assert.equal(result.status, "FRESH");
  assert.deepEqual(result.counts, { errors: 0, warnings: 0 });
  assert.equal(result.tracked_documents, 2);
});

test("broken local document links are errors", async (t) => {
  const projectDir = await fixture(t);
  await createBaseline(projectDir);
  await put(
    path.join(projectDir, "docs", "README.md"),
    "# Project knowledge\n\n- [Missing](architecture/missing.md)\n",
  );

  const result = await checkKnowledge({ projectDir });

  assert.equal(result.status, "STALE");
  assert.ok(result.issues.some((issue) => issue.code === "broken_link"));
});

test("link checks handle nested parentheses and ignore fenced examples", async (t) => {
  const projectDir = await fixture(t);
  await createBaseline(projectDir);
  await put(
    path.join(projectDir, "src", "(protected)", "page.js"),
    "export default function Page() {}\n",
  );
  await put(
    path.join(projectDir, "docs", "architecture", "overview.md"),
    [
      "# Architecture overview",
      "",
      "See [protected page](../../src/(protected)/page.js).",
      "",
      "```markdown",
      "[example only](missing-example.md)",
      "```",
      "",
    ].join("\n"),
  );
  await recordKnowledge({
    projectDir,
    document: "docs/architecture/overview.md",
    kind: "architecture",
    sourcePaths: ["src", "package.json"],
  });

  const result = await checkKnowledge({ projectDir });

  assert.equal(result.status, "FRESH");
  assert.equal(result.counts.errors, 0);
});

test("changed source fingerprints mark knowledge stale", async (t) => {
  const projectDir = await fixture(t);
  await createBaseline(projectDir);
  await put(path.join(projectDir, "src", "index.js"), "export const value = 2;\n");

  const result = await checkKnowledge({ projectDir });

  assert.equal(result.status, "STALE");
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "stale_sources"
        && issue.path === "docs/architecture/overview.md",
    ),
  );
});

test("untracked Markdown documents produce a warning", async (t) => {
  const projectDir = await fixture(t);
  await createBaseline(projectDir);
  await put(path.join(projectDir, "docs", "notes.md"), "# Notes\n");

  const result = await checkKnowledge({ projectDir });

  assert.equal(result.status, "WARN");
  assert.ok(
    result.issues.some(
      (issue) => issue.code === "untracked_document"
        && issue.path === "docs/notes.md",
    ),
  );
});

test("fingerprints are deterministic and reject outside sources", async (t) => {
  const projectDir = await fixture(t);
  await put(path.join(projectDir, "src", "b.js"), "b\n");
  await put(path.join(projectDir, "src", "a.js"), "a\n");

  const first = await fingerprintSources(projectDir, ["src"]);
  const second = await fingerprintSources(projectDir, ["src"]);

  assert.equal(first, second);
  await assert.rejects(
    fingerprintSources(projectDir, [".."]),
    /must stay inside the project/,
  );
});

test("CLI parser supports record sources and read-only modes", () => {
  const record = parseArguments([
    "record",
    "--project",
    "C:\\work\\app",
    "--doc",
    "docs/README.md",
    "--kind",
    "index",
    "--source",
    "src",
    "--source",
    "package.json",
  ]);
  assert.equal(record.command, "record");
  assert.deepEqual(record.sourcePaths, ["src", "package.json"]);

  const status = parseArguments(["status", "--max-age-days", "30"]);
  assert.equal(status.maxAgeDays, 30);
  assert.throws(
    () => parseArguments(["check", "--max-age-days", "0"]),
    /positive integer/,
  );
});
