#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { git } from "./verification-policy.mjs";

// Run this adapter from a trusted installation/workflow, never from PR-controlled code.
const scripts = ["run-state.mjs", "verification-policy.mjs", "verification-runner.mjs"];
const prefix = "plugins/hehehe/skills/resume/scripts/";
let temporary;
try {
  const project = path.resolve(process.argv[2] ?? ".");
  const base = process.env.HEHEHE_VERIFICATION_BASE;
  if (!base || !/^[a-f0-9]{40}$/.test(base)) throw new Error("CI requires a trusted full HEHEHE_VERIFICATION_BASE SHA");
  temporary = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-trusted-ci-"));
  for (const script of scripts) {
    fs.writeFileSync(path.join(temporary, script), git(project, ["show", `${base}:${prefix}${script}`]));
  }
  // init still needs the baseline's template; no PR copy is used.
  const templateDir = path.join(temporary, "templates");
  fs.mkdirSync(templateDir);
  fs.writeFileSync(path.join(templateDir, "done-criteria.md"),
    git(project, ["show", `${base}:plugins/hehehe/templates/done-criteria.md`]));
  fs.mkdirSync(path.join(temporary, "scripts"));
  for (const script of scripts) fs.renameSync(path.join(temporary, script), path.join(temporary, "scripts", script));
  const runner = path.join(temporary, "scripts/run-state.mjs");
  // Use a unique run so tracked local history cannot dictate the CI run identity.
  const stateRoot = path.join(project, ".hehehe");
  const pointer = path.join(stateRoot, "current.json");
  const original = fs.existsSync(pointer) ? fs.readFileSync(pointer) : null;
  if (original) fs.unlinkSync(pointer);
  try {
    for (const args of [["init", "--goal", "CI required verification"], ["verify"], ["complete"]]) {
      const result = spawnSync(process.execPath, [runner, ...args, "--project", project, "--json"], {
        stdio: "inherit", windowsHide: true, env: process.env,
      });
      if (result.error || result.status !== 0) throw new Error(`CI ${args[0]} failed (${result.status}): ${result.error?.message ?? "see verification output"}`);
    }
  } finally {
    if (original) fs.writeFileSync(pointer, original);
  }
} catch (error) {
  process.stderr.write(`ci-verification: ${error.message}\n`);
  process.exitCode = 1;
} finally {
  if (temporary) fs.rmSync(temporary, { recursive: true, force: true });
}
