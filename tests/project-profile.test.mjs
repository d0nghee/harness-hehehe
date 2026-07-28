import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  parseProfileArguments,
  scoreProject,
} from "../plugins/hehehe/skills/architecture-metrics/scripts/project-profile.mjs";

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "hehehe-profile-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function policy(declaredScores, profile = {}) {
  return {
    schema_version: 1,
    profile: {
      mode: "auto",
      fixed: null,
      minimum: "lite",
      maximum: "strict",
      allow_automatic_downgrade: false,
      ...profile,
    },
    declared_scores: declaredScores,
  };
}

test("minimal project selects Lite", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(path.join(projectDir, "package.json"), { name: "small-app" });

  const { report } = await scoreProject({ projectDir });

  assert.equal(report.score, 0);
  assert.equal(report.selected_profile, "lite");
  assert.equal(report.coupling_thresholds.pass_max, 4);
});

test("declared score 4 selects Standard", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(
    path.join(projectDir, ".hehehe", "architecture-policy.json"),
    policy({
      security_data_risk: 1,
      domain_complexity: 1,
      integration_complexity: 1,
      operational_risk: 1,
      collaboration_pressure: 0,
    }),
  );

  const { report } = await scoreProject({ projectDir });

  assert.equal(report.score, 4);
  assert.equal(report.selected_profile, "standard");
  assert.equal(report.coupling_thresholds.fail_min, 6);
});

test("declared score 7 selects Strict", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(
    path.join(projectDir, ".hehehe", "architecture-policy.json"),
    policy({
      security_data_risk: 2,
      domain_complexity: 2,
      integration_complexity: 1,
      operational_risk: 1,
      collaboration_pressure: 1,
    }),
  );

  const { report } = await scoreProject({ projectDir });

  assert.equal(report.score, 7);
  assert.equal(report.selected_profile, "strict");
  assert.equal(report.coupling_thresholds.pass_max, 2);
});

test("fixed profile overrides the calculated profile", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(
    path.join(projectDir, ".hehehe", "architecture-policy.json"),
    policy({}, { mode: "fixed", fixed: "strict" }),
  );

  const { report } = await scoreProject({ projectDir });

  assert.equal(report.score, 0);
  assert.equal(report.calculated_profile, "lite");
  assert.equal(report.selected_profile, "strict");
  assert.match(report.selection_reason, /fixed/);
});

test("invalid declared score is rejected", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(
    path.join(projectDir, ".hehehe", "architecture-policy.json"),
    policy({ domain_complexity: 3 }),
  );

  await assert.rejects(
    scoreProject({ projectDir }),
    /declared_scores\.domain_complexity must be an integer from 0 to 2/,
  );
});

test("invalid policy types are rejected instead of silently coerced", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(
    path.join(projectDir, ".hehehe", "architecture-policy.json"),
    policy({}, { allow_automatic_downgrade: "yes" }),
  );

  await assert.rejects(
    scoreProject({ projectDir }),
    /profile\.allow_automatic_downgrade must be boolean/,
  );
});

test("automatic downgrade is retained until explicitly allowed", async (t) => {
  const projectDir = await fixture(t);
  const policyPath = path.join(projectDir, ".hehehe", "architecture-policy.json");
  await writeJson(
    policyPath,
    policy({
      security_data_risk: 2,
      domain_complexity: 2,
      integration_complexity: 2,
      operational_risk: 1,
      collaboration_pressure: 0,
    }),
  );
  await scoreProject({ projectDir, write: true });

  await writeJson(policyPath, policy({}));
  const retained = await scoreProject({ projectDir });
  const downgraded = await scoreProject({ projectDir, allowDowngrade: true });

  assert.equal(retained.report.selected_profile, "strict");
  assert.match(retained.report.selection_reason, /automatic downgrade is disabled/);
  assert.equal(downgraded.report.selected_profile, "lite");
});

test("FSD feature directories contribute domain evidence", async (t) => {
  const projectDir = await fixture(t);
  for (const feature of ["account", "catalog", "checkout"]) {
    await mkdir(path.join(projectDir, "src", "features", feature), { recursive: true });
  }

  const { report } = await scoreProject({ projectDir });

  assert.equal(report.dimensions.domain_complexity.score, 1);
  assert.match(report.dimensions.domain_complexity.evidence[0], /3 domain directories/);
});

test("repository evidence alone can select Strict", async (t) => {
  const projectDir = await fixture(t);
  await writeJson(path.join(projectDir, "package.json"), {
    name: "payments-platform",
    dependencies: {
      "@aws-sdk/client-s3": "1.0.0",
      openai: "1.0.0",
      stripe: "1.0.0",
      twilio: "1.0.0",
    },
  });
  for (const domain of [
    "accounts",
    "billing",
    "checkout",
    "invoices",
    "ledger",
    "payments",
    "refunds",
  ]) {
    await mkdir(path.join(projectDir, "src", "modules", domain), { recursive: true });
  }
  for (const service of ["api", "worker", "scheduler"]) {
    await mkdir(path.join(projectDir, "services", service), { recursive: true });
  }
  await mkdir(path.join(projectDir, "migrations"), { recursive: true });
  await writeFile(path.join(projectDir, "Dockerfile"), "FROM scratch\n", "utf8");

  const { report } = await scoreProject({ projectDir });

  assert.equal(report.score, 8);
  assert.equal(report.selected_profile, "strict");
  assert.equal(report.dimensions.security_data_risk.source, "detected");
  assert.equal(report.dimensions.domain_complexity.score, 2);
  assert.equal(report.dimensions.integration_complexity.score, 2);
  assert.equal(report.dimensions.operational_risk.score, 2);
});

test("profile CLI parser accepts one positional project and options", () => {
  const parsed = parseProfileArguments(["C:\\work\\app", "--write", "--json"]);
  assert.equal(parsed.projectDir, "C:\\work\\app");
  assert.equal(parsed.write, true);
  assert.equal(parsed.json, true);
  assert.throws(
    () => parseProfileArguments(["first", "second"]),
    /unknown profile argument: second/,
  );
  assert.throws(
    () => parseProfileArguments(["--project="]),
    /--project requires a value/,
  );
});

test("written profile report is valid JSON", async (t) => {
  const projectDir = await fixture(t);

  const result = await scoreProject({ projectDir, write: true });
  const written = JSON.parse(await readFile(result.reportPath, "utf8"));

  assert.equal(written.selected_profile, "lite");
  assert.equal(written.structural_hard_failures_profile_independent, true);
});
