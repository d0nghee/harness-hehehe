import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  access,
  cp,
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const PLUGIN_NAME = "hehehe";
const MARKETPLACE_RELATIVE_PATH = path.join(".agents", "plugins", "marketplace.json");
const MARKETPLACE_PLUGIN_PATH = `./plugins/${PLUGIN_NAME}`;

function installError(message, cause) {
  return new Error(message, cause ? { cause } : undefined);
}

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}

async function assertDirectory(directoryPath, label) {
  let details;
  try {
    details = await stat(directoryPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      throw installError(`${label} does not exist: ${directoryPath}`);
    }
    throw error;
  }
  if (!details.isDirectory()) {
    throw installError(`${label} is not a directory: ${directoryPath}`);
  }
}

async function validatePluginSource(sourcePluginDir) {
  await assertDirectory(sourcePluginDir, "Bundled plugin directory");

  const sourceDetails = await lstat(sourcePluginDir);
  if (sourceDetails.isSymbolicLink()) {
    throw installError(`Bundled plugin directory must not be a symbolic link: ${sourcePluginDir}`);
  }

  const manifestPath = path.join(sourcePluginDir, ".codex-plugin", "plugin.json");
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    throw installError(`Bundled plugin manifest is invalid: ${manifestPath}`, error);
  }

  if (manifest.name !== PLUGIN_NAME || typeof manifest.version !== "string" || !manifest.version) {
    throw installError(`Bundled plugin manifest must declare name "${PLUGIN_NAME}" and a version.`);
  }

  return manifest;
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "project";
}

async function readMarketplace(marketplacePath, defaults) {
  if (!(await exists(marketplacePath))) {
    return { ...defaults, plugins: [] };
  }

  let marketplace;
  try {
    marketplace = JSON.parse(await readFile(marketplacePath, "utf8"));
  } catch (error) {
    throw installError(`Existing marketplace JSON is invalid: ${marketplacePath}`, error);
  }

  if (!marketplace || typeof marketplace !== "object" || Array.isArray(marketplace)) {
    throw installError(`Existing marketplace must be a JSON object: ${marketplacePath}`);
  }
  if (!Array.isArray(marketplace.plugins)) {
    throw installError(`Existing marketplace must contain a plugins array: ${marketplacePath}`);
  }
  if (typeof marketplace.name !== "string" || !/^[a-z0-9-]+$/.test(marketplace.name)) {
    throw installError(`Existing marketplace has an invalid name: ${marketplacePath}`);
  }

  return marketplace;
}

function withPlugin(marketplace, installationPolicy) {
  const pluginEntry = {
    name: PLUGIN_NAME,
    source: {
      source: "local",
      path: MARKETPLACE_PLUGIN_PATH,
    },
    policy: {
      installation: installationPolicy,
      authentication: "ON_INSTALL",
    },
    category: "Productivity",
  };

  const index = marketplace.plugins.findIndex((plugin) => plugin?.name === PLUGIN_NAME);
  const plugins = [...marketplace.plugins];
  if (index === -1) {
    plugins.push(pluginEntry);
  } else {
    plugins[index] = pluginEntry;
  }
  return { ...marketplace, plugins };
}

async function replacePath(sourcePath, targetPath) {
  const sourceRealPath = await realpath(sourcePath);
  if (await exists(targetPath)) {
    const targetDetails = await lstat(targetPath);
    if (targetDetails.isSymbolicLink()) {
      throw installError(`Refusing to replace symbolic-link target: ${targetPath}`);
    }
    if ((await realpath(targetPath)) === sourceRealPath) {
      throw installError(`Source and target plugin directories are the same: ${targetPath}`);
    }
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  const nonce = `${process.pid}-${randomUUID()}`;
  const stagingPath = `${targetPath}.install-${nonce}`;
  const backupPath = `${targetPath}.backup-${nonce}`;
  let backupCreated = false;

  try {
    await cp(sourcePath, stagingPath, { recursive: true, errorOnExist: true });
    if (await exists(targetPath)) {
      await rename(targetPath, backupPath);
      backupCreated = true;
    }
    await rename(stagingPath, targetPath);
    if (backupCreated) {
      await rm(backupPath, { recursive: true, force: true });
    }
  } catch (error) {
    await rm(stagingPath, { recursive: true, force: true });
    if (backupCreated && !(await exists(targetPath))) {
      await rename(backupPath, targetPath);
      backupCreated = false;
    }
    throw installError(`Could not install plugin at ${targetPath}`, error);
  } finally {
    if (backupCreated && (await exists(backupPath))) {
      await rm(backupPath, { recursive: true, force: true });
    }
  }
}

async function assertDistinctSourceAndTarget(sourcePath, targetPath) {
  if ((await exists(targetPath)) && (await realpath(targetPath)) === (await realpath(sourcePath))) {
    throw installError(`Source and target plugin directories are the same: ${targetPath}`);
  }
}

async function writeJsonAtomically(targetPath, value) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  const nonce = `${process.pid}-${randomUUID()}`;
  const temporaryPath = `${targetPath}.write-${nonce}`;
  const backupPath = `${targetPath}.backup-${nonce}`;
  let backupCreated = false;

  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
    if (await exists(targetPath)) {
      await rename(targetPath, backupPath);
      backupCreated = true;
    }
    await rename(temporaryPath, targetPath);
    if (backupCreated) {
      await rm(backupPath, { force: true });
    }
  } catch (error) {
    await rm(temporaryPath, { force: true });
    if (backupCreated && !(await exists(targetPath))) {
      await rename(backupPath, targetPath);
      backupCreated = false;
    }
    throw installError(`Could not update marketplace at ${targetPath}`, error);
  } finally {
    if (backupCreated && (await exists(backupPath))) {
      await rm(backupPath, { force: true });
    }
  }
}

function runCodexPluginCommand(action, marketplaceName) {
  if (!/^[a-z0-9-]+$/.test(marketplaceName)) {
    throw installError(`Cannot activate plugin from invalid marketplace name: ${marketplaceName}`);
  }

  const selector = `${PLUGIN_NAME}@${marketplaceName}`;
  const result = process.platform === "win32"
    ? spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `codex plugin ${action} ${selector}`], {
        encoding: "utf8",
      })
    : spawnSync("codex", ["plugin", action, selector], { encoding: "utf8" });

  if (result.error) {
    throw installError(`Codex plugin ${action} failed. Run: codex plugin ${action} ${selector}`, result.error);
  }
  if (result.status !== 0) {
    const details = (result.stderr || result.stdout || "unknown Codex CLI error").trim();
    throw installError(`Codex plugin ${action} failed (${details}). Run: codex plugin ${action} ${selector}`);
  }
}

async function install({ sourcePluginDir, rootDir, scope, dryRun = false, activate = true }) {
  const manifest = await validatePluginSource(sourcePluginDir);
  await assertDirectory(rootDir, scope === "global" ? "User home directory" : "Project directory");

  const targetPluginDir = path.join(rootDir, "plugins", PLUGIN_NAME);
  const marketplacePath = path.join(rootDir, MARKETPLACE_RELATIVE_PATH);
  await assertDistinctSourceAndTarget(sourcePluginDir, targetPluginDir);
  const projectName = path.basename(path.resolve(rootDir));
  const defaults = scope === "global"
    ? {
        name: "user-local",
        interface: { displayName: "User Local Plugins" },
      }
    : {
        name: `${slugify(projectName)}-local`,
        interface: { displayName: `${projectName} Local Plugins` },
      };
  const installationPolicy = scope === "global" ? "AVAILABLE" : "INSTALLED_BY_DEFAULT";
  const marketplace = withPlugin(await readMarketplace(marketplacePath, defaults), installationPolicy);

  const result = {
    scope,
    dryRun,
    version: manifest.version,
    sourcePluginDir,
    targetPluginDir,
    marketplacePath,
    marketplaceName: marketplace.name,
    activated: false,
  };

  if (dryRun) {
    return result;
  }

  await replacePath(sourcePluginDir, targetPluginDir);
  await writeJsonAtomically(marketplacePath, marketplace);
  if (scope === "global" && activate) {
    runCodexPluginCommand("add", marketplace.name);
    result.activated = true;
  }
  return result;
}

export async function installGlobal({ sourcePluginDir, homeDir = os.homedir(), dryRun = false, activate = true }) {
  return install({ sourcePluginDir, rootDir: path.resolve(homeDir), scope: "global", dryRun, activate });
}

export async function installProject({ sourcePluginDir, projectDir = process.cwd(), dryRun = false }) {
  return install({ sourcePluginDir, rootDir: path.resolve(projectDir), scope: "project", dryRun, activate: false });
}

async function uninstall({ rootDir, scope, dryRun = false, deactivate = true }) {
  await assertDirectory(rootDir, scope === "global" ? "User home directory" : "Project directory");
  const targetPluginDir = path.join(rootDir, "plugins", PLUGIN_NAME);
  const marketplacePath = path.join(rootDir, MARKETPLACE_RELATIVE_PATH);
  let marketplace;
  let marketplaceChanged = false;

  if (await exists(marketplacePath)) {
    marketplace = await readMarketplace(marketplacePath, {});
    const plugins = marketplace.plugins.filter((plugin) => plugin?.name !== PLUGIN_NAME);
    marketplaceChanged = plugins.length !== marketplace.plugins.length;
    marketplace = { ...marketplace, plugins };
  }

  if (await exists(targetPluginDir)) {
    const targetDetails = await lstat(targetPluginDir);
    if (targetDetails.isSymbolicLink()) {
      throw installError(`Refusing to remove symbolic-link target: ${targetPluginDir}`);
    }
  }

  const result = {
    scope,
    dryRun,
    targetPluginDir,
    marketplacePath,
    marketplaceName: marketplace?.name,
    deactivated: false,
  };
  if (dryRun) {
    return result;
  }

  if (scope === "global" && deactivate && marketplaceChanged) {
    runCodexPluginCommand("remove", marketplace.name);
    result.deactivated = true;
  }
  await rm(targetPluginDir, { recursive: true, force: true });
  if (marketplaceChanged) {
    await writeJsonAtomically(marketplacePath, marketplace);
  }
  return result;
}

export async function uninstallGlobal({ homeDir = os.homedir(), dryRun = false, deactivate = true } = {}) {
  return uninstall({ rootDir: path.resolve(homeDir), scope: "global", dryRun, deactivate });
}

export async function uninstallProject({ projectDir = process.cwd(), dryRun = false } = {}) {
  return uninstall({ rootDir: path.resolve(projectDir), scope: "project", dryRun, deactivate: false });
}
