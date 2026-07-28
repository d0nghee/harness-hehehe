import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");

async function read(relativePath) {
  return readFile(path.join(root, relativePath), "utf8");
}

test("observability skill defaults to existing local facilities", async () => {
  const skill = await read("plugins/hehehe/skills/observability/SKILL.md");

  assert.match(skill, /use `auto` when none is given/i);
  assert.match(skill, /Do not install Grafana, Loki, Prometheus, Tempo, OpenTelemetry/);
  assert.match(skill, /`full`: only when explicitly requested/);
  assert.match(skill, /Stop only containers started for this run/);
});

test("structured error reference separates client and server evidence", async () => {
  const reference = await read(
    "plugins/hehehe/skills/observability/references/error-contract.md",
  );

  assert.match(reference, /stable uppercase `error_code`/);
  assert.match(reference, /Never return raw exception messages/);
  assert.match(reference, /request or correlation identifier/);
  assert.match(reference, /Do not log passwords/);
  assert.match(reference, /Map those failures .* at a transport-level error handler/);
});

test("core workflows integrate the observability contract", async () => {
  const files = await Promise.all([
    read("plugins/hehehe/skills/full-resolve/SKILL.md"),
    read("plugins/hehehe/skills/backend-architecture/SKILL.md"),
    read("plugins/hehehe/skills/preflight/SKILL.md"),
    read("plugins/hehehe/skills/review/SKILL.md"),
  ]);

  for (const content of files) {
    assert.match(content, /hehehe:observability/);
  }
});

test("catalog and plugin prompt expose observability", async () => {
  const catalog = JSON.parse(
    await read("plugins/hehehe/skill-catalog.json"),
  );
  const manifest = JSON.parse(
    await read("plugins/hehehe/.codex-plugin/plugin.json"),
  );

  assert.ok(catalog.skills.includes("observability"));
  assert.ok(
    manifest.interface.defaultPrompt.some((prompt) =>
      prompt.includes("$hehehe:observability")),
  );
});

test("browser validation is the single browser-testing skill", async () => {
  const catalog = JSON.parse(
    await read("plugins/hehehe/skill-catalog.json"),
  );
  const skill = await read("plugins/hehehe/skills/browser-validate/SKILL.md");

  assert.ok(catalog.skills.includes("browser-validate"));
  assert.ok(!catalog.skills.includes("browser-tool-test"));
  assert.match(skill, /browser:control-in-app-browser/);
  assert.match(skill, /real clicks, typing, navigation, and state changes/);
  await assert.rejects(
    read("plugins/hehehe/skills/browser-tool-test/SKILL.md"),
    { code: "ENOENT" },
  );
});
