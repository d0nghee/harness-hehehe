// Installs the Claude Code edition for the current user: builds it into an
// owned local marketplace directory and registers it through the Claude CLI.
// The CLI owns Claude Code's settings; this module never edits them directly.

import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildClaudeEdition, claudeSkillCount, writeOutputs } from "./claude-edition.mjs";

const MARKETPLACE_NAME = "hehehe";
const PLUGIN_ID = `hehehe@${MARKETPLACE_NAME}`;
const MARKER = ".hehehe-claude-installation.json";

const fail = (message, cause) => { throw new Error(message, cause ? { cause } : undefined); };
const samePath = (left, right) => {
  const a = path.resolve(left), b = path.resolve(right);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
};

export function claudeMarketplaceDir(homeDir = os.homedir()) {
  return path.join(homeDir, ".claude", "hehehe-marketplace");
}

function quoteForShell(argument) {
  if (/^[A-Za-z0-9_@.:\\/=-]+$/.test(argument)) return argument;
  // cmd.exe expands or reinterprets these even inside double quotes.
  if (/["%^&|<>!\r\n]/.test(argument)) fail(`Cannot pass this value to the Claude CLI safely: ${argument}`);
  return `"${argument}"`;
}

function defaultRunClaude(args) {
  // On Windows the CLI is a shim that only a shell can resolve.
  return process.platform === "win32"
    ? spawnSync(`claude ${args.map(quoteForShell).join(" ")}`, { shell: true, encoding: "utf8", windowsHide: true })
    : spawnSync("claude", args, { encoding: "utf8" });
}

function claude(runClaude, args, { allowFailure = false } = {}) {
  const result = runClaude(args);
  if (result?.error || result?.status !== 0) {
    if (allowFailure) return null;
    const details = (result?.stderr || result?.stdout || result?.error?.message || "unknown Claude CLI error").trim();
    fail(`Claude CLI failed (${details}). Run: claude ${args.join(" ")}`);
  }
  return result.stdout ?? "";
}

function requireClaudeCli(runClaude) {
  if (claude(runClaude, ["--version"], { allowFailure: true }) === null) {
    fail("The Claude Code CLI was not found. Install Claude Code, make sure `claude` runs in this terminal, then try again.");
  }
}

function listJson(runClaude, args) {
  const text = claude(runClaude, [...args, "--json"]);
  let value;
  try { value = JSON.parse(text); } catch (error) { fail(`Claude CLI returned unreadable output for: claude ${args.join(" ")}`, error); }
  if (!Array.isArray(value)) fail(`Claude CLI returned unexpected output for: claude ${args.join(" ")}`);
  return value;
}

// "absent", or "managed" when the directory carries this installer's marker for
// this exact location. Anything else is someone else's directory and is refused.
function ownership(target) {
  let details;
  try { details = fs.lstatSync(target); } catch (error) {
    if (error.code === "ENOENT") return "absent";
    throw error;
  }
  if (!details.isDirectory() || details.isSymbolicLink()) fail(`Refusing to change a path that is not a plain directory: ${target}`);
  let marker;
  try { marker = JSON.parse(fs.readFileSync(path.join(target, MARKER), "utf8")); } catch {
    fail(`Refusing to change an unmanaged directory: ${target}`);
  }
  if (marker?.schemaVersion !== 1 || marker?.plugin !== "hehehe" || typeof marker.target !== "string"
    || !samePath(marker.target, fs.realpathSync(target))) {
    fail(`Refusing to change a directory whose ownership marker does not match: ${target}`);
  }
  return "managed";
}

function writeMarketplace(directory, target, outputs, version) {
  fs.mkdirSync(directory, { recursive: true });
  writeOutputs(path.join(directory, "hehehe"), outputs);
  const marketplace = {
    name: MARKETPLACE_NAME,
    owner: { name: "d0nghee" },
    metadata: { description: "Claude Code edition of hehehe, installed by harness-hehehe." },
    plugins: [{ name: "hehehe", source: "./hehehe", version,
      description: "Claude-first development workflow with Codex as an optional read-only reviewer." }],
  };
  fs.mkdirSync(path.join(directory, ".claude-plugin"), { recursive: true });
  fs.writeFileSync(path.join(directory, ".claude-plugin", "marketplace.json"), `${JSON.stringify(marketplace, null, 2)}\n`);
  fs.writeFileSync(path.join(directory, MARKER), `${JSON.stringify({ schemaVersion: 1, plugin: "hehehe", target })}\n`);
}

// Build beside the target, then swap. A failed swap puts the previous directory back.
function replaceDirectory(target, outputs, version, existing) {
  const parent = path.dirname(target);
  fs.mkdirSync(parent, { recursive: true });
  const realTarget = path.join(fs.realpathSync(parent), path.basename(target));
  const staging = `${target}.staging-${randomUUID()}`;
  const backup = `${target}.backup-${randomUUID()}`;
  try {
    writeMarketplace(staging, realTarget, outputs, version);
    if (existing) fs.renameSync(target, backup);
    try {
      fs.renameSync(staging, target);
    } catch (error) {
      if (existing) fs.renameSync(backup, target);
      throw error;
    }
  } finally {
    fs.rmSync(staging, { recursive: true, force: true });
  }
  if (existing) fs.rmSync(backup, { recursive: true, force: true });
}

function registeredMarketplace(runClaude) {
  return listJson(runClaude, ["plugin", "marketplace", "list"]).find((entry) => entry?.name === MARKETPLACE_NAME) ?? null;
}

function assertOwnMarketplace(entry, target) {
  const location = entry.path ?? entry.installLocation;
  if (typeof location !== "string" || !samePath(location, target)) {
    fail(`A different Claude Code marketplace named "${MARKETPLACE_NAME}" is already configured. Remove it first: claude plugin marketplace remove ${MARKETPLACE_NAME}`);
  }
}

export function installClaude({ sourcePluginDir, version, homeDir = os.homedir(), dryRun = false, runClaude = defaultRunClaude }) {
  const outputs = buildClaudeEdition({ sourcePluginDir, version });
  const target = claudeMarketplaceDir(homeDir);
  const state = ownership(target);
  const result = { scope: "claude", version, dryRun, sourcePluginDir, marketplaceDir: target, pluginId: PLUGIN_ID,
    skills: claudeSkillCount(outputs), files: outputs.length, ownership: state, otherEditions: [] };
  if (dryRun) return result;

  requireClaudeCli(runClaude);
  const registered = registeredMarketplace(runClaude);
  if (registered) assertOwnMarketplace(registered, target);

  replaceDirectory(target, outputs, version, state === "managed");

  if (registered) claude(runClaude, ["plugin", "marketplace", "update", MARKETPLACE_NAME]);
  else claude(runClaude, ["plugin", "marketplace", "add", target]);

  const installed = listJson(runClaude, ["plugin", "list"]).map((entry) => entry?.id).filter((id) => typeof id === "string");
  // Reinstall so Claude Code copies the new files even when the version number is unchanged.
  if (installed.includes(PLUGIN_ID)) claude(runClaude, ["plugin", "uninstall", PLUGIN_ID]);
  claude(runClaude, ["plugin", "install", PLUGIN_ID, "--scope", "user"]);
  result.otherEditions = installed.filter((id) => id.startsWith("hehehe@") && id !== PLUGIN_ID);
  return result;
}

export function uninstallClaude({ homeDir = os.homedir(), dryRun = false, runClaude = defaultRunClaude } = {}) {
  const target = claudeMarketplaceDir(homeDir);
  const state = ownership(target);
  const result = { scope: "claude", dryRun, marketplaceDir: target, pluginId: PLUGIN_ID, ownership: state };
  if (dryRun) return result;

  requireClaudeCli(runClaude);
  const installed = listJson(runClaude, ["plugin", "list"]).map((entry) => entry?.id);
  const registered = registeredMarketplace(runClaude);
  // Only unregister what this installer registered: the marketplace at its own directory.
  const own = registered && samePath(registered.path ?? registered.installLocation ?? "", target);
  if (own && installed.includes(PLUGIN_ID)) claude(runClaude, ["plugin", "uninstall", PLUGIN_ID]);
  if (own) claude(runClaude, ["plugin", "marketplace", "remove", MARKETPLACE_NAME]);
  if (state === "managed") fs.rmSync(target, { recursive: true, force: true });
  return result;
}
