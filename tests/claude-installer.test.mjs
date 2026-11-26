import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildClaudeEdition, claudeSkillCount } from "../lib/claude-edition.mjs";
import { claudeMarketplaceDir, installClaude, uninstallClaude } from "../lib/claude-installer.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const sourcePluginDir = path.join(repoRoot, "plugins", "hehehe");
const cli = path.join(repoRoot, "bin", "hehehe.mjs");
const version = "9.8.7";

function temporaryHome(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-claude-install-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(home)), path.resolve(os.tmpdir()));
    fs.rmSync(home, { recursive: true, force: true });
  });
  return home;
}

// Stands in for the Claude CLI: keeps the registered marketplaces and installed
// plugins in memory and records every invocation.
function fakeClaude({ marketplaces = [], plugins = [], available = true, failOn } = {}) {
  const state = { marketplaces: [...marketplaces], plugins: [...plugins], calls: [] };
  const ok = (stdout = "") => ({ status: 0, stdout, stderr: "" });
  const run = (args) => {
    state.calls.push(args.join(" "));
    if (!available) return { status: 1, stdout: "", stderr: "", error: new Error("spawn claude ENOENT") };
    if (failOn && args.join(" ").startsWith(failOn)) return { status: 1, stdout: "", stderr: "simulated failure" };
    const [first, second, third, fourth] = args;
    if (first === "--version") return ok("2.0.0 (Claude Code)\n");
    if (first !== "plugin") return { status: 1, stdout: "", stderr: "unknown command" };
    if (second === "marketplace" && third === "list") return ok(JSON.stringify(state.marketplaces));
    if (second === "marketplace" && third === "add") {
      const name = JSON.parse(fs.readFileSync(path.join(fourth, ".claude-plugin", "marketplace.json"), "utf8")).name;
      state.marketplaces.push({ name, source: "directory", path: fourth, installLocation: fourth });
      return ok();
    }
    if (second === "marketplace" && third === "update") return ok();
    if (second === "marketplace" && third === "remove") {
      state.marketplaces = state.marketplaces.filter((entry) => entry.name !== fourth);
      return ok();
    }
    if (second === "list") return ok(JSON.stringify(state.plugins.map((id) => ({ id, scope: "user", enabled: true }))));
    if (second === "install") { state.plugins.push(third); return ok(); }
    if (second === "uninstall") { state.plugins = state.plugins.filter((id) => id !== third); return ok(); }
    return { status: 1, stdout: "", stderr: "unknown command" };
  };
  return { run, state };
}

const read = (file) => fs.readFileSync(file, "utf8");

test("the Claude edition inverts the roles, drops Codex-only parts and keeps design references verbatim", () => {
  const outputs = buildClaudeEdition({ sourcePluginDir, version });
  const text = (relative) => {
    const item = outputs.find((entry) => entry.relative === relative);
    assert.ok(item, relative);
    return item.content.toString();
  };
  assert.equal(JSON.parse(text(".claude-plugin/plugin.json")).version, version);
  assert.match(text("skills/hehehe/SKILL.md"), /Claude owns the critical path/);
  assert.match(text("skills/hehehe/SKILL.md"), /using Codex only as an optional independent reviewer/);
  assert.match(text("skills/hehehe/SKILL.md"), /same authority as `CLAUDE\.md`/);
  assert.doesNotMatch(text("skills/hehehe/SKILL.md"), /hehehe:doctor/);
  assert.match(text("skills/subagent-resolve/SKILL.md"), /codex exec --sandbox read-only/);
  assert.doesNotMatch(text("skills/subagent-resolve/SKILL.md"), /--permission-mode plan/);
  assert.doesNotMatch(text("skills/browser-validate/SKILL.md"), /control-in-app-browser/);
  assert.equal(outputs.some((item) => item.relative.startsWith("skills/doctor/")), false);
  assert.equal(outputs.some((item) => item.relative.includes("/agents/")), false);
  const reference = "skills/design-ui/references/design-ai/design-md/stripe/DESIGN.md";
  assert.deepEqual(outputs.find((item) => item.relative === reference).content, fs.readFileSync(path.join(sourcePluginDir, reference)));
  const sourceSkills = fs.readdirSync(path.join(sourcePluginDir, "skills")).length;
  assert.equal(claudeSkillCount(outputs), sourceSkills - 1);
});

test("a changed source sentence fails the build instead of producing stale Claude instructions", (t) => {
  const home = temporaryHome(t);
  const copy = path.join(home, "plugin");
  fs.cpSync(sourcePluginDir, copy, { recursive: true });
  const skill = path.join(copy, "skills", "subagent-resolve", "SKILL.md");
  fs.writeFileSync(skill, read(skill).replace("--permission-mode plan", "--some-other-flag"));
  assert.throws(() => buildClaudeEdition({ sourcePluginDir: copy, version }), /expected source sentence not found/);
  assert.throws(() => buildClaudeEdition({ sourcePluginDir, version: "next" }), /stable package version/);
});

test("install builds an owned marketplace, registers it and installs the plugin for the user", (t) => {
  const home = temporaryHome(t);
  const claude = fakeClaude();
  const result = installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run });
  const target = claudeMarketplaceDir(home);
  assert.equal(result.marketplaceDir, target);
  assert.equal(result.pluginId, "hehehe@hehehe");
  assert.equal(result.ownership, "absent");
  assert.deepEqual(result.otherEditions, []);
  const marketplace = JSON.parse(read(path.join(target, ".claude-plugin", "marketplace.json")));
  assert.equal(marketplace.name, "hehehe");
  assert.deepEqual(marketplace.plugins.map((plugin) => [plugin.name, plugin.source, plugin.version]), [["hehehe", "./hehehe", version]]);
  assert.equal(JSON.parse(read(path.join(target, "hehehe", ".claude-plugin", "plugin.json"))).version, version);
  assert.match(read(path.join(target, "hehehe", "skills", "full-resolve", "SKILL.md")), /Claude-first/);
  assert.equal(fs.existsSync(path.join(target, "hehehe", "skills", "resume", "scripts", "run-state.mjs")), true);
  assert.deepEqual(claude.state.plugins, ["hehehe@hehehe"]);
  assert.deepEqual(claude.state.marketplaces.map((entry) => entry.name), ["hehehe"]);
  assert.ok(claude.state.calls.includes(`plugin marketplace add ${target}`));
  assert.ok(claude.state.calls.includes("plugin install hehehe@hehehe --scope user"));
  assert.deepEqual(fs.readdirSync(path.dirname(target)), ["hehehe-marketplace"], "no staging or backup directory is left behind");
});

test("reinstall replaces stale files, refreshes the registration and reports other hehehe editions", (t) => {
  const home = temporaryHome(t);
  const claude = fakeClaude({ plugins: ["hehehe@hehehe-local", "unrelated@elsewhere"] });
  installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run });
  const target = claudeMarketplaceDir(home);
  const stale = path.join(target, "hehehe", "skills", "removed-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(stale), { recursive: true });
  fs.writeFileSync(stale, "stale");
  claude.state.calls.length = 0;
  const result = installClaude({ sourcePluginDir, version: "9.8.8", homeDir: home, runClaude: claude.run });
  assert.equal(result.ownership, "managed");
  assert.equal(fs.existsSync(stale), false);
  assert.equal(JSON.parse(read(path.join(target, "hehehe", ".claude-plugin", "plugin.json"))).version, "9.8.8");
  assert.deepEqual(result.otherEditions, ["hehehe@hehehe-local"]);
  assert.ok(claude.state.calls.includes("plugin marketplace update hehehe"));
  assert.equal(claude.state.calls.some((call) => call.startsWith("plugin marketplace add")), false);
  assert.ok(claude.state.calls.indexOf("plugin uninstall hehehe@hehehe") < claude.state.calls.indexOf("plugin install hehehe@hehehe --scope user"));
  assert.deepEqual(claude.state.plugins.sort(), ["hehehe@hehehe", "hehehe@hehehe-local", "unrelated@elsewhere"]);
  assert.deepEqual(fs.readdirSync(path.dirname(target)), ["hehehe-marketplace"]);
});

test("dry runs change nothing and never call the Claude CLI", (t) => {
  const home = temporaryHome(t);
  const claude = fakeClaude();
  const result = installClaude({ sourcePluginDir, version, homeDir: home, dryRun: true, runClaude: claude.run });
  assert.equal(result.dryRun, true);
  assert.ok(result.skills > 10);
  assert.deepEqual(fs.readdirSync(home), []);
  assert.equal(uninstallClaude({ homeDir: home, dryRun: true, runClaude: claude.run }).ownership, "absent");
  assert.deepEqual(claude.state.calls, []);
});

test("a missing Claude CLI stops before any file is written", (t) => {
  const home = temporaryHome(t);
  const claude = fakeClaude({ available: false });
  assert.throws(() => installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run }), /Claude Code CLI was not found/);
  assert.deepEqual(fs.readdirSync(home), []);
  assert.throws(() => uninstallClaude({ homeDir: home, runClaude: claude.run }), /Claude Code CLI was not found/);
});

test("an unmanaged or mismarked directory is never replaced or removed", (t) => {
  for (const marker of [null, "not json", JSON.stringify({ schemaVersion: 1, plugin: "hehehe", target: "another-folder" })]) {
    const home = temporaryHome(t);
    const target = claudeMarketplaceDir(home);
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(path.join(target, "personal.txt"), "keep");
    if (marker !== null) fs.writeFileSync(path.join(target, ".hehehe-claude-installation.json"), marker);
    const claude = fakeClaude();
    assert.throws(() => installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run }), /Refusing to change/);
    assert.throws(() => installClaude({ sourcePluginDir, version, homeDir: home, dryRun: true, runClaude: claude.run }), /Refusing to change/);
    assert.throws(() => uninstallClaude({ homeDir: home, runClaude: claude.run }), /Refusing to change/);
    assert.equal(read(path.join(target, "personal.txt")), "keep");
    assert.deepEqual(claude.state.calls, []);
  }
});

test("a different marketplace already named hehehe is not taken over", (t) => {
  const home = temporaryHome(t);
  const foreign = { name: "hehehe", source: "directory", path: path.join(home, "someone-else"), installLocation: path.join(home, "someone-else") };
  const claude = fakeClaude({ marketplaces: [foreign], plugins: ["hehehe@hehehe"] });
  assert.throws(() => installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run }), /different Claude Code marketplace/);
  assert.equal(fs.existsSync(claudeMarketplaceDir(home)), false);
  uninstallClaude({ homeDir: home, runClaude: claude.run });
  assert.deepEqual(claude.state.marketplaces, [foreign], "uninstall leaves a marketplace it did not register");
  assert.deepEqual(claude.state.plugins, ["hehehe@hehehe"]);
});

test("a failed registration reports the command to run and keeps the built directory for a retry", (t) => {
  const home = temporaryHome(t);
  const claude = fakeClaude({ failOn: "plugin install" });
  assert.throws(() => installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run }),
    /Claude CLI failed \(simulated failure\)\. Run: claude plugin install hehehe@hehehe --scope user/);
  const retry = fakeClaude({ marketplaces: claude.state.marketplaces });
  assert.equal(installClaude({ sourcePluginDir, version, homeDir: home, runClaude: retry.run }).ownership, "managed");
  assert.deepEqual(retry.state.plugins, ["hehehe@hehehe"]);
});

test("uninstall removes the plugin, the marketplace and the owned directory, and is a no-op when absent", (t) => {
  const home = temporaryHome(t);
  const claude = fakeClaude({ plugins: ["unrelated@elsewhere"] });
  installClaude({ sourcePluginDir, version, homeDir: home, runClaude: claude.run });
  const result = uninstallClaude({ homeDir: home, runClaude: claude.run });
  assert.equal(result.ownership, "managed");
  assert.equal(fs.existsSync(claudeMarketplaceDir(home)), false);
  assert.deepEqual(claude.state.plugins, ["unrelated@elsewhere"]);
  assert.deepEqual(claude.state.marketplaces, []);
  claude.state.calls.length = 0;
  assert.equal(uninstallClaude({ homeDir: home, runClaude: claude.run }).ownership, "absent");
  assert.equal(claude.state.calls.some((call) => /uninstall|remove/.test(call)), false);
});

test("the command line accepts --claude as a scope of its own", () => {
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", windowsHide: true });
  assert.match(run("--help").stdout, /harness-hehehe install --claude \[--dry-run\]/);
  const conflicting = run("install", "--claude", "--global");
  assert.notEqual(conflicting.status, 0);
  assert.match(conflicting.stderr, /Choose exactly one scope: --global, --project or --claude/);
  assert.match(run("install").stderr, /--global, --project or --claude/);
});
