#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const inferredPluginRoot = path.resolve(scriptDirectory, "..", "..", "..");

function parseArguments(argv) {
  const options = {
    project: process.cwd(),
    pluginRoot: inferredPluginRoot,
    json: false,
    strict: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--json") {
      options.json = true;
    } else if (argument === "--strict") {
      options.strict = true;
    } else if (argument === "--project" || argument === "--plugin-root") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error(`${argument} requires a value`);
      }
      options[argument === "--project" ? "project" : "pluginRoot"] = value;
      index += 1;
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`unknown argument: ${argument}`);
    }
  }

  options.project = path.resolve(options.project);
  options.pluginRoot = path.resolve(options.pluginRoot);
  return options;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function findExecutable(command) {
  const pathEntries = (process.env.PATH ?? "").split(path.delimiter).filter(Boolean);
  const extensions = process.platform === "win32"
    ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT;.COM").split(";")
    : [""];

  for (const directory of pathEntries) {
    for (const extension of extensions) {
      const candidates = [
        path.join(directory, `${command}${extension}`),
        path.join(directory, `${command}${extension.toLowerCase()}`),
      ];
      const found = candidates.find((candidate) => fs.existsSync(candidate));
      if (found) {
        return found;
      }
    }
  }
  return null;
}

function listDirectories(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function addCheck(checks, id, status, summary, remediation = null) {
  checks.push({ id, status, summary, ...(remediation ? { remediation } : {}) });
}

function inspectPlugin(options, checks) {
  const manifestPath = path.join(options.pluginRoot, ".codex-plugin", "plugin.json");
  if (!fs.existsSync(manifestPath)) {
    addCheck(checks, "plugin-manifest", "BLOCKED", `missing ${manifestPath}`, "Restore the global hehehe plugin source, then reinstall or upgrade it.");
    return null;
  }

  let manifest;
  try {
    manifest = readJson(manifestPath);
  } catch (error) {
    addCheck(checks, "plugin-manifest", "BLOCKED", `invalid JSON: ${error.message}`, "Fix .codex-plugin/plugin.json before upgrading the plugin cache.");
    return null;
  }

  if (manifest.name !== "hehehe" || typeof manifest.version !== "string") {
    addCheck(checks, "plugin-manifest", "BLOCKED", "manifest must declare name=hehehe and a string version", "Correct the manifest identity and version.");
    return null;
  }
  addCheck(checks, "plugin-manifest", "PASS", `hehehe ${manifest.version} manifest is valid JSON`);

  const requiredSkills = ["hehehe", "auto-resolve", "preflight", "doctor", "resume"];
  const missingSkills = requiredSkills.filter((name) => !fs.existsSync(path.join(options.pluginRoot, "skills", name, "SKILL.md")));
  if (missingSkills.length > 0) {
    addCheck(checks, "required-skills", "BLOCKED", `missing skills: ${missingSkills.join(", ")}`, "Restore the missing skill directories and upgrade the plugin cache.");
  } else {
    addCheck(checks, "required-skills", "PASS", `required skills present: ${requiredSkills.join(", ")}`);
  }
  return manifest;
}

function inspectCache(manifest, checks) {
  if (!manifest) {
    return;
  }
  const cacheRoot = path.join(os.homedir(), ".codex", "plugins", "cache");
  const cachedVersions = [];
  for (const marketplace of listDirectories(cacheRoot)) {
    const pluginDirectory = path.join(cacheRoot, marketplace, "hehehe");
    for (const version of listDirectories(pluginDirectory)) {
      cachedVersions.push(`${marketplace}/${version}`);
    }
  }

  if (cachedVersions.length === 0) {
    addCheck(checks, "plugin-cache", "DEGRADED", "no cached hehehe version found", "Run: codex plugin add hehehe@user-local");
  } else if (!cachedVersions.some((entry) => entry.endsWith(`/${manifest.version}`))) {
    addCheck(checks, "plugin-cache", "DEGRADED", `source is ${manifest.version}; cached versions are ${cachedVersions.join(", ")}`, "Run: codex plugin marketplace upgrade user-local");
  } else {
    addCheck(checks, "plugin-cache", "PASS", `cache contains hehehe ${manifest.version}`);
  }

  const browserRoot = path.join(cacheRoot, "openai-bundled", "browser");
  const browserVersions = listDirectories(browserRoot).sort();
  const validVersions = browserVersions.filter((version) => fs.existsSync(path.join(browserRoot, version, "skills", "control-in-app-browser", "SKILL.md")));
  if (validVersions.length === 0) {
    addCheck(checks, "browser-skill", "DEGRADED", "browser control skill is unavailable in the plugin cache", "Repair or reinstall the bundled browser plugin before browser validation.");
  } else {
    addCheck(checks, "browser-skill", "PASS", `browser control skill available in ${validVersions.at(-1)}`);
  }
}

function inspectRuntime(checks) {
  addCheck(checks, "node", "PASS", `Node ${process.version}`);
  const codex = findExecutable("codex");
  addCheck(
    checks,
    "codex-cli",
    "PASS",
    codex ? "Codex CLI found on PATH" : "Codex CLI is not on PATH; Codex App workflows remain supported",
  );
  const claude = findExecutable("claude");
  addCheck(
    checks,
    "claude-cli",
    "PASS",
    claude ? "Claude CLI found on PATH" : "Claude CLI is absent; optional cross-model review is disabled",
  );
}

function inspectProject(options, checks) {
  if (!fs.existsSync(options.project) || !fs.statSync(options.project).isDirectory()) {
    addCheck(checks, "project-root", "BLOCKED", `project directory does not exist: ${options.project}`, "Pass an existing project directory with --project.");
    return;
  }
  addCheck(checks, "project-root", "PASS", options.project);

  const agentsPath = path.join(options.project, "AGENTS.md");
  addCheck(
    checks,
    "project-instructions",
    fs.existsSync(agentsPath) ? "PASS" : "DEGRADED",
    fs.existsSync(agentsPath) ? "root AGENTS.md found" : "root AGENTS.md is missing",
    fs.existsSync(agentsPath) ? null : "Add project guidance when the repository is large or has non-obvious rules.",
  );

  const stateRoot = path.join(options.project, ".hehehe");
  if (!fs.existsSync(stateRoot)) {
    addCheck(checks, "run-state", "PASS", "no hehehe state yet; it will be initialized for non-trivial work");
    return;
  }

  const currentPath = path.join(stateRoot, "current.json");
  if (!fs.existsSync(currentPath)) {
    const legacyFiles = ["done-criteria.md", "checks.md", "build-log.md", "final-report.md", "BROWSER-RESULTS.md"]
      .filter((name) => fs.existsSync(path.join(stateRoot, name)));
    if (legacyFiles.length > 0) {
      addCheck(checks, "run-state", "DEGRADED", `legacy singleton state detected: ${legacyFiles.join(", ")}`, "Preserve legacy files; initialize a run-scoped state for the next non-trivial task.");
    } else {
      addCheck(checks, "run-state", "PASS", ".hehehe exists without active run state");
    }
    return;
  }

  try {
    const current = readJson(currentPath);
    if (current.schema_version !== 1 || typeof current.active_run !== "string") {
      throw new Error("current.json must contain schema_version=1 and active_run");
    }
    const runsRoot = path.join(stateRoot, "runs");
    const statePath = path.resolve(stateRoot, current.active_run);
    if (!isInside(runsRoot, statePath) || path.basename(statePath) !== "state.json") {
      throw new Error("active_run must point to .hehehe/runs/<run-id>/state.json");
    }
    const state = readJson(statePath);
    if (state.schema_version !== 1 || !["active", "blocked", "complete"].includes(state.status)) {
      throw new Error("state.json has an unsupported schema or status");
    }
    addCheck(checks, "run-state", "PASS", `${state.run_id}: ${state.status} / ${state.phase}`);
  } catch (error) {
    addCheck(checks, "run-state", "BLOCKED", `invalid active run state: ${error.message}`, "Repair current.json or its referenced state.json before resuming.");
  }
}

function overallStatus(checks) {
  if (checks.some((check) => check.status === "BLOCKED")) {
    return "BLOCKED";
  }
  if (checks.some((check) => check.status === "DEGRADED")) {
    return "DEGRADED";
  }
  return "PASS";
}

function printReport(report, asJson) {
  if (asJson) {
    process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    return;
  }
  process.stdout.write(`Hehehe Doctor: ${report.status}\n`);
  for (const check of report.checks) {
    process.stdout.write(`[${check.status}] ${check.id}: ${check.summary}\n`);
    if (check.remediation) {
      process.stdout.write(`  Fix: ${check.remediation}\n`);
    }
  }
}

let options;
try {
  options = parseArguments(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`doctor: ${error.message}\n`);
  process.exit(2);
}

if (options.help) {
  process.stdout.write("Usage: doctor.mjs [--project PATH] [--plugin-root PATH] [--json] [--strict]\n");
  process.exit(0);
}

const checks = [];
try {
  const manifest = inspectPlugin(options, checks);
  inspectCache(manifest, checks);
  inspectRuntime(checks);
  inspectProject(options, checks);
} catch (error) {
  addCheck(checks, "doctor-runtime", "BLOCKED", error.message, "Resolve the reported filesystem or runtime error and rerun doctor.");
}
const report = { status: overallStatus(checks), plugin_root: options.pluginRoot, project: options.project, checks };
printReport(report, options.json);

if (report.status === "BLOCKED") {
  process.exitCode = 2;
} else if (options.strict && report.status === "DEGRADED") {
  process.exitCode = 1;
}
