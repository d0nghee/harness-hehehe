#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  installGlobal,
  installProject,
  uninstallGlobal,
  uninstallProject,
} from "../lib/installer.mjs";
import { runProfileCli } from "../plugins/hehehe/skills/architecture-metrics/scripts/project-profile.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePluginDir = path.join(packageRoot, "plugins", "hehehe");

function usage() {
  return `harness-hehehe Codex plugin installer

Usage:
  harness-hehehe install --global [--dry-run]
  harness-hehehe install --project [path] [--dry-run]
  harness-hehehe uninstall --global [--dry-run]
  harness-hehehe uninstall --project [path] [--dry-run]
  harness-hehehe profile [path] [--json] [--write]
    [--config path] [--allow-downgrade]

Examples:
  npx harness-hehehe install --global
  npx harness-hehehe install --project .
  npx harness-hehehe install --project "D:\\work\\my-app"
  npx harness-hehehe profile . --write
`;
}

function parseArguments(args) {
  if (args.includes("--help") || args.includes("-h")) {
    return { help: true };
  }
  if (args.includes("--version") || args.includes("-v")) {
    return { version: true };
  }
  if (args[0] === "profile") {
    return { command: "profile", profileArgs: args.slice(1) };
  }
  if (args[0] !== "install" && args[0] !== "uninstall") {
    throw new Error("Expected the install, uninstall, or profile command.\n\n" + usage());
  }

  const command = args[0];
  let scope;
  let projectDir;
  let dryRun = false;
  for (let index = 1; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--global") {
      if (scope) throw new Error("Choose exactly one scope: --global or --project.");
      scope = "global";
    } else if (argument === "--project") {
      if (scope) throw new Error("Choose exactly one scope: --global or --project.");
      scope = "project";
      const candidate = args[index + 1];
      if (candidate && !candidate.startsWith("-")) {
        projectDir = candidate;
        index += 1;
      }
    } else if (argument.startsWith("--project=")) {
      if (scope) throw new Error("Choose exactly one scope: --global or --project.");
      scope = "project";
      projectDir = argument.slice("--project=".length);
      if (!projectDir) throw new Error("--project requires a non-empty path.");
    } else if (argument === "--dry-run") {
      dryRun = true;
    } else {
      throw new Error(`Unknown argument: ${argument}\n\n${usage()}`);
    }
  }

  if (!scope) {
    throw new Error("Choose an installation scope with --global or --project.\n\n" + usage());
  }
  return { command, scope, projectDir, dryRun };
}

function printResult(result) {
  console.log(`${result.dryRun ? "[dry-run] " : ""}hehehe ${result.version} ${result.scope} installation`);
  console.log(`Source: ${result.sourcePluginDir}`);
  if (result.scope === "global") {
    console.log(`Plugin target: ${result.targetPluginDir}`);
    console.log(`Marketplace target: ${result.marketplacePath}`);
  } else {
    console.log(`Skills target: ${result.targetSkillsDir}`);
    console.log(`Project skills: ${result.installedSkills.length} ($hehehe:*)`);
  }
  if (result.dryRun) {
    console.log("No files were changed.");
  } else if (result.scope === "global") {
    console.log(`Activated: hehehe@${result.marketplaceName}`);
    console.log("Restart Codex or start a new thread to load the updated plugin.");
  } else {
    console.log("Open this project in Codex, then start a new thread to load the project-scoped skills.");
  }
}

function printUninstallResult(result) {
  console.log(`${result.dryRun ? "[dry-run] " : ""}hehehe ${result.scope} uninstall`);
  if (result.scope === "global") {
    console.log(`Plugin target: ${result.targetPluginDir}`);
    console.log(`Marketplace target: ${result.marketplacePath}`);
  } else {
    console.log(`Skills target: ${result.targetSkillsDir}`);
    console.log(`Project skills: ${result.installedSkills.length} ($hehehe:*)`);
  }
  if (result.dryRun) {
    console.log("No files were changed.");
    return;
  } else if (result.scope === "global") {
    console.log("Removed the hehehe plugin entry without changing other marketplace plugins.");
  } else {
    console.log("Removed managed hehehe project skills without changing unrelated repo skills.");
  }
  console.log("Restart Codex or start a new thread to refresh the available skills.");
}

async function main() {
  const parsed = parseArguments(process.argv.slice(2));
  if (parsed.help) {
    console.log(usage());
    return;
  }
  if (parsed.version) {
    const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
    console.log(packageJson.version);
    return;
  }
  if (parsed.command === "profile") {
    await runProfileCli(parsed.profileArgs);
    return;
  }

  if (parsed.command === "install") {
    const result = parsed.scope === "global"
      ? await installGlobal({ sourcePluginDir, dryRun: parsed.dryRun })
      : await installProject({ sourcePluginDir, projectDir: parsed.projectDir, dryRun: parsed.dryRun });
    printResult(result);
  } else {
    const result = parsed.scope === "global"
      ? await uninstallGlobal({ dryRun: parsed.dryRun })
      : await uninstallProject({ projectDir: parsed.projectDir, dryRun: parsed.dryRun });
    printUninstallResult(result);
  }
}

main().catch((error) => {
  console.error(`harness-hehehe failed: ${error.message}`);
  process.exitCode = 1;
});
