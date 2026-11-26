#!/usr/bin/env node
// Writes the Claude Code edition next to this script so it can be inspected.
// Installing it for use is `harness-hehehe install --claude`; this script is a
// development aid and its output directory is not committed.
//
// Usage: node claude-plugin/build.mjs [--check]
//   --check  build in memory and fail if a required source sentence is missing,
//            without writing any file.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildClaudeEdition, claudeSkillCount, writeOutputs } from "../lib/claude-edition.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const outputRoot = path.join(here, "hehehe");

const version = JSON.parse(fs.readFileSync(path.join(repoRoot, "package.json"), "utf8")).version;
const outputs = buildClaudeEdition({ sourcePluginDir: path.join(repoRoot, "plugins", "hehehe"), version });
const summary = `${claudeSkillCount(outputs)} skills, ${outputs.length} files`;

if (process.argv.includes("--check")) {
  process.stdout.write(`Claude plugin build check passed: ${summary}\n`);
} else {
  // Only ever remove the generated directory that sits next to this script.
  fs.rmSync(outputRoot, { recursive: true, force: true });
  writeOutputs(outputRoot, outputs);
  process.stdout.write(`Built Claude plugin at ${outputRoot}: ${summary}\n`);
}
