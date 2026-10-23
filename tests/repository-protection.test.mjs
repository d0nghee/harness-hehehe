import assert from "node:assert/strict";
import test from "node:test";
import { protectionPlan, protectionFindings } from "../scripts/repository-protection.mjs";

const workflows = ["quality.yml", "verification.yml"].map((name) => ({ path: `.github/workflows/${name}`, state: "active" }));
const protectedBranch = { required_status_checks: protectionPlan.required_status_checks, enforce_admins: { enabled: true }, allow_force_pushes: { enabled: false }, allow_deletions: { enabled: false } };

test("solo-owner protection requires CI including admins without impossible self-review", () => {
  assert.equal(protectionPlan.required_pull_request_reviews, null);
  assert.deepEqual(protectionFindings(protectedBranch, workflows), []);
  assert.ok(protectionFindings(null, workflows).length > 0);
});

test("protection audit rejects unbound checks, admin bypass and inactive CI", () => {
  for (const required_status_checks of [{ strict: false, checks: protectedBranch.required_status_checks.checks }, { strict: true, checks: [{ context: "completion-gate", app_id: 999 }] }, { strict: true, checks: [] }]) {
    assert.ok(protectionFindings({ ...protectedBranch, required_status_checks }, workflows).some((issue) => /completion-gate/.test(issue)));
  }
  assert.ok(protectionFindings({ ...protectedBranch, enforce_admins: { enabled: false } }, workflows).some((issue) => /administrators/.test(issue)));
  const inactive = workflows.map((entry) => ({ ...entry, state: "disabled_inactivity" }));
  assert.equal(protectionFindings(protectedBranch, inactive).filter((issue) => /Enable/.test(issue)).length, 2);
});
