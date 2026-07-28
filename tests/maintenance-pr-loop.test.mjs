import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  buildReport,
  parseArgs,
  parseNumstat,
  scoreHotspot,
} from "../plugins/hehehe/skills/maintain-codebase/scripts/maintenance-audit.mjs";

const sourceRoot = path.resolve(import.meta.dirname, "..");

test("maintenance audit parses bounded scan arguments", () => {
  assert.deepEqual(
    parseArgs([
      "scan",
      "--project",
      "example",
      "--since-days",
      "30",
      "--limit",
      "7",
      "--json",
    ]),
    {
      command: "scan",
      project: "example",
      sinceDays: 30,
      limit: 7,
      json: true,
    },
  );
  assert.throws(
    () => parseArgs(["scan", "--since-days", "0"]),
    /--since-days/,
  );
});

test("maintenance audit parses churn and ranks combined evidence", () => {
  const churn = parseNumstat("10\t4\tsrc/a.ts\n-\t-\tpublic/logo.png\n3\t2\tsrc/a.ts\n");
  assert.equal(churn.get("src/a.ts"), 19);
  assert.equal(churn.get("public/logo.png"), 0);

  assert.deepEqual(
    scoreHotspot({ lines: 1000, churn: 700, markers: 4, dirty: true }),
    {
      score: 9,
      reasons: [
        "very-large-file",
        "high-churn",
        "maintenance-markers",
        "currently-changing",
      ],
    },
  );
});

test("maintenance audit is read-only and ignores generated directories", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "hehehe-maintenance-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await mkdir(path.join(root, "src"), { recursive: true });
  await mkdir(path.join(root, "node_modules", "ignored"), { recursive: true });
  await writeFile(
    path.join(root, "src", "large.ts"),
    `${Array.from({ length: 1000 }, (_, index) => `export const value${index} = ${index};`).join("\n")}\n// TODO verify owner\n`,
    "utf8",
  );
  await writeFile(
    path.join(root, "node_modules", "ignored", "vendor.ts"),
    "export const ignored = true;\n",
    "utf8",
  );

  const report = await buildReport(root, { sinceDays: 30, limit: 5 });

  assert.equal(report.inventory.source_files, 1);
  assert.equal(report.inventory.maintenance_markers, 1);
  assert.equal(report.hotspots[0].path, "src/large.ts");
  assert.equal(report.hotspots[0].score, 4);
  assert.equal(report.status, "WATCH");
  assert.match(report.interpretation, /evidence only/i);
});

test("maintenance and PR loop have separate authority and integrate with delivery", async () => {
  const [
    maintain,
    maintenancePolicy,
    prLoop,
    prPolicy,
    clean,
    fullResolve,
    hehehe,
    preflight,
    catalogText,
    manifestText,
    qualityWorkflow,
  ] = await Promise.all([
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/maintain-codebase/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/maintain-codebase/references/maintenance-policy.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/pr-loop/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/pr-loop/references/pr-policy.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/clean/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/full-resolve/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/hehehe/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/preflight/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skill-catalog.json"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/.codex-plugin/plugin.json"), "utf8"),
    readFile(path.join(sourceRoot, ".github/workflows/quality.yml"), "utf8"),
  ]);
  const catalog = JSON.parse(catalogText);
  const manifest = JSON.parse(manifestText);

  assert.match(maintain, /Use this as the proactive repository maintenance lifecycle/);
  assert.match(maintain, /heuristic score alone never proves garbage/);
  assert.match(maintenancePolicy, /No maintenance policy authorizes merge/);
  assert.match(clean, /current change/);
  assert.match(clean, /maintain-codebase/);

  assert.match(prLoop, /exact pull request/);
  assert.match(prLoop, /remote head SHA equals/);
  assert.match(prLoop, /Never use admin bypass, force push/);
  assert.match(prPolicy, /Merge requires explicit current-request authority/);
  assert.match(fullResolve, /hehehe:pr-loop/);
  assert.match(fullResolve, /hehehe:maintain-codebase/);
  assert.match(hehehe, /CI failures and review feedback/);
  assert.match(preflight, /exact remote head SHA/);

  assert.equal(catalog.skills.includes("maintain-codebase"), true);
  assert.equal(catalog.skills.includes("pr-loop"), true);
  assert.equal(
    manifest.interface.defaultPrompt.some((prompt) =>
      prompt.includes("$hehehe:maintain-codebase")),
    true,
  );
  assert.equal(
    manifest.interface.defaultPrompt.some((prompt) =>
      prompt.includes("$hehehe:pr-loop")),
    true,
  );

  assert.match(qualityWorkflow, /pull_request:/);
  assert.match(qualityWorkflow, /schedule:/);
  assert.match(qualityWorkflow, /npm run validate/);
  assert.match(qualityWorkflow, /npm pack --dry-run/);
  assert.match(qualityWorkflow, /npm run maintenance:check/);
});
