#!/usr/bin/env node
import path from "node:path";
import { pathToFileURL } from "node:url";
import * as lifecycle from "./release-lifecycle.mjs";
import { createReleaseGateway } from "./release-gateway.mjs";

const REQUEST = /^release-[a-f0-9]{24}$/;
const COMMANDS = new Set(["plan", "prepare", "verify", "publish", "status"]);

export function parseReleaseArguments(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  const operation = argv[0];
  if (!COMMANDS.has(operation)) throw new Error("Expected release plan, prepare, verify, publish or status");
  const options = { operation, project: process.cwd(), json: false };
  const seen = new Set();
  for (let index = 1; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--json") { options.json = true; continue; }
    if (!["--project", "--request"].includes(flag) || seen.has(flag)) throw new Error("Unknown or duplicate release option");
    seen.add(flag);
    const value = argv[++index];
    if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
    options[flag.slice(2)] = value;
  }
  options.project = path.resolve(options.project);
  if ((options.request && !REQUEST.test(options.request))
    || (["verify", "publish"].includes(operation) && !options.request)
    || (operation === "plan" && options.request)) throw new Error("Release command requires its exact release-<24 hex> request identity");
  return options;
}

export async function runReleaseCli(argv, { api = lifecycle, gatewayFactory = createReleaseGateway,
  stdout = process.stdout, stderr = process.stderr } = {}) {
  let options;
  try {
    options = parseReleaseArguments(argv);
    if (options.help) {
      stdout.write("Usage: node scripts/release.mjs <plan|prepare|verify|publish|status> --project <root> [--request <release-id>] [--json]\n");
      return 0;
    }
    let result;
    if (options.operation === "plan") result = await api.releasePlan(options.project);
    else if (options.operation === "prepare") result = await api.prepareRelease(options.project, { resumeRequestId: options.request });
    else if (options.operation === "verify") result = await api.verifyRelease(options.project, options.request);
    else if (options.operation === "status") result = await api.releaseStatus(options.project, options.request);
    else result = await api.publishRelease(options.project, options.request, gatewayFactory());
    stdout.write(options.json ? JSON.stringify(result, null, 2) + "\n"
      : `${options.operation}: ${result?.status ?? "complete"}${result?.request_id ? ` (${result.request_id})` : ""}\n`);
    return 0;
  } catch (error) {
    const message = String(error?.message ?? "Release command failed").split(/\r?\n/)[0].slice(0, 500)
      .replace(/\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|npm_[A-Za-z0-9]+)\b/g, "[REDACTED]");
    const operation = options?.operation ?? argv[0];
    const failure = { status: "blocked", error_code: "RELEASE_BLOCKED", operation: COMMANDS.has(operation) ? operation : "unknown",
      request_id: options?.request ?? null, message };
    if (options?.json || argv.includes("--json")) stdout.write(JSON.stringify(failure, null, 2) + "\n");
    else stderr.write(`release: ${message}\n`);
    return 2;
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  process.exitCode = await runReleaseCli(process.argv.slice(2));
}
