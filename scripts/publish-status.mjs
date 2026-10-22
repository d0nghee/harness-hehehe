#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function needsPublication(pkg, request = fetch) {
  if (typeof pkg?.name !== "string" || !pkg.name || typeof pkg.version !== "string" || !pkg.version) {
    throw new Error("Package name and version are required");
  }
  const endpoint = `https://registry.npmjs.org/${encodeURIComponent(pkg.name)}/${encodeURIComponent(pkg.version)}`;
  const response = await request(endpoint, {
    headers: { accept: "application/json", "cache-control": "no-cache" },
    signal: AbortSignal.timeout(30000),
  });
  if (response.status === 404) return true;
  if (response.status !== 200) throw new Error(`npm version lookup failed: HTTP ${response.status}`);
  const published = await response.json();
  if (published.name !== pkg.name || published.version !== pkg.version) {
    throw new Error("npm returned unexpected package metadata");
  }
  return false;
}

async function main() {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const publish = await needsPublication(pkg);
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `publish=${publish}\n`);
  }
  process.stdout.write(`${pkg.name}@${pkg.version}: ${publish ? "ready to publish" : "already published; publication skipped"}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    process.stderr.write(`Publication check failed: ${error.message}\n`);
    process.exitCode = 1;
  });
}
