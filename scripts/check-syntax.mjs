#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function files(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? files(target) : target.endsWith(".mjs") ? [target] : [];
  });
}

for (const file of ["bin", "lib", "plugins/hehehe", "scripts"].flatMap(files)) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit", windowsHide: true });
  if (result.error || result.status !== 0) {
    process.stderr.write(`Syntax check failed: ${file}\n`);
    process.exit(result.status || 1);
  }
}
