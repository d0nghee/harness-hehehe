import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
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

function terminatedProcessId() {
  const child = spawnSync(process.execPath, ["-e", ""]);
  assert.equal(child.status, 0, child.stderr?.toString());
  assert.ok(Number.isSafeInteger(child.pid) && child.pid > 0);
  return child.pid;
}

test.after(async () => {
  await Promise.all(temporaryRoots.map((directory) => rm(directory, { recursive: true, force: true })));
});

test("package and plugin versions stay in sync", async () => {
  const packageJson = JSON.parse(await readFile(path.join(packageRoot, "package.json"), "utf8"));
  const pluginManifest = JSON.parse(
    await readFile(path.join(sourcePluginDir, ".codex-plugin", "plugin.json"), "utf8"),
  );

  assert.equal(pluginManifest.version, packageJson.version);
});

test("skill catalog matches every bundled skill directory", async () => {
  const catalog = JSON.parse(
    await readFile(path.join(sourcePluginDir, "skill-catalog.json"), "utf8"),
  );
  const skillDirectories = (await readdir(path.join(sourcePluginDir, "skills"), {
    withFileTypes: true,
  }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(catalog.skills, skillDirectories);
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
  const sourceManifest = JSON.parse(await readFile(path.join(sourcePluginDir, ".codex-plugin", "plugin.json"), "utf8"));
  const installedManifest = JSON.parse(await readFile(path.join(result.targetPluginDir, ".codex-plugin", "plugin.json"), "utf8"));

  assert.equal(result.marketplaceName, "personal-tools");
  assert.equal(marketplace.plugins[0].name, "existing");
  assert.equal(marketplace.plugins[1].name, "hehehe");
  assert.equal(marketplace.plugins[1].policy.installation, "AVAILABLE");
  assert.equal(installedManifest.version, sourceManifest.version);
});

test("reinstall replaces stale plugin files", async () => {
  const homeDir = await temporaryDirectory("hehehe-reinstall-");
  const targetPluginDir = path.join(homeDir, "plugins", "hehehe");
  await installGlobal({ sourcePluginDir, homeDir, activate: false });
  await writeFile(path.join(targetPluginDir, "stale.txt"), "stale");

  await installGlobal({ sourcePluginDir, homeDir, activate: false });

  await assert.rejects(readFile(path.join(targetPluginDir, "stale.txt")), { code: "ENOENT" });
});

test("project install exposes namespaced repo skills without plugin activation", async () => {
  const projectDir = await temporaryDirectory("hehehe-project-");
  const result = await installProject({ sourcePluginDir, projectDir });
  const state = JSON.parse(await readFile(result.statePath, "utf8"));
  const reviewSkill = await readFile(
    path.join(result.targetSkillsDir, "hehehe-review", "SKILL.md"),
    "utf8",
  );

  assert.equal(result.scope, "project");
  assert.equal(result.activated, false);
  assert.match(reviewSkill, /^name: hehehe:review$/m);
  assert.equal(state.plugin, "hehehe");
  assert.equal(state.status, "installed");
  assert.deepEqual(
    state.skillDirectories,
    result.installedSkills.map((skillName) => skillName.replace("hehehe:", "hehehe-")),
  );
  await readFile(
    path.join(result.targetSkillsDir, "hehehe-doctor", "scripts", "doctor.mjs"),
    "utf8",
  );
  await readFile(
    path.join(result.targetSkillsDir, "hehehe-resume", "templates", "done-criteria.md"),
    "utf8",
  );
  await readFile(
    path.join(result.targetSkillsDir, "hehehe-doctor", "skill-catalog.json"),
    "utf8",
  );
  await assert.rejects(readFile(result.marketplacePath), { code: "ENOENT" });
  await assert.rejects(
    readFile(path.join(result.targetPluginDir, ".codex-plugin", "plugin.json")),
    { code: "ENOENT" },
  );
});

test("project-scoped doctor recognizes the repo-skill installation", async () => {
  const projectDir = await temporaryDirectory("hehehe-project-doctor-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const doctorScript = path.join(
    installed.targetSkillsDir,
    "hehehe-doctor",
    "scripts",
    "doctor.mjs",
  );
  const doctor = spawnSync(
    process.execPath,
    [doctorScript, "--project", projectDir, "--json"],
    { encoding: "utf8" },
  );

  assert.equal(doctor.status, 0, doctor.stderr);
  const report = JSON.parse(doctor.stdout);
  assert.notEqual(report.status, "BLOCKED");
  assert.equal(
    report.checks.find((check) => check.id === "project-skills")?.status,
    "PASS",
  );
});

test("project-scoped doctor blocks when any managed skill is missing", async () => {
  const projectDir = await temporaryDirectory("hehehe-project-doctor-missing-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const state = JSON.parse(await readFile(installed.statePath, "utf8"));
  state.skillDirectories = state.skillDirectories.filter(
    (directory) => directory !== "hehehe-review",
  );
  await writeFile(installed.statePath, JSON.stringify(state));
  await rm(path.join(installed.targetSkillsDir, "hehehe-review"), {
    recursive: true,
    force: true,
  });
  const doctorScript = path.join(
    installed.targetSkillsDir,
    "hehehe-doctor",
    "scripts",
    "doctor.mjs",
  );
  const doctor = spawnSync(
    process.execPath,
    [doctorScript, "--project", projectDir, "--json"],
    { encoding: "utf8" },
  );

  assert.equal(doctor.status, 2, doctor.stderr);
  const report = JSON.parse(doctor.stdout);
  assert.equal(report.status, "BLOCKED");
  assert.match(
    report.checks.find((check) => check.id === "project-skills")?.summary ?? "",
    /hehehe-review/,
  );
});

test("project-scoped doctor blocks malformed skill frontmatter", async () => {
  const projectDir = await temporaryDirectory("hehehe-project-doctor-frontmatter-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  await writeFile(
    path.join(installed.targetSkillsDir, "hehehe-review", "SKILL.md"),
    "---\nname: hehehe:review\n---\n",
  );
  const doctor = spawnSync(
    process.execPath,
    [
      path.join(installed.targetSkillsDir, "hehehe-doctor", "scripts", "doctor.mjs"),
      "--project",
      projectDir,
      "--json",
    ],
    { encoding: "utf8" },
  );

  assert.equal(doctor.status, 2, doctor.stderr);
  assert.match(doctor.stdout, /description is missing or empty/);
});

test("global doctor validates every skill in the catalog", async () => {
  const homeDir = await temporaryDirectory("hehehe-global-doctor-");
  const installed = await installGlobal({ sourcePluginDir, homeDir, activate: false });
  await rm(path.join(installed.targetPluginDir, "skills", "review"), {
    recursive: true,
    force: true,
  });
  const doctor = spawnSync(
    process.execPath,
    [
      path.join(installed.targetPluginDir, "skills", "doctor", "scripts", "doctor.mjs"),
      "--project",
      homeDir,
      "--json",
    ],
    { encoding: "utf8" },
  );

  assert.equal(doctor.status, 2, doctor.stderr);
  assert.match(doctor.stdout, /review \(missing\)/);
});

test("project-scoped resume uses the complete bundled done-criteria template", async () => {
  const projectDir = await temporaryDirectory("hehehe-project-resume-");
  const foreignTemplate = path.join(
    projectDir,
    ".agents",
    "templates",
    "done-criteria.md",
  );
  await mkdir(path.dirname(foreignTemplate), { recursive: true });
  await writeFile(foreignTemplate, "# FOREIGN TEMPLATE\n");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const runStateScript = path.join(
    installed.targetSkillsDir,
    "hehehe-resume",
    "scripts",
    "run-state.mjs",
  );
  const initialized = spawnSync(
    process.execPath,
    [
      runStateScript,
      "init",
      "--project",
      projectDir,
      "--goal",
      "Verify project templates",
      "--run-id",
      "template-verification",
      "--json",
    ],
    { encoding: "utf8" },
  );

  assert.equal(initialized.status, 0, initialized.stderr);
  const doneCriteria = await readFile(
    path.join(
      projectDir,
      ".hehehe",
      "runs",
      "template-verification",
      "done-criteria.md",
    ),
    "utf8",
  );
  for (const heading of [
    "## Goal",
    "## Expected Behavior",
    "## In Scope",
    "## Out of Scope",
    "## Verification",
    "## Risks",
  ]) {
    assert.match(doneCriteria, new RegExp(`^${heading}$`, "m"));
  }
  assert.doesNotMatch(doneCriteria, /FOREIGN TEMPLATE/);
});

test("dry run validates and reports paths without writing", async () => {
  const projectDir = await temporaryDirectory("hehehe-dry-run-");
  const result = await installProject({ sourcePluginDir, projectDir, dryRun: true });

  assert.equal(result.dryRun, true);
  await assert.rejects(readFile(result.marketplacePath), { code: "ENOENT" });
  await assert.rejects(readdir(path.join(projectDir, ".agents")), { code: "ENOENT" });
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

test("project install rejects a bundle that differs from the skill catalog", async () => {
  const sourceRoot = await temporaryDirectory("hehehe-invalid-bundle-");
  const invalidSource = path.join(sourceRoot, "hehehe");
  const projectDir = await temporaryDirectory("hehehe-invalid-bundle-project-");
  await cp(sourcePluginDir, invalidSource, { recursive: true });
  await rm(path.join(invalidSource, "skills", "review"), { recursive: true, force: true });

  await assert.rejects(
    installProject({ sourcePluginDir: invalidSource, projectDir }),
    /missing: review/,
  );
});

test("an interrupted project install is resumable without claiming skills are unmanaged", async () => {
  const sourceRoot = await temporaryDirectory("hehehe-interrupted-bundle-");
  const interruptedSource = path.join(sourceRoot, "hehehe");
  const projectDir = await temporaryDirectory("hehehe-interrupted-project-");
  await cp(sourcePluginDir, interruptedSource, { recursive: true });
  const blocker = path.join(interruptedSource, "skills", "resume", "templates");
  await writeFile(blocker, "blocks the bundled template directory");

  await assert.rejects(
    installProject({ sourcePluginDir: interruptedSource, projectDir }),
    /rerun the same install command to resume/,
  );

  const statePath = path.join(projectDir, ".agents", "skills", ".hehehe-installed.json");
  await assert.rejects(readFile(statePath, "utf8"), { code: "ENOENT" });
  const journalDirectory = path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    "journals",
  );
  assert.equal(
    (await readdir(journalDirectory)).filter((name) => name.endsWith(".json")).length,
    1,
  );
  assert.equal(
    (await readdir(path.join(projectDir, ".agents", "skills"))).some(
      (name) => name.includes(".install-") || name.includes(".backup-"),
    ),
    false,
  );
  await readFile(
    path.join(projectDir, ".agents", "skills", "hehehe-full-resolve", "SKILL.md"),
    "utf8",
  );
  const interruptedDoctor = spawnSync(
    process.execPath,
    [
      path.join(
        projectDir,
        ".agents",
        "skills",
        "hehehe-doctor",
        "scripts",
        "doctor.mjs",
      ),
      "--project",
      projectDir,
      "--json",
    ],
    { encoding: "utf8" },
  );
  assert.equal(interruptedDoctor.status, 2, interruptedDoctor.stderr);
  assert.match(interruptedDoctor.stdout, /installation was interrupted/);

  await rm(blocker, { force: true });
  const installed = await installProject({
    sourcePluginDir: interruptedSource,
    projectDir,
  });
  const completedState = JSON.parse(await readFile(installed.statePath, "utf8"));
  const catalog = JSON.parse(
    await readFile(path.join(interruptedSource, "skill-catalog.json"), "utf8"),
  );
  assert.equal(completedState.status, "installed");
  assert.equal(completedState.skillDirectories.length, catalog.skills.length);
  assert.equal((await readdir(journalDirectory)).filter((name) => name.endsWith(".json")).length, 0);
  await readFile(
    path.join(installed.targetSkillsDir, "hehehe-resume", "templates", "done-criteria.md"),
    "utf8",
  );
});

test("project reinstall removes stale managed skills", async () => {
  const projectDir = await temporaryDirectory("hehehe-stale-skill-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const staleDirectory = path.join(installed.targetSkillsDir, "hehehe-removed");
  await mkdir(staleDirectory, { recursive: true });
  await writeFile(
    path.join(staleDirectory, "SKILL.md"),
    "---\nname: hehehe:removed\ndescription: stale\n---\n",
  );
  const state = JSON.parse(await readFile(installed.statePath, "utf8"));
  state.skillDirectories.push("hehehe-removed");
  await writeFile(installed.statePath, JSON.stringify(state));

  await installProject({ sourcePluginDir, projectDir });

  await assert.rejects(readFile(path.join(staleDirectory, "SKILL.md")), { code: "ENOENT" });
});

test("project reinstall validates every stale target before replacing current skills", async () => {
  const projectDir = await temporaryDirectory("hehehe-invalid-stale-skill-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const reviewMarker = path.join(installed.targetSkillsDir, "hehehe-review", "user-marker.txt");
  const staleFile = path.join(installed.targetSkillsDir, "hehehe-invalid-stale");
  await writeFile(reviewMarker, "preserve on failed preflight");
  await writeFile(staleFile, "not a directory");
  const state = JSON.parse(await readFile(installed.statePath, "utf8"));
  state.skillDirectories.push("hehehe-invalid-stale");
  await writeFile(installed.statePath, JSON.stringify(state));

  await assert.rejects(
    installProject({ sourcePluginDir, projectDir }),
    /Stale managed project skill target is not a directory/,
  );

  assert.equal(await readFile(reviewMarker, "utf8"), "preserve on failed preflight");
});

test("project install refuses to overwrite an unmanaged namespaced skill", async () => {
  const projectDir = await temporaryDirectory("hehehe-skill-collision-");
  const existingSkill = path.join(
    projectDir,
    ".agents",
    "skills",
    "hehehe-review",
    "SKILL.md",
  );
  const original = "---\nname: hehehe:review\ndescription: user-owned\n---\n";
  await mkdir(path.dirname(existingSkill), { recursive: true });
  await writeFile(existingSkill, original);

  await assert.rejects(
    installProject({ sourcePluginDir, projectDir, dryRun: true }),
    /not managed by hehehe/,
  );
  await assert.rejects(
    installProject({ sourcePluginDir, projectDir }),
    /not managed by hehehe/,
  );

  assert.equal(await readFile(existingSkill, "utf8"), original);
  await assert.rejects(
    readFile(path.join(projectDir, ".agents", "skills", ".hehehe-installed.json")),
    { code: "ENOENT" },
  );
});

test("project operations reject an active installer lock", async () => {
  const projectDir = await temporaryDirectory("hehehe-active-lock-");
  const lockDirectory = path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    "lock",
  );
  await mkdir(lockDirectory, { recursive: true });
  await writeFile(path.join(lockDirectory, "owner.json"), JSON.stringify({
    schemaVersion: 1,
    plugin: "hehehe",
    operation: "install",
    pid: process.pid,
    token: "00000000-0000-4000-8000-000000000001",
    startedAt: new Date().toISOString(),
  }));

  await assert.rejects(
    installProject({ sourcePluginDir, projectDir }),
    /already in progress/,
  );
});

test("project operations recover an abandoned installer lock", async () => {
  const projectDir = await temporaryDirectory("hehehe-stale-lock-");
  const token = "00000000-0000-4000-8000-000000000002";
  const lockDirectory = path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    "lock",
  );
  await mkdir(lockDirectory, { recursive: true });
  await writeFile(path.join(lockDirectory, "owner.json"), JSON.stringify({
    schemaVersion: 1,
    plugin: "hehehe",
    operation: "install",
    pid: terminatedProcessId(),
    token,
    startedAt: new Date(Date.now() - 60_000).toISOString(),
  }));
  const staleTime = new Date(Date.now() - 60_000);
  await utimes(lockDirectory, staleTime, staleTime);

  const installed = await installProject({ sourcePluginDir, projectDir });

  await readFile(path.join(installed.targetSkillsDir, "hehehe-review", "SKILL.md"), "utf8");
  await assert.rejects(readFile(path.join(lockDirectory, "owner.json")), { code: "ENOENT" });
  const retiredOwner = JSON.parse(await readFile(path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    `lock.recovered-${token}`,
    "owner.json",
  )));
  assert.equal(retiredOwner.token, token);
});

test("project operations preserve an abandoned lock with invalid metadata", async () => {
  const projectDir = await temporaryDirectory("hehehe-invalid-lock-");
  const lockDirectory = path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    "lock",
  );
  const ownerPath = path.join(lockDirectory, "owner.json");
  await mkdir(lockDirectory, { recursive: true });
  await writeFile(ownerPath, "{}");
  const staleTime = new Date(Date.now() - 60_000);
  await utimes(lockDirectory, staleTime, staleTime);

  await assert.rejects(
    installProject({ sourcePluginDir, projectDir }),
    /lock metadata is invalid/,
  );
  assert.equal(await readFile(ownerPath, "utf8"), "{}");
});

test("project operations resume after a stale recovery process exits", async () => {
  const projectDir = await temporaryDirectory("hehehe-stale-recovery-");
  const token = "00000000-0000-4000-8000-000000000004";
  const lockDirectory = path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    "lock",
  );
  await mkdir(path.join(lockDirectory, `.recovery-${token}`), { recursive: true });
  await writeFile(path.join(lockDirectory, "owner.json"), JSON.stringify({
    schemaVersion: 1,
    plugin: "hehehe",
    operation: "install",
    pid: terminatedProcessId(),
    token,
    startedAt: new Date(Date.now() - 60_000).toISOString(),
  }));

  const installed = await installProject({ sourcePluginDir, projectDir });

  await readFile(path.join(installed.targetSkillsDir, "hehehe-review", "SKILL.md"), "utf8");
  await assert.rejects(readFile(path.join(lockDirectory, "owner.json")), { code: "ENOENT" });
  await readFile(path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    `lock.recovered-${token}`,
    "owner.json",
  ));
});

test("concurrent recovery never removes a replacement project lock", async () => {
  const projectDir = await temporaryDirectory("hehehe-concurrent-lock-");
  const lockDirectory = path.join(
    projectDir,
    ".agents",
    ".hehehe-installer",
    "lock",
  );
  await mkdir(lockDirectory, { recursive: true });
  await writeFile(path.join(lockDirectory, "owner.json"), JSON.stringify({
    schemaVersion: 1,
    plugin: "hehehe",
    operation: "install",
    pid: terminatedProcessId(),
    token: "00000000-0000-4000-8000-000000000003",
    startedAt: new Date(Date.now() - 60_000).toISOString(),
  }));

  const results = await Promise.allSettled(
    Array.from({ length: 8 }, () => installProject({ sourcePluginDir, projectDir })),
  );
  assert.ok(results.some((result) => result.status === "fulfilled"));
  for (const result of results) {
    if (result.status === "rejected") {
      assert.match(
        result.reason.message,
        /already in progress|acquiring the installer lock|Could not acquire/,
      );
    }
  }

  await readFile(
    path.join(projectDir, ".agents", "skills", "hehehe-review", "SKILL.md"),
    "utf8",
  );
  await assert.rejects(readFile(path.join(lockDirectory, "owner.json")), { code: "ENOENT" });
});

test("project install rejects a skills root that resolves outside the project", async () => {
  const projectDir = await temporaryDirectory("hehehe-junction-project-");
  const outsideDir = await temporaryDirectory("hehehe-junction-outside-");
  await symlink(outsideDir, path.join(projectDir, ".agents"), "junction");

  await assert.rejects(
    installProject({ sourcePluginDir, projectDir }),
    /symbolic link or junction/,
  );

  await assert.rejects(
    readFile(path.join(outsideDir, "skills", "hehehe-review", "SKILL.md")),
    { code: "ENOENT" },
  );
});

test("project install migrates the legacy marketplace plugin without touching other entries", async () => {
  const projectDir = await temporaryDirectory("hehehe-uninstall-");
  const marketplacePath = path.join(projectDir, ".agents", "plugins", "marketplace.json");
  const legacyPluginDir = path.join(projectDir, "plugins", "hehehe");
  await mkdir(path.dirname(marketplacePath), { recursive: true });
  await mkdir(path.join(legacyPluginDir, ".codex-plugin"), { recursive: true });
  await writeFile(path.join(legacyPluginDir, "stale.txt"), "stale");
  await writeFile(
    path.join(legacyPluginDir, ".codex-plugin", "plugin.json"),
    JSON.stringify({ name: "hehehe", version: "0.3.2" }),
  );
  await writeFile(marketplacePath, JSON.stringify({
    name: "project-local",
    plugins: [
      { name: "existing", source: { source: "local", path: "./plugins/existing" } },
      {
        name: "hehehe",
        source: { source: "local", path: "./plugins/hehehe" },
        policy: {
          installation: "INSTALLED_BY_DEFAULT",
          authentication: "ON_INSTALL",
        },
        category: "Productivity",
      },
    ],
  }));

  const installed = await installProject({ sourcePluginDir, projectDir,
    confirmLegacyRemoval: (plan) => {
      assert.equal(plan.target, legacyPluginDir);
      assert.equal(plan.operation, "migration");
      return true;
    } });
  const marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));

  assert.deepEqual(marketplace.plugins.map((plugin) => plugin.name), ["existing"]);
  await assert.rejects(readFile(path.join(legacyPluginDir, "stale.txt")), { code: "ENOENT" });
  await readFile(path.join(installed.targetSkillsDir, "hehehe-review", "SKILL.md"), "utf8");
});

test("project install preserves an unrelated plugin with the same name", async () => {
  const projectDir = await temporaryDirectory("hehehe-preserve-plugin-");
  const marketplacePath = path.join(projectDir, ".agents", "plugins", "marketplace.json");
  const sameNamePluginDir = path.join(projectDir, "plugins", "hehehe");
  await mkdir(path.dirname(marketplacePath), { recursive: true });
  await mkdir(sameNamePluginDir, { recursive: true });
  await writeFile(path.join(sameNamePluginDir, "user-owned.txt"), "keep");
  const marketplace = {
    name: "project-local",
    plugins: [
      {
        name: "hehehe",
        source: { source: "git", url: "https://example.test/user/hehehe.git" },
      },
    ],
  };
  await writeFile(marketplacePath, JSON.stringify(marketplace));

  await installProject({ sourcePluginDir, projectDir });

  assert.equal(await readFile(path.join(sameNamePluginDir, "user-owned.txt"), "utf8"), "keep");
  assert.deepEqual(
    JSON.parse(await readFile(marketplacePath, "utf8")),
    marketplace,
  );
});

test("project install preserves a non-legacy local plugin entry", async () => {
  const projectDir = await temporaryDirectory("hehehe-preserve-local-plugin-");
  const marketplacePath = path.join(projectDir, ".agents", "plugins", "marketplace.json");
  const sameNamePluginDir = path.join(projectDir, "plugins", "hehehe");
  await mkdir(path.dirname(marketplacePath), { recursive: true });
  await mkdir(path.join(sameNamePluginDir, ".codex-plugin"), { recursive: true });
  await writeFile(path.join(sameNamePluginDir, "user-owned.txt"), "keep");
  await writeFile(
    path.join(sameNamePluginDir, ".codex-plugin", "plugin.json"),
    JSON.stringify({ name: "hehehe", version: "99.0.0" }),
  );
  const marketplace = {
    name: "project-local",
    plugins: [
      {
        name: "hehehe",
        source: { source: "local", path: "./plugins/hehehe" },
        policy: {
          installation: "AVAILABLE",
          authentication: "ON_INSTALL",
        },
        category: "Productivity",
      },
    ],
  };
  await writeFile(marketplacePath, JSON.stringify(marketplace));

  await installProject({ sourcePluginDir, projectDir });

  assert.equal(await readFile(path.join(sameNamePluginDir, "user-owned.txt"), "utf8"), "keep");
  assert.deepEqual(JSON.parse(await readFile(marketplacePath, "utf8")), marketplace);
});

test("project uninstall removes managed skills and preserves unrelated repo skills", async () => {
  const projectDir = await temporaryDirectory("hehehe-uninstall-");
  const unrelatedSkill = path.join(projectDir, ".agents", "skills", "existing", "SKILL.md");
  await mkdir(path.dirname(unrelatedSkill), { recursive: true });
  await writeFile(unrelatedSkill, "---\nname: existing\ndescription: existing\n---\n");
  const installed = await installProject({ sourcePluginDir, projectDir });

  await uninstallProject({ projectDir });

  assert.match(await readFile(unrelatedSkill, "utf8"), /^name: existing$/m);
  await assert.rejects(
    readFile(path.join(installed.targetSkillsDir, "hehehe-review", "SKILL.md")),
    { code: "ENOENT" },
  );
  await assert.rejects(readFile(installed.statePath), { code: "ENOENT" });
});

test("project uninstall validates every managed target before deleting any skill", async () => {
  const projectDir = await temporaryDirectory("hehehe-uninstall-invalid-target-");
  const installed = await installProject({ sourcePluginDir, projectDir });
  const invalidTarget = path.join(installed.targetSkillsDir, "hehehe-invalid-target");
  await writeFile(invalidTarget, "not a directory");
  const state = JSON.parse(await readFile(installed.statePath, "utf8"));
  state.skillDirectories = ["hehehe-review", "hehehe-invalid-target"];
  await writeFile(installed.statePath, JSON.stringify(state));

  await assert.rejects(
    uninstallProject({ projectDir, dryRun: true }),
    /Managed project skill target is not a directory/,
  );
  await assert.rejects(
    uninstallProject({ projectDir }),
    /Managed project skill target is not a directory/,
  );

  await readFile(path.join(installed.targetSkillsDir, "hehehe-review", "SKILL.md"), "utf8");
  await readFile(installed.statePath, "utf8");
});
