#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { trustedContext } from "./verification-policy.mjs";
import { assertVerified, runChecks } from "./verification-runner.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const pluginRoot = path.resolve(scriptDirectory, "..", "..", "..");
const skillRoot = path.resolve(scriptDirectory, "..");
const allowedStatuses = new Set(["active", "blocked", "complete"]);
const allowedPhases = new Set(["intake", "plan", "architecture", "build", "verify", "review", "cleanup", "docs", "preflight", "blocked"]);

function parseArguments(argv) {
  const command = argv[0];
  const options = { project: process.cwd(), json: false };
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--json") {
      options.json = true;
      continue;
    }
    if (!argument.startsWith("--")) {
      throw new Error(`unexpected argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (!value) {
      throw new Error(`${argument} requires a value`);
    }
    options[argument.slice(2).replaceAll("-", "_")] = value;
    index += 1;
  }
  options.project = path.resolve(options.project);
  const permitted = command === "init" ? ["project", "json", "goal", "run_id"]
    : command === "advance" ? ["project", "json", "phase", "next", "status"] : ["project", "json"];
  if (Object.keys(options).some((key) => !permitted.includes(key))) throw new Error("unsupported command option; verification cannot be bypassed");
  return { command, options };
}

function now() {
  return new Date().toISOString();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(temporaryPath, filePath);
}

function toPortable(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function statePaths(project) {
  const root = path.join(project, ".hehehe");
  return { root, runs: path.join(root, "runs"), current: path.join(root, "current.json") };
}

function assertProjectSafe(project) {
  if (!fs.existsSync(project) || !fs.statSync(project).isDirectory()) {
    throw new Error(`project directory does not exist: ${project}`);
  }
  const stateRoot = path.join(project, ".hehehe");
  if (fs.existsSync(stateRoot)) {
    const realProject = fs.realpathSync(project);
    const realStateRoot = fs.realpathSync(stateRoot);
    if (!isInside(realProject, realStateRoot)) {
      throw new Error(".hehehe must resolve inside the project root");
    }
  }
}

function loadCurrent(project, allowMissing = false) {
  const paths = statePaths(project);
  if (!fs.existsSync(paths.current)) {
    if (allowMissing) {
      return null;
    }
    throw new Error("no active hehehe run; initialize one with the init command");
  }

  const current = readJson(paths.current);
  if (current.schema_version !== 1 || typeof current.active_run !== "string") {
    throw new Error("current.json must contain schema_version=1 and active_run");
  }
  const statePath = path.resolve(paths.root, current.active_run);
  if (!isInside(paths.runs, statePath) || path.basename(statePath) !== "state.json") {
    throw new Error("active_run must point to .hehehe/runs/<run-id>/state.json");
  }
  if (!fs.existsSync(statePath)) {
    throw new Error(`active run state does not exist: ${statePath}`);
  }
  if (!isInside(fs.realpathSync(project), fs.realpathSync(statePath))) {
    throw new Error("run state must resolve inside the project");
  }
  const state = readJson(statePath);
  if (state.schema_version !== 1 || typeof state.run_id !== "string" || !allowedStatuses.has(state.status)) {
    throw new Error("state.json has an unsupported schema or status");
  }
  if (path.basename(path.dirname(statePath)) !== state.run_id) {
    throw new Error("state run_id does not match its directory");
  }
  return { paths, current, statePath, state };
}

function slugify(value) {
  const slug = value.toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || "run";
}

function generatedRunId(goal) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").slice(0, 15);
  return `${stamp}-${slugify(goal)}`;
}

function validateRunId(runId) {
  if (!/^[a-z0-9][a-z0-9-]{2,79}$/.test(runId)) {
    throw new Error("run-id must be 3-80 lowercase letters, digits, or hyphens");
  }
}

function uniqueRunId(runsRoot, requested) {
  if (!fs.existsSync(path.join(runsRoot, requested))) {
    return requested;
  }
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${requested}-${suffix}`;
    if (!fs.existsSync(path.join(runsRoot, candidate))) {
      return candidate;
    }
  }
  throw new Error("could not allocate a unique run-id");
}

function writeInitialArtifacts(runDirectory, goal) {
  const templatePath = [
    path.join(skillRoot, "templates", "done-criteria.md"),
    path.join(pluginRoot, "templates", "done-criteria.md"),
  ].find((candidate) => fs.existsSync(candidate));
  if (!templatePath) {
    throw new Error(
      "done-criteria template is missing; reinstall with npx harness-hehehe@latest install --project .",
    );
  }
  const doneCriteria = fs.readFileSync(templatePath, "utf8");
  const files = {
    "done-criteria.md": doneCriteria.replace(/## Goal\r?\n/, `## Goal\n\n${goal}\n`),
    "build-log.md": "# Build Log\n\n",
    "checks.md": "# Checks\n\n",
    "final-report.md": "# Final Report\n\n",
  };
  for (const [name, content] of Object.entries(files)) {
    const filePath = path.join(runDirectory, name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, content, "utf8");
    }
  }
}

function init(project, options) {
  const goal = options.goal?.trim();
  if (!goal) {
    throw new Error("init requires --goal");
  }
  const existing = loadCurrent(project, true);
  if (existing && existing.state.status !== "complete") {
    throw new Error(`run ${existing.state.run_id} is ${existing.state.status}; resume or complete it before starting another run`);
  }

  const paths = statePaths(project);
  fs.mkdirSync(paths.runs, { recursive: true });
  const requestedRunId = options.run_id ?? generatedRunId(goal);
  validateRunId(requestedRunId);
  const runId = uniqueRunId(paths.runs, requestedRunId);
  const runDirectory = path.join(paths.runs, runId);
  fs.mkdirSync(runDirectory);
  writeInitialArtifacts(runDirectory, goal);

  const timestamp = now();
  const state = {
    schema_version: 1,
    run_id: runId,
    goal,
    verification_base: process.env.HEHEHE_VERIFICATION_BASE ?? null,
    status: "active",
    phase: "intake",
    next_step: "Confirm scope and done criteria.",
    created_at: timestamp,
    updated_at: timestamp,
    artifacts: {
      done_criteria: `.hehehe/runs/${runId}/done-criteria.md`,
      build_log: `.hehehe/runs/${runId}/build-log.md`,
      checks: `.hehehe/runs/${runId}/checks.md`,
      final_report: `.hehehe/runs/${runId}/final-report.md`,
    },
  };
  const statePath = path.join(runDirectory, "state.json");
  writeJsonAtomic(statePath, state);
  writeJsonAtomic(paths.current, {
    schema_version: 1,
    active_run: toPortable(path.relative(paths.root, statePath)),
    updated_at: timestamp,
  });
  return state;
}

function advance(project, options) {
  const loaded = loadCurrent(project);
  if (loaded.state.status === "complete") {
    throw new Error("completed runs cannot be advanced");
  }
  const phase = options.phase?.trim();
  const nextStep = options.next?.trim();
  const status = options.status ?? "active";
  if (!phase || !nextStep) {
    throw new Error("advance requires --phase and --next");
  }
  if (!allowedPhases.has(phase)) throw new Error("unsupported pipeline phase");
  if ((phase === "blocked") !== (status === "blocked")) throw new Error("blocked phase and status must agree");
  if (!allowedStatuses.has(status) || status === "complete") {
    throw new Error("advance status must be active or blocked");
  }
  const timestamp = now();
  const state = { ...loaded.state, status, phase, next_step: nextStep, updated_at: timestamp };
  writeJsonAtomic(loaded.statePath, state);
  writeJsonAtomic(loaded.paths.current, { ...loaded.current, updated_at: timestamp });
  return state;
}

function complete(project) {
  const loaded = loadCurrent(project);
  if (loaded.state.status !== "active") throw new Error("only active runs can complete; resolve blocked state first");
  if (!loaded.state.verification_base) throw new Error("required verification has not run; use verify before complete");
  const context = trustedContext(project, loaded.state.verification_base);
  const receipt = assertVerified(project, loaded.state.run_id, context, path.dirname(loaded.statePath));
  const timestamp = now();
  const state = {
    ...loaded.state,
    status: "complete",
    phase: "complete",
    next_step: null,
    updated_at: timestamp,
    completed_at: timestamp,
    verification: { base: receipt.base, policy_hash: receipt.policy_hash, snapshot: receipt.snapshot,
      finished_at: receipt.finished_at },
  };
  writeJsonAtomic(loaded.statePath, state);
  writeJsonAtomic(loaded.paths.current, { ...loaded.current, updated_at: timestamp });
  return state;
}

function verify(project) {
  const loaded = loadCurrent(project);
  if (loaded.state.status !== "active") throw new Error("only active runs can be verified");
  const context = trustedContext(project, loaded.state.verification_base);
  const state = { ...loaded.state, verification_base: context.base, phase: "verify", updated_at: now() };
  writeJsonAtomic(loaded.statePath, state);
  const result = runChecks(project, state.run_id, context, path.dirname(loaded.statePath));
  if (result.status !== "pass") throw new Error(`verification failed: ${result.results.filter((item) => item.status !== "pass").map((item) => `${item.id}: ${item.reason}`).join("; ") || "source changed during verification"}`);
  return { ...state, verification_result: result };
}

function printResult(value, asJson) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
    return;
  }
  if (value.status === "none") {
    process.stdout.write("No hehehe run state found.\n");
    return;
  }
  process.stdout.write(`${value.run_id}: ${value.status} / ${value.phase}\n`);
  process.stdout.write(`Goal: ${value.goal}\n`);
  process.stdout.write(`Next: ${value.next_step ?? "none"}\n`);
}

let mutationLock;
try {
  const { command, options } = parseArguments(process.argv.slice(2));
  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write("Usage: run-state.mjs <init|status|advance|verify|complete> [--project PATH] [options] [--json]\n");
    process.exit(0);
  }

  assertProjectSafe(options.project);
  if (["init", "advance", "verify", "complete"].includes(command)) {
    const root = statePaths(options.project).root;
    fs.mkdirSync(root, { recursive: true });
    const lock = path.join(root, "run-state.lock");
    let handle;
    try { handle = fs.openSync(lock, "wx"); }
    catch (error) {
      if (error.code === "EEXIST") throw new Error("run-state is locked by another mutation; investigate interrupted runs before removing the lock");
      throw error;
    }
    fs.closeSync(handle);
    mutationLock = lock;
  }

  let result;
  if (command === "init") {
    result = init(options.project, options);
  } else if (command === "status") {
    const loaded = loadCurrent(options.project, true);
    result = loaded ? loaded.state : { status: "none" };
  } else if (command === "advance") {
    result = advance(options.project, options);
  } else if (command === "complete") {
    result = complete(options.project);
  } else if (command === "verify") {
    result = verify(options.project);
  } else {
    throw new Error(`unknown command: ${command}`);
  }
  printResult(result, options.json);
} catch (error) {
  process.stderr.write(`run-state: ${error.message}\n`);
  process.exitCode = 2;
} finally {
  if (mutationLock) fs.unlinkSync(mutationLock);
}
