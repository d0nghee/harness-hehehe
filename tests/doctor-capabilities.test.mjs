import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const plugin = path.join(root, "plugins/hehehe");
const doctor = path.join(plugin, "skills/doctor/scripts/doctor.mjs");
const version = JSON.parse(fs.readFileSync(path.join(plugin, ".codex-plugin/plugin.json"))).version;

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-doctor-capabilities-"));
  const codexHome = path.join(directory, "codex");
  const cache = path.join(codexHome, "plugins/cache/user-local/hehehe", version);
  fs.mkdirSync(cache, { recursive: true });
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const run = () => {
    const output = spawnSync(process.execPath, [doctor, "--project", directory, "--plugin-root", plugin, "--json"], {
      encoding: "utf8", windowsHide: true, env: { ...process.env, CODEX_HOME: codexHome },
    });
    assert.ok(output.status === 0 || output.status === 2, output.stderr);
    return JSON.parse(output.stdout);
  };
  return { directory, codexHome, cache, run };
}

test("doctor verifies cache contents instead of a directory version label", (t) => {
  const f = fixture(t);
  assert.equal(f.run().checks.find((item) => item.id === "plugin-cache").status, "DEGRADED");
  fs.cpSync(plugin, f.cache, { recursive: true });
  assert.equal(f.run().checks.find((item) => item.id === "plugin-cache").status, "PASS");
  fs.appendFileSync(path.join(f.cache, "skills/resume/scripts/run-state.mjs"), "\n// stale payload\n");
  assert.equal(f.run().checks.find((item) => item.id === "plugin-cache").status, "DEGRADED");
});

test("one valid cache cannot hide a damaged copy from another marketplace", (t) => {
  const f = fixture(t);
  fs.cpSync(plugin, f.cache, { recursive: true });
  fs.mkdirSync(path.join(f.codexHome, "plugins/cache/other/hehehe", version), { recursive: true });
  const check = f.run().checks.find((item) => item.id === "plugin-cache");
  assert.equal(check.status, "DEGRADED");
  assert.match(check.summary, /other/);
});

test("doctor recognizes the current computer-use provider without claiming live execution", (t) => {
  const f = fixture(t);
  const skill = path.join(f.codexHome, "plugins/cache/openai-bundled/computer-use/1.0.0/skills/computer-use/SKILL.md");
  fs.mkdirSync(path.dirname(skill), { recursive: true });
  fs.writeFileSync(skill, "---\nname: computer-use\ndescription: Browser control\n---\n");
  let check = f.run().checks.find((item) => item.id === "browser-skill");
  assert.equal(check.status, "PASS");
  assert.match(check.summary, /computer-use/);
  assert.match(check.summary, /live execution not tested/);
  fs.writeFileSync(skill, "invalid provider metadata");
  check = f.run().checks.find((item) => item.id === "browser-skill");
  assert.equal(check.status, "DEGRADED");
  assert.match(check.remediation, /session tool inventory/);
});
