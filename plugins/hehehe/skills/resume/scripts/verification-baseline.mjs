#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { digest, git, policyPath, trustedContext, validatePolicy } from "./verification-policy.mjs";
import { loadDelivery, safeDirectory, withDeliveryLock } from "./delivery-store.mjs";
import { assertVerified } from "./verification-runner.mjs";

// Promotion never implicitly selects HEAD or changes an existing run's pinned policy.
export function baselinePlan(project, candidate) {
  const from = process.env.HEHEHE_VERIFICATION_BASE;
  if (!/^[a-f0-9]{40}$/.test(from ?? "") || !/^[a-f0-9]{40}$/.test(candidate ?? "")) {
    throw new Error("baseline review requires externally pinned FROM and explicit full candidate SHA");
  }
  git(project, ["merge-base", "--is-ancestor", from, candidate]);
  if (from === candidate) throw new Error("baseline promotion requires a different reviewed candidate");
  const previous = validatePolicy(JSON.parse(git(project, ["show", `${from}:${policyPath}`])));
  const proposed = validatePolicy(JSON.parse(git(project, ["show", `${candidate}:${policyPath}`])));
  const { repo, state } = loadDelivery(project);
  if (!state || state.candidate !== candidate || state.verification_mode !== "trusted" || state.verification_base !== from) {
    throw new Error("baseline candidate must match a registered trusted delivery request");
  }
  const changed = git(project, ["diff", "--no-renames", "--name-only", from, candidate]).split(/\r?\n/).filter(Boolean);
  const plan = { schema_version: 1, repository: repo.common, from, to: candidate,
    target: state.target, delivery_request_id: state.request_id,
    previous_policy: previous, proposed_policy: proposed, changed_paths: changed };
  return { ...plan, request_id: `baseline-${digest(JSON.stringify(plan)).slice(0, 24)}` };
}

export function promoteBaseline(project, candidate) {
  return withDeliveryLock(project, (repo) => {
    const plan = baselinePlan(project, candidate);
    if (process.env.HEHEHE_BASELINE_APPROVED_FROM !== plan.from
      || process.env.HEHEHE_BASELINE_APPROVED_TO !== plan.to
      || process.env.HEHEHE_BASELINE_APPROVAL_ID !== plan.request_id) {
      throw new Error("separate external baseline approval must match FROM, TO and baseline request ID");
    }
    const { state } = loadDelivery(project);
    if (state.status !== "merged" || state.main_head !== candidate
      || git(project, ["rev-parse", `refs/heads/${state.target}`]).trim() !== candidate) {
      throw new Error("baseline promotion requires the exact verified candidate already delivered to the target");
    }
    const context = trustedContext(state.review_path, plan.from);
    assertVerified(state.review_path, state.request_id, context, path.join(repo.store, "evidence", state.request_id));
    const directory = path.join(repo.common, "hehehe-verification");
    fs.mkdirSync(directory, { recursive: true });
    safeDirectory(directory);
    const record = { ...plan, promoted_at: new Date().toISOString(),
      launcher_environment: { HEHEHE_VERIFICATION_BASE: candidate },
      next_action: "Operator must update the trusted launcher's pinned baseline and instructions for NEW runs; never repin an active run." };
    const temporary = path.join(directory, `baseline.${process.pid}.tmp`);
    fs.writeFileSync(temporary, JSON.stringify(record, null, 2) + "\n", { flag: "wx" });
    fs.renameSync(temporary, path.join(directory, "baseline.json"));
    return record;
  });
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const [command, ...args] = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i += 1) {
      if (args[i] === "--json") continue;
      if (!["--project", "--candidate"].includes(args[i]) || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error("invalid baseline option");
      options[args[i].slice(2)] = args[++i];
    }
    if (!options.project || !["plan", "promote"].includes(command)) throw new Error("Usage: verification-baseline.mjs <plan|promote> --project <root> --candidate <full SHA> --json");
    const result = command === "plan" ? baselinePlan(options.project, options.candidate) : promoteBaseline(options.project, options.candidate);
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } catch (error) {
    process.stderr.write(`verification-baseline: ${error.message}\n`);
    process.exitCode = 2;
  }
}
