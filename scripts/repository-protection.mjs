#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

export const protectionPlan = {
  required_status_checks: { strict: true, checks: [{ context: "completion-gate", app_id: 15368 }] },
  enforce_admins: true,
  // A solo owner cannot independently approve a PR authored through the same account.
  required_pull_request_reviews: null,
  restrictions: null,
  required_conversation_resolution: true,
  allow_force_pushes: false,
  allow_deletions: false,
};

export function protectionFindings(protection, workflows) {
  const issues = [];
  const checks = protection?.required_status_checks;
  if (!checks?.strict || !checks.checks?.some((check) => check.context === "completion-gate" && check.app_id === 15368)) {
    issues.push("Require the GitHub Actions completion-gate check and strict up-to-date verification.");
  }
  if (!protection?.enforce_admins?.enabled) issues.push("Enforce required checks for administrators.");
  if (protection?.allow_force_pushes?.enabled !== false || protection?.allow_deletions?.enabled !== false) {
    issues.push("Disable force pushes and branch deletion.");
  }
  for (const workflow of ["quality.yml", "verification.yml"]) {
    if (!workflows.some((entry) => entry.path === `.github/workflows/${workflow}` && entry.state === "active")) {
      issues.push(`Enable ${workflow}.`);
    }
  }
  return issues;
}

export function checkProtection(repository, branch = "main") {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error("--repo requires owner/name");
  const api = (endpoint) => JSON.parse(execFileSync("gh", ["api", endpoint], { encoding: "utf8", windowsHide: true }));
  const protection = api(`repos/${repository}/branches/${encodeURIComponent(branch)}/protection`);
  const workflows = api(`repos/${repository}/actions/workflows`).workflows;
  const issues = protectionFindings(protection, workflows);
  return { status: issues.length ? "BLOCKED" : "PASS", repository, branch, issues,
    authority_note: "Required CI blocks unchecked updates. A single unrestricted administrator identity is not an independent human/AI approval boundary." };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const [command, ...args] = process.argv.slice(2);
    let result;
    if (command === "plan" && !args.length) result = protectionPlan;
    else if (command === "check" && args[0] === "--repo" && args.length === 2) result = checkProtection(args[1]);
    else throw new Error("Usage: repository-protection.mjs plan | check --repo owner/name");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    if (result.status === "BLOCKED") process.exitCode = 1;
  } catch (error) { process.stderr.write(`repository-protection: ${error.message}\n`); process.exitCode = 2; }
}
