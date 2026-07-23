import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { installGlobal, installProject, uninstallProject } from "../lib/installer.mjs";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePluginDir = path.join(packageRoot, "plugins", "hehehe");
const temporaryRoots = [];

async function temporaryDirectory(prefix) {
  const directory = await mkdtemp(path.join(os.tmpdir(), prefix));
  temporaryRoots.push(directory);
  return directory;
}

test.after(async () => {
  await Promise.all(temporaryRoots.map((directory) => rm(directory, { recursive: true, force: true })));
});

test("global install preserves marketplace entries and uses AVAILABLE policy", async () => {
  const homeDir = await temporaryDirectory("hehehe-global-");
  const marketplacePath = path.join(homeDir, ".agents", "plugins", "marketplace.json");
  await mkdir(path.dirname(marketplacePath), { recursive: true });
  await writeFile(marketplacePath, JSON.stringify({
    name: "personal-tools",
    interface: { displayName: "Personal Tools" },
    plugins: [{ name: "existing", source: { source: "local", path: "./plugins/existing" } }],
  }));

  const result = await installGlobal({ sourcePluginDir, homeDir, activate: false });
  const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));

  assert.equal(result.marketplaceName, "personal-tools");
  assert.equal(marketplace.plugins[0].name, "existing");
  assert.equal(marketplace.plugins[1].name, "hehehe");
  assert.equal(marketplace.plugins[1].policy.installation, "AVAILABLE");
  assert.equal(JSON.parse(await readFile(path.join(result.targetPluginDir, ".codex-plugin", "plugin.json"), "utf8")).version, "0.3.1");
});

test("reinstall replaces stale plugin files", async () => {
  const homeDir = await temporaryDirectory("hehehe-reinstall-");
  const targetPluginDir = path.join(homeDir, "plugins", "hehehe");
  await mkdir(targetPluginDir, { recursive: true });
  await writeFile(path.join(targetPluginDir, "stale.txt"), "stale");

  await installGlobal({ sourcePluginDir, homeDir, activate: false });

  await assert.rejects(readFile(path.join(targetPluginDir, "stale.txt")), { code: "ENOENT" });
});

test("project install is project-local and installed by default", async () => {
  const projectDir = await temporaryDirectory("hehehe-project-");
  const result = await installProject({ sourcePluginDir, projectDir });
  const marketplace = JSON.parse(await readFile(result.marketplacePath, "utf8"));

  assert.equal(result.scope, "project");
  assert.equal(result.activated, false);
  assert.equal(marketplace.plugins[0].source.path, "./plugins/hehehe");
  assert.equal(marketplace.plugins[0].policy.installation, "INSTALLED_BY_DEFAULT");
});

test("dry run validates and reports paths without writing", async () => {
  const projectDir = await temporaryDirectory("hehehe-dry-run-");
  const result = await installProject({ sourcePluginDir, projectDir, dryRun: true });

  assert.equal(result.dryRun, true);
  await assert.rejects(readFile(result.marketplacePath), { code: "ENOENT" });
});

test("dry run rejects installing a plugin onto its source", async () => {
  await assert.rejects(
    installProject({ sourcePluginDir, projectDir: packageRoot, dryRun: true }),
    /Source and target plugin directories are the same/,
  );
});

test("invalid existing marketplace is rejected instead of overwritten", async () => {
  const projectDir = await temporaryDirectory("hehehe-invalid-marketplace-");
  const marketplacePath = path.join(projectDir, ".agents", "plugins", "marketplace.json");
  await mkdir(path.dirname(marketplacePath), { recursive: true });
  await writeFile(marketplacePath, "{not-json");

  await assert.rejects(
    installProject({ sourcePluginDir, projectDir }),
    /Existing marketplace JSON is invalid/,
  );
  assert.equal(await readFile(marketplacePath, "utf8"), "{not-json");
});

test("project uninstall preserves unrelated marketplace entries", async () => {
  const projectDir = await temporaryDirectory("hehehe-uninstall-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const marketplace = JSON.parse(await readFile(installed.marketplacePath, "utf8"));
  marketplace.plugins.unshift({ name: "existing", source: { source: "local", path: "./plugins/existing" } });
  await writeFile(installed.marketplacePath, JSON.stringify(marketplace));

  await uninstallProject({ projectDir });

  const updatedMarketplace = JSON.parse(await readFile(installed.marketplacePath, "utf8"));
  assert.deepEqual(updatedMarketplace.plugins.map((plugin) => plugin.name), ["existing"]);
  await assert.rejects(readFile(path.join(installed.targetPluginDir, ".codex-plugin", "plugin.json")), { code: "ENOENT" });
});
