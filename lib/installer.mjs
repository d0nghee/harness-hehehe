import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import {
  access,
  cp,
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rename,
  rm,
  rmdir,
  stat,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PLUGIN_NAME = "hehehe";
const MARKETPLACE_RELATIVE_PATH = path.join(".agents", "plugins", "marketplace.json");
const MARKETPLACE_PLUGIN_PATH = `./plugins/${PLUGIN_NAME}`;
const PROJECT_SKILLS_RELATIVE_PATH = path.join(".agents", "skills");
const PROJECT_INSTALL_STATE = ".hehehe-installed.json";
const PROJECT_INSTALLER_RELATIVE_PATH = path.join(".agents", ".hehehe-installer");
const TRANSACTION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const PROJECT_LOCK_STALE_AFTER_MS = 5_000;
const GLOBAL_INSTALL_MARKER = path.join(".codex-plugin", "hehehe-installation.json");
const bundledPluginDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../plugins/hehehe");

function isManagedGlobalEntry(entry) {
  return entry?.name === PLUGIN_NAME && entry?.source?.source === "local"
    && entry?.source?.path === MARKETPLACE_PLUGIN_PATH
    && entry?.policy?.installation === "AVAILABLE"
    && entry?.policy?.authentication === "ON_INSTALL"
    && entry?.category === "Productivity";
}

async function globalPayloadPaths(directory, relative = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    const name = path.join(relative, entry.name);
    if (entry.name.toLowerCase() === ".git" || entry.isSymbolicLink()
      || (!entry.isDirectory() && !entry.isFile())) {
      throw installError(`Refusing unsafe global plugin contents: ${child}`);
    }
    files.push(name);
    if (entry.isDirectory()) files.push(...await globalPayloadPaths(child, name));
  }
  return files;
}

// This is installation ownership, not authentication against the same filesystem user.
async function globalOwnership(rootDir, targetPluginDir, marketplacePath, marketplace, referenceDir = bundledPluginDir) {
  await assertProjectPathSafe(rootDir, targetPluginDir, "global plugin target");
  await assertProjectPathSafe(rootDir, marketplacePath, "global marketplace");
  const entries = marketplace?.plugins.filter((entry) => entry?.name === PLUGIN_NAME) ?? [];
  if (entries.length > 1 || entries.some((entry) => !isManagedGlobalEntry(entry))) {
    throw installError("Refusing to change an unmanaged or ambiguous hehehe marketplace entry");
  }
  const details = await lstatIfExists(targetPluginDir);
  if (!details) return "absent";
  if (!details.isDirectory()) throw installError(`Global plugin target is not a directory: ${targetPluginDir}`);

  // Never replace/remove a checkout, linked child, or special file, even with a marker.
  const files = await globalPayloadPaths(targetPluginDir);
  const markerPath = path.join(targetPluginDir, GLOBAL_INSTALL_MARKER);
  if (await lstatIfExists(markerPath)) {
    let marker;
    try { marker = JSON.parse(await readFile(markerPath, "utf8")); }
    catch (error) { throw installError(`Invalid global installation ownership marker: ${markerPath}`, error); }
    if (marker?.schemaVersion !== 1 || marker?.plugin !== PLUGIN_NAME
      || marker?.target !== await realpath(targetPluginDir)) {
      throw installError(`Invalid global installation ownership marker: ${markerPath}`);
    }
    return "managed";
  }
  // Older releases had no marker. Require the original exact registration, a
  // valid plugin/catalog, and no paths outside the distributed payload layout.
  if (entries.length === 1) {
    await validatePluginSource(targetPluginDir);
    validateBundledSkillCatalog(await inspectBundledSkills(targetPluginDir), await readSkillCatalog(targetPluginDir));
    const knownPaths = new Set(await globalPayloadPaths(referenceDir));
    if (files.every((file) => knownPaths.has(file))) return "legacy";
  }
  throw installError(`Refusing to change unmanaged global plugin directory: ${targetPluginDir}`);
}

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

async function lstatIfExists(targetPath) {
  try {
    return await lstat(targetPath);
  } catch (error) {
    if (error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function isInsideOrSame(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === ""
    || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

async function assertProjectPathSafe(projectDir, targetPath, label) {
  const resolvedProject = path.resolve(projectDir);
  const resolvedTarget = path.resolve(targetPath);
  const relativeTarget = path.relative(resolvedProject, resolvedTarget);
  if (
    relativeTarget === ".."
    || relativeTarget.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativeTarget)
  ) {
    throw installError(`${label} must stay inside the project directory: ${resolvedTarget}`);
  }

  const realProject = await realpath(resolvedProject);
  const segments = relativeTarget ? relativeTarget.split(path.sep) : [];
  let currentPath = resolvedProject;
  for (let index = 0; index < segments.length; index += 1) {
    currentPath = path.join(currentPath, segments[index]);
    const details = await lstatIfExists(currentPath);
    if (!details) {
      break;
    }
    if (details.isSymbolicLink()) {
      throw installError(`Refusing ${label} through a symbolic link or junction: ${currentPath}`);
    }
    if (index < segments.length - 1 && !details.isDirectory()) {
      throw installError(`${label} has a non-directory parent: ${currentPath}`);
    }
    if (!isInsideOrSame(realProject, await realpath(currentPath))) {
      throw installError(`${label} resolves outside the project directory: ${currentPath}`);
    }
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

async function replacePath(sourcePath, targetPath, prepare = null, transactionDirectory = null) {
  const sourceRealPath = await realpath(sourcePath);
  const existingTarget = await lstatIfExists(targetPath);
  if (existingTarget) {
    const targetDetails = existingTarget;
    if (targetDetails.isSymbolicLink()) {
      throw installError(`Refusing to replace symbolic-link target: ${targetPath}`);
    }
    if ((await realpath(targetPath)) === sourceRealPath) {
      throw installError(`Source and target plugin directories are the same: ${targetPath}`);
    }
  }

  await mkdir(path.dirname(targetPath), { recursive: true });
  const nonce = `${process.pid}-${randomUUID()}`;
  if (transactionDirectory) {
    await mkdir(transactionDirectory, { recursive: true });
  }
  const stagingPath = transactionDirectory
    ? path.join(transactionDirectory, `${path.basename(targetPath)}.install-${nonce}`)
    : `${targetPath}.install-${nonce}`;
  const backupPath = transactionDirectory
    ? path.join(transactionDirectory, `${path.basename(targetPath)}.backup-${nonce}`)
    : `${targetPath}.backup-${nonce}`;
  let backupCreated = false;

  try {
    await cp(sourcePath, stagingPath, { recursive: true, errorOnExist: true });
    if (prepare) {
      await prepare(stagingPath);
    }
    if (await lstatIfExists(targetPath)) {
      await rename(targetPath, backupPath);
      backupCreated = true;
    }
    await rename(stagingPath, targetPath);
    if (backupCreated) {
      await rm(backupPath, { recursive: true, force: true });
    }
  } catch (error) {
    await rm(stagingPath, { recursive: true, force: true });
    if (backupCreated && !(await lstatIfExists(targetPath))) {
      await rename(backupPath, targetPath);
      backupCreated = false;
    }
    throw installError(`Could not install at ${targetPath}`, error);
  } finally {
    if (backupCreated && (await lstatIfExists(backupPath))) {
      await rm(backupPath, { recursive: true, force: true });
    }
  }
}

async function assertDistinctSourceAndTarget(sourcePath, targetPath) {
  if ((await exists(targetPath)) && (await realpath(targetPath)) === (await realpath(sourcePath))) {
    throw installError(`Source and target plugin directories are the same: ${targetPath}`);
  }
}

async function writeJsonAtomically(targetPath, value, transactionDirectory = null) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  const nonce = `${process.pid}-${randomUUID()}`;
  if (transactionDirectory) {
    await mkdir(transactionDirectory, { recursive: true });
  }
  const temporaryPath = transactionDirectory
    ? path.join(transactionDirectory, `${path.basename(targetPath)}.write-${nonce}`)
    : `${targetPath}.write-${nonce}`;
  const backupPath = transactionDirectory
    ? path.join(transactionDirectory, `${path.basename(targetPath)}.backup-${nonce}`)
    : `${targetPath}.backup-${nonce}`;
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
    throw installError(`Could not update JSON file at ${targetPath}`, error);
  } finally {
    if (backupCreated && (await exists(backupPath))) {
      await rm(backupPath, { force: true });
    }
  }
}

function parseBundledSkill(skillMarkdown, skillPath) {
  const frontmatter = skillMarkdown.match(/^(---\r?\n)([\s\S]*?)(\r?\n---(?:\r?\n|$))/);
  if (!frontmatter) {
    throw installError(`Bundled skill has invalid frontmatter: ${skillPath}`);
  }

  const name = frontmatter[2].match(
    /^name:\s*([a-z0-9]+(?:-[a-z0-9]+)*)\s*$/m,
  )?.[1];
  if (!name) {
    throw installError(`Bundled skill must declare a kebab-case name: ${skillPath}`);
  }
  const description = frontmatter[2].match(/^description:\s*(.+?)\s*$/m)?.[1]?.trim();
  if (!description || description === "\"\"" || description === "''") {
    throw installError(`Bundled skill must declare a non-empty description: ${skillPath}`);
  }

  const namespacedFrontmatter = frontmatter[2].replace(
    /^name:\s*[a-z0-9-]+\s*$/m,
    `name: ${PLUGIN_NAME}:${name}`,
  );
  return {
    name,
    markdown: skillMarkdown.replace(
      frontmatter[0],
      `${frontmatter[1]}${namespacedFrontmatter}${frontmatter[3]}`,
    ),
  };
}

async function inspectBundledSkills(sourcePluginDir) {
  const sourceSkillsDir = path.join(sourcePluginDir, "skills");
  await assertDirectory(sourceSkillsDir, "Bundled skills directory");
  const entries = (await readdir(sourceSkillsDir, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

  if (entries.length === 0) {
    throw installError(`Bundled plugin contains no skills: ${sourceSkillsDir}`);
  }

  return Promise.all(entries.map(async (entry) => {
    const sourceDirectory = path.join(sourceSkillsDir, entry.name);
    const skillPath = path.join(sourceDirectory, "SKILL.md");
    let skillMarkdown;
    try {
      skillMarkdown = await readFile(skillPath, "utf8");
    } catch (error) {
      throw installError(`Bundled skill is missing SKILL.md: ${skillPath}`, error);
    }
    const skill = parseBundledSkill(skillMarkdown, skillPath);
    if (skill.name !== entry.name) {
      throw installError(`Bundled skill folder and name differ: ${sourceDirectory}`);
    }
    return {
      ...skill,
      sourceDirectory,
      targetDirectoryName: `${PLUGIN_NAME}-${skill.name}`,
    };
  }));
}

async function readSkillCatalog(sourcePluginDir) {
  const catalogPath = path.join(sourcePluginDir, "skill-catalog.json");
  let catalog;
  try {
    catalog = JSON.parse(await readFile(catalogPath, "utf8"));
  } catch (error) {
    throw installError(`Bundled skill catalog is invalid: ${catalogPath}`, error);
  }
  if (
    catalog?.schemaVersion !== 1
    || catalog?.plugin !== PLUGIN_NAME
    || !Array.isArray(catalog?.skills)
    || catalog.skills.length === 0
    || new Set(catalog.skills).size !== catalog.skills.length
    || catalog.skills.some(
      (name) => typeof name !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name),
    )
  ) {
    throw installError(`Bundled skill catalog has an unsupported shape: ${catalogPath}`);
  }
  const sortedSkills = [...catalog.skills].sort((left, right) => left.localeCompare(right));
  if (catalog.skills.some((name, index) => name !== sortedSkills[index])) {
    throw installError(`Bundled skill catalog must be sorted: ${catalogPath}`);
  }
  return { catalogPath, skills: catalog.skills };
}

function validateBundledSkillCatalog(bundledSkills, catalog) {
  const bundledNames = bundledSkills.map((skill) => skill.name);
  const bundledSet = new Set(bundledNames);
  const catalogSet = new Set(catalog.skills);
  const missing = catalog.skills.filter((name) => !bundledSet.has(name));
  const unexpected = bundledNames.filter((name) => !catalogSet.has(name));
  if (missing.length > 0 || unexpected.length > 0) {
    throw installError(
      `Bundled skills do not match skill-catalog.json`
      + `${missing.length > 0 ? `; missing: ${missing.join(", ")}` : ""}`
      + `${unexpected.length > 0 ? `; unexpected: ${unexpected.join(", ")}` : ""}`,
    );
  }
}

function validateManagedSkillDirectory(directoryName, statePath) {
  if (
    typeof directoryName !== "string"
    || !new RegExp(`^${PLUGIN_NAME}-[a-z0-9]+(?:-[a-z0-9]+)*$`).test(directoryName)
  ) {
    throw installError(`Invalid managed skill directory in ${statePath}: ${directoryName}`);
  }
  return directoryName;
}

async function readProjectInstallState(statePath) {
  if (!(await exists(statePath))) {
    return null;
  }

  let state;
  try {
    state = JSON.parse(await readFile(statePath, "utf8"));
  } catch (error) {
    throw installError(`Project install state is invalid: ${statePath}`, error);
  }
  if (
    state?.schemaVersion !== 1
    || state?.plugin !== PLUGIN_NAME
    || typeof state?.pluginVersion !== "string"
    || !state.pluginVersion
    || state?.status !== "installed"
    || !Array.isArray(state.skillDirectories)
  ) {
    throw installError(`Project install state has an unsupported shape: ${statePath}`);
  }
  if (new Set(state.skillDirectories).size !== state.skillDirectories.length) {
    throw installError(`Project install state contains duplicate skill directories: ${statePath}`);
  }
  const skillDirectories = state.skillDirectories.map(
    (directoryName) => validateManagedSkillDirectory(directoryName, statePath),
  );
  return {
    ...state,
    skillDirectories,
    managedDirectories: skillDirectories,
  };
}

function projectInstallerPaths(projectDir) {
  const root = path.join(projectDir, PROJECT_INSTALLER_RELATIVE_PATH);
  return {
    root,
    journals: path.join(root, "journals"),
    transactions: path.join(root, "transactions"),
  };
}

async function removeDirectoryIfEmpty(directoryPath) {
  try {
    await rmdir(directoryPath);
  } catch (error) {
    if (error.code !== "ENOENT" && error.code !== "ENOTEMPTY" && error.code !== "EEXIST") {
      throw error;
    }
  }
}

function isProcessRunning(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) {
    return null;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code === "ESRCH" ? false : true;
  }
}

async function readProjectLockOwner(ownerPath) {
  try {
    const ownerDetails = await lstat(ownerPath);
    if (ownerDetails.isSymbolicLink() || !ownerDetails.isFile()) {
      return null;
    }
    return JSON.parse(await readFile(ownerPath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT" || error instanceof SyntaxError) {
      return null;
    }
    throw installError(`Could not inspect the project installer lock: ${ownerPath}`, error);
  }
}

function isValidProjectLockOwner(owner) {
  return owner?.schemaVersion === 1
    && owner?.plugin === PLUGIN_NAME
    && (owner?.operation === "install" || owner?.operation === "uninstall")
    && Number.isSafeInteger(owner?.pid)
    && owner.pid > 0
    && typeof owner?.token === "string"
    && TRANSACTION_ID_PATTERN.test(owner.token)
    && typeof owner?.startedAt === "string"
    && Number.isFinite(Date.parse(owner.startedAt));
}

async function acquireProjectLock(projectDir, operation) {
  const paths = projectInstallerPaths(projectDir);
  const agentsDirectory = path.dirname(paths.root);
  const agentsExisted = Boolean(await lstatIfExists(agentsDirectory));
  const rootExisted = Boolean(await lstatIfExists(paths.root));
  const lockDirectory = path.join(paths.root, "lock");
  const ownerPath = path.join(lockDirectory, "owner.json");
  await assertProjectPathSafe(projectDir, lockDirectory, "project installer lock");
  await mkdir(paths.root, { recursive: true });

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await mkdir(lockDirectory, { recursive: false });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw installError(`Could not acquire the project installer lock: ${lockDirectory}`, error);
      }
      const lockDetails = await lstatIfExists(lockDirectory);
      if (!lockDetails?.isDirectory() || lockDetails.isSymbolicLink()) {
        throw installError(`Project installer lock is not a safe directory: ${lockDirectory}`);
      }

      const owner = await readProjectLockOwner(ownerPath);
      const ageMs = Date.now() - lockDetails.mtimeMs;
      if (!isValidProjectLockOwner(owner)) {
        if (ageMs < PROJECT_LOCK_STALE_AFTER_MS) {
          throw installError("Another hehehe project operation is acquiring the installer lock; retry shortly.");
        }
        throw installError(
          `Project installer lock metadata is invalid; confirm no hehehe process is running,`
          + ` then remove this lock and retry: ${lockDirectory}`,
        );
      }

      const running = isProcessRunning(owner.pid);
      if (running === true) {
        throw installError(
          `Another hehehe project ${owner.operation} is already in progress (pid ${owner.pid}).`,
        );
      }
      const retiredLockDirectory = path.join(
        paths.root,
        `lock.recovered-${owner.token}`,
      );
      await assertProjectPathSafe(
        projectDir,
        retiredLockDirectory,
        "recovered project installer lock",
      );
      try {
        await rename(lockDirectory, retiredLockDirectory);
      } catch (recoveryError) {
        if (recoveryError.code === "ENOENT") {
          continue;
        }
        const existingRetiredDetails = await lstatIfExists(retiredLockDirectory);
        const existingRetiredOwner = await readProjectLockOwner(
          path.join(retiredLockDirectory, "owner.json"),
        );
        if (
          existingRetiredDetails?.isDirectory()
          && !existingRetiredDetails.isSymbolicLink()
          && isValidProjectLockOwner(existingRetiredOwner)
          && existingRetiredOwner.token === owner.token
          && existingRetiredOwner.pid === owner.pid
        ) {
          const currentOwner = await readProjectLockOwner(ownerPath);
          if (currentOwner?.token === owner.token) {
            throw installError(
              `Project installer lock generation exists in both active and recovered paths;`
              + ` inspect them before retrying: ${lockDirectory}`,
            );
          }
          continue;
        }
        throw installError(
          `Could not retire the stale project installer lock without replacing another generation:`
          + ` ${lockDirectory}`,
          recoveryError,
        );
      }
      const retiredDetails = await lstatIfExists(retiredLockDirectory);
      const retiredOwner = await readProjectLockOwner(
        path.join(retiredLockDirectory, "owner.json"),
      );
      if (
        !retiredDetails?.isDirectory()
        || retiredDetails.isSymbolicLink()
        || !isValidProjectLockOwner(retiredOwner)
        || retiredOwner.token !== owner.token
        || retiredOwner.pid !== owner.pid
      ) {
        throw installError(
          `Recovered project installer lock changed unexpectedly; inspect it before retrying:`
          + ` ${retiredLockDirectory}`,
        );
      }
      continue;
    }

    const token = randomUUID();
    try {
      await writeFile(ownerPath, `${JSON.stringify({
        schemaVersion: 1,
        plugin: PLUGIN_NAME,
        operation,
        pid: process.pid,
        token,
        startedAt: new Date().toISOString(),
      }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    } catch (error) {
      try {
        await removeDirectory(lockDirectory, "project installer lock");
      } catch (cleanupError) {
        throw installError(
          `Could not initialize or clean up the project installer lock: ${lockDirectory}`,
          new AggregateError([error, cleanupError]),
        );
      }
      throw installError(`Could not initialize the project installer lock: ${lockDirectory}`, error);
    }

    return {
      async release() {
        let owner;
        try {
          owner = JSON.parse(await readFile(ownerPath, "utf8"));
        } catch (error) {
          throw installError(`Could not release the project installer lock: ${ownerPath}`, error);
        }
        if (owner?.token !== token || owner?.pid !== process.pid) {
          throw installError(`Project installer lock ownership changed unexpectedly: ${ownerPath}`);
        }
        await removeDirectory(lockDirectory, "project installer lock");
        if (!rootExisted) {
          await removeDirectoryIfEmpty(paths.root);
        }
        if (!agentsExisted) {
          await removeDirectoryIfEmpty(agentsDirectory);
        }
      },
    };
  }
  throw installError(`Could not acquire the project installer lock: ${lockDirectory}`);
}

async function withProjectLock(projectDir, operation, callback) {
  const lock = await acquireProjectLock(projectDir, operation);
  let result;
  try {
    result = await callback();
  } catch (operationError) {
    try {
      await lock.release();
    } catch (releaseError) {
      throw installError(
        `Project ${operation} failed and the installer lock could not be released`,
        new AggregateError([operationError, releaseError]),
      );
    }
    throw operationError;
  }
  await lock.release();
  return result;
}

async function assertOptionalDirectory(directoryPath, label) {
  const details = await lstatIfExists(directoryPath);
  if (details && !details.isDirectory()) {
    throw installError(`${label} is not a directory: ${directoryPath}`);
  }
}

function validateInstallJournal(journal, journalPath, transactionId) {
  if (
    journal?.schemaVersion !== 1
    || journal?.plugin !== PLUGIN_NAME
    || journal?.status !== "installing"
    || journal?.transactionId !== transactionId
    || typeof journal?.pluginVersion !== "string"
    || !journal.pluginVersion
    || !Array.isArray(journal?.managedDirectories)
    || journal.managedDirectories.length === 0
    || new Set(journal.managedDirectories).size !== journal.managedDirectories.length
  ) {
    throw installError(`Project install journal has an unsupported shape: ${journalPath}`);
  }
  return journal.managedDirectories.map(
    (directoryName) => validateManagedSkillDirectory(directoryName, journalPath),
  );
}

async function inspectProjectTransactions(projectDir) {
  const paths = projectInstallerPaths(projectDir);
  for (const [label, targetPath] of Object.entries(paths)) {
    await assertProjectPathSafe(projectDir, targetPath, `project installer ${label}`);
  }
  await assertOptionalDirectory(paths.root, "Project installer root");
  await assertOptionalDirectory(paths.journals, "Project installer journals directory");
  await assertOptionalDirectory(paths.transactions, "Project installer transactions directory");

  const journalRecords = [];
  const temporaryJournalPaths = [];
  const journalIds = new Set();
  if (await lstatIfExists(paths.journals)) {
    const entries = await readdir(paths.journals, { withFileTypes: true });
    for (const entry of entries) {
      const journalMatch = entry.name.match(/^([0-9a-f-]{36})\.json$/);
      const temporaryMatch = entry.name.match(
        /^([0-9a-f-]{36})\.json\.write-[0-9]+-[0-9a-f-]{36}$/,
      );
      const entryPath = path.join(paths.journals, entry.name);
      if (entry.isFile() && temporaryMatch && TRANSACTION_ID_PATTERN.test(temporaryMatch[1])) {
        temporaryJournalPaths.push(entryPath);
        continue;
      }
      if (!entry.isFile() || !journalMatch || !TRANSACTION_ID_PATTERN.test(journalMatch[1])) {
        throw installError(`Unexpected project installer journal entry: ${entryPath}`);
      }
      const transactionId = journalMatch[1];
      let journal;
      try {
        journal = JSON.parse(await readFile(entryPath, "utf8"));
      } catch (error) {
        throw installError(`Project install journal is invalid: ${entryPath}`, error);
      }
      journalIds.add(transactionId);
      journalRecords.push({
        transactionId,
        journalPath: entryPath,
        transactionDirectory: path.join(paths.transactions, transactionId),
        managedDirectories: validateInstallJournal(journal, entryPath, transactionId),
      });
    }
  }

  if (await lstatIfExists(paths.transactions)) {
    const entries = await readdir(paths.transactions, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(paths.transactions, entry.name);
      if (
        !entry.isDirectory()
        || !TRANSACTION_ID_PATTERN.test(entry.name)
        || !journalIds.has(entry.name)
      ) {
        throw installError(`Unexpected project installer transaction entry: ${entryPath}`);
      }
      await assertProjectPathSafe(projectDir, entryPath, "project installer transaction");
    }
  }

  return {
    ...paths,
    journalRecords,
    temporaryJournalPaths,
    managedDirectories: [
      ...new Set(journalRecords.flatMap((record) => record.managedDirectories)),
    ],
  };
}

async function createProjectTransaction({
  projectDir,
  projectTransactions,
  pluginVersion,
  managedDirectories,
}) {
  const transactionId = randomUUID();
  const journalPath = path.join(projectTransactions.journals, `${transactionId}.json`);
  const transactionDirectory = path.join(projectTransactions.transactions, transactionId);
  await assertProjectPathSafe(projectDir, journalPath, "project install journal");
  await assertProjectPathSafe(projectDir, transactionDirectory, "project install transaction");
  if (await lstatIfExists(journalPath) || await lstatIfExists(transactionDirectory)) {
    throw installError(`Project install transaction already exists: ${transactionId}`);
  }

  await mkdir(projectTransactions.journals, { recursive: true });
  const temporaryJournalPath = `${journalPath}.write-${process.pid}-${randomUUID()}`;
  try {
    await writeFile(temporaryJournalPath, `${JSON.stringify({
      schemaVersion: 1,
      plugin: PLUGIN_NAME,
      pluginVersion,
      status: "installing",
      transactionId,
      managedDirectories,
    }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    await rename(temporaryJournalPath, journalPath);
  } catch (error) {
    await rm(temporaryJournalPath, { force: true });
    throw installError(`Could not create project install journal: ${journalPath}`, error);
  }
  try {
    await mkdir(projectTransactions.transactions, { recursive: true });
    await mkdir(transactionDirectory, { recursive: false });
  } catch (error) {
    throw installError(
      `Project install transaction was journaled but could not start; rerun the install command`,
      error,
    );
  }
  return {
    transactionId,
    journalPath,
    transactionDirectory,
    managedDirectories,
  };
}

async function cleanupProjectTransactions(projectTransactions, additionalRecords = []) {
  const records = [...projectTransactions.journalRecords, ...additionalRecords];
  for (const record of records) {
    await removeDirectory(record.transactionDirectory, "project installer transaction");
    await rm(record.journalPath, { force: true });
  }
  for (const temporaryPath of projectTransactions.temporaryJournalPaths) {
    await rm(temporaryPath, { force: true });
  }
}

async function removeDirectory(targetPath, label) {
  const details = await lstatIfExists(targetPath);
  if (!details) {
    return;
  }
  if (details.isSymbolicLink()) {
    throw installError(`Refusing to remove symbolic-link ${label}: ${targetPath}`);
  }
  if (!details.isDirectory()) {
    throw installError(`${label} is not a directory: ${targetPath}`);
  }
  await rm(targetPath, { recursive: true, force: true });
}

async function preflightProjectSkills({
  bundledSkills,
  projectDir,
  sourcePluginDir,
}) {
  const targetSkillsDir = path.join(projectDir, PROJECT_SKILLS_RELATIVE_PATH);
  const statePath = path.join(targetSkillsDir, PROJECT_INSTALL_STATE);
  await assertProjectPathSafe(projectDir, targetSkillsDir, "project skills path");
  await assertProjectPathSafe(projectDir, statePath, "project install state");
  const previousState = await readProjectInstallState(statePath);
  const projectTransactions = await inspectProjectTransactions(projectDir);
  const currentDirectories = bundledSkills.map((skill) => skill.targetDirectoryName);
  const previousManagedDirectories = [
    ...new Set([
      ...(previousState?.managedDirectories ?? []),
      ...projectTransactions.managedDirectories,
    ]),
  ];
  const ownedDirectories = new Set(previousManagedDirectories);
  const sourceTemplatesDir = path.join(sourcePluginDir, "templates");
  await assertDirectory(sourceTemplatesDir, "Bundled templates directory");
  try {
    await readFile(path.join(sourceTemplatesDir, "done-criteria.md"), "utf8");
  } catch (error) {
    throw installError("Bundled done-criteria template is missing.", error);
  }

  for (const skill of bundledSkills) {
    const targetDirectory = path.join(targetSkillsDir, skill.targetDirectoryName);
    await assertProjectPathSafe(projectDir, targetDirectory, "project skill target");
    const existingTarget = await lstatIfExists(targetDirectory);
    if (existingTarget && !ownedDirectories.has(skill.targetDirectoryName)) {
      throw installError(
        `Refusing to overwrite an existing project skill not managed by ${PLUGIN_NAME}: ${targetDirectory}`,
      );
    }
    if (existingTarget && !existingTarget.isDirectory()) {
      throw installError(`Managed project skill target is not a directory: ${targetDirectory}`);
    }
  }

  for (const staleDirectory of previousManagedDirectories) {
    const stalePath = path.join(targetSkillsDir, staleDirectory);
    await assertProjectPathSafe(projectDir, stalePath, "stale managed skill target");
    const staleDetails = await lstatIfExists(stalePath);
    if (staleDetails && !staleDetails.isDirectory()) {
      throw installError(`Stale managed project skill target is not a directory: ${stalePath}`);
    }
  }

  return {
    currentDirectories,
    projectDir,
    projectTransactions,
    previousManagedDirectories,
    sourceTemplatesDir,
    statePath,
    targetSkillsDir,
  };
}

async function installProjectSkills({
  bundledSkills,
  pluginVersion,
  projectPlan,
  skillCatalogPath,
}) {
  const {
    currentDirectories,
    projectDir,
    projectTransactions,
    previousManagedDirectories,
    sourceTemplatesDir,
    statePath,
    targetSkillsDir,
  } = projectPlan;
  await mkdir(targetSkillsDir, { recursive: true });
  const managedDirectories = [
    ...new Set([...previousManagedDirectories, ...currentDirectories]),
  ].sort((left, right) => left.localeCompare(right));
  const transaction = await createProjectTransaction({
    projectDir,
    projectTransactions,
    pluginVersion,
    managedDirectories,
  });

  try {
    for (const skill of bundledSkills) {
      const targetDirectory = path.join(targetSkillsDir, skill.targetDirectoryName);
      await replacePath(
        skill.sourceDirectory,
        targetDirectory,
        async (stagingDirectory) => {
          await writeFile(path.join(stagingDirectory, "SKILL.md"), skill.markdown, "utf8");
          if (skill.name === "resume") {
            await cp(sourceTemplatesDir, path.join(stagingDirectory, "templates"), {
              recursive: true,
              errorOnExist: true,
            });
          }
          if (skill.name === "doctor") {
            await cp(skillCatalogPath, path.join(stagingDirectory, "skill-catalog.json"), {
              errorOnExist: true,
            });
          }
        },
        transaction.transactionDirectory,
      );
    }

    for (const staleDirectory of previousManagedDirectories) {
      if (!currentDirectories.includes(staleDirectory)) {
        await removeDirectory(path.join(targetSkillsDir, staleDirectory), "managed skill directory");
      }
    }

    await writeJsonAtomically(
      statePath,
      {
        schemaVersion: 1,
        plugin: PLUGIN_NAME,
        pluginVersion,
        status: "installed",
        skillDirectories: currentDirectories,
      },
      transaction.transactionDirectory,
    );
  } catch (error) {
    throw installError(
      `Project skill installation was interrupted; rerun the same install command to resume`,
      error,
    );
  }
  try {
    await cleanupProjectTransactions(projectTransactions, [transaction]);
  } catch (error) {
    throw installError(
      `Project skills were installed but transaction cleanup was interrupted; rerun the install command`,
      error,
    );
  }
  return { targetSkillsDir, statePath, currentDirectories };
}

function isManagedLegacyPlugin(plugin) {
  return plugin?.name === PLUGIN_NAME
    && plugin?.source?.source === "local"
    && plugin?.source?.path === MARKETPLACE_PLUGIN_PATH
    && plugin?.policy?.installation === "INSTALLED_BY_DEFAULT"
    && plugin?.policy?.authentication === "ON_INSTALL"
    && plugin?.category === "Productivity";
}

async function validateLegacyProjectPlugin({
  projectDir,
  targetPluginDir,
  marketplace,
}) {
  if (!marketplace?.plugins.some(isManagedLegacyPlugin)) {
    return false;
  }

  await assertProjectPathSafe(projectDir, targetPluginDir, "legacy project plugin target");
  const targetDetails = await lstatIfExists(targetPluginDir);
  if (!targetDetails) {
    return true;
  }
  if (!targetDetails.isDirectory()) {
    throw installError(`Legacy project plugin target is not a directory: ${targetPluginDir}`);
  }

  const manifestPath = path.join(targetPluginDir, ".codex-plugin", "plugin.json");
  await assertProjectPathSafe(projectDir, manifestPath, "legacy project plugin manifest");
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch (error) {
    throw installError(
      `Refusing to remove an unverified legacy project plugin: ${targetPluginDir}`,
      error,
    );
  }
  if (manifest?.name !== PLUGIN_NAME || typeof manifest?.version !== "string") {
    throw installError(`Refusing to remove an unverified legacy project plugin: ${targetPluginDir}`);
  }
  return true;
}

async function removeLegacyProjectPlugin({
  projectDir,
  targetPluginDir,
  marketplacePath,
  marketplace,
}) {
  if (!await validateLegacyProjectPlugin({ projectDir, targetPluginDir, marketplace })) {
    return false;
  }
  const plugins = marketplace.plugins.filter((plugin) => !isManagedLegacyPlugin(plugin));
  await removeDirectory(targetPluginDir, "legacy project plugin directory");
  await writeJsonAtomically(marketplacePath, { ...marketplace, plugins });
  return true;
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

  if (scope === "project") {
    const bundledSkills = await inspectBundledSkills(sourcePluginDir);
    const skillCatalog = await readSkillCatalog(sourcePluginDir);
    validateBundledSkillCatalog(bundledSkills, skillCatalog);
    const projectPlan = await preflightProjectSkills({
      bundledSkills,
      projectDir: rootDir,
      sourcePluginDir,
    });
    const { targetSkillsDir, statePath } = projectPlan;
    await assertProjectPathSafe(rootDir, marketplacePath, "legacy project marketplace");
    await assertProjectPathSafe(rootDir, targetPluginDir, "legacy project plugin target");
    const legacyMarketplace = await exists(marketplacePath)
      ? await readMarketplace(marketplacePath, {})
      : null;
    await validateLegacyProjectPlugin({
      projectDir: rootDir,
      targetPluginDir,
      marketplace: legacyMarketplace,
    });
    const result = {
      scope,
      dryRun,
      version: manifest.version,
      sourcePluginDir,
      targetPluginDir,
      marketplacePath,
      marketplaceName: legacyMarketplace?.name,
      targetSkillsDir,
      statePath,
      installedSkills: bundledSkills.map((skill) => `${PLUGIN_NAME}:${skill.name}`),
      activated: false,
    };

    if (dryRun) {
      return result;
    }

    await installProjectSkills({
      bundledSkills,
      pluginVersion: manifest.version,
      projectPlan,
      skillCatalogPath: skillCatalog.catalogPath,
    });
    await removeLegacyProjectPlugin({
      projectDir: rootDir,
      targetPluginDir,
      marketplacePath,
      marketplace: legacyMarketplace,
    });
    return result;
  }

  await assertProjectPathSafe(rootDir, targetPluginDir, "global plugin target");
  await assertProjectPathSafe(rootDir, marketplacePath, "global marketplace");
  await globalPayloadPaths(sourcePluginDir);
  const previousMarketplace = await readMarketplace(marketplacePath, {
    name: "user-local",
    interface: { displayName: "User Local Plugins" },
  });
  const ownership = await globalOwnership(rootDir, targetPluginDir, marketplacePath, previousMarketplace, sourcePluginDir);
  const marketplace = withPlugin(previousMarketplace, "AVAILABLE");

  const result = {
    scope,
    dryRun,
    version: manifest.version,
    sourcePluginDir,
    targetPluginDir,
    marketplacePath,
    marketplaceName: marketplace.name,
    ownership,
    activated: false,
  };

  if (dryRun) {
    return result;
  }

  await replacePath(sourcePluginDir, targetPluginDir, async (stagingDirectory) => {
    // Stored inside staging so a failed replacement cannot claim the old folder.
    const target = path.join(await realpath(path.dirname(stagingDirectory)), path.basename(targetPluginDir));
    await writeFile(path.join(stagingDirectory, GLOBAL_INSTALL_MARKER), JSON.stringify({
      schemaVersion: 1, plugin: PLUGIN_NAME, target,
    }) + "\n", "utf8");
  });
  await writeJsonAtomically(marketplacePath, marketplace);
  if (activate) {
    runCodexPluginCommand("add", marketplace.name);
    result.activated = true;
  }
  return result;
}

export async function installGlobal({ sourcePluginDir, homeDir = os.homedir(), dryRun = false, activate = true }) {
  return install({ sourcePluginDir, rootDir: path.resolve(homeDir), scope: "global", dryRun, activate });
}

export async function installProject({ sourcePluginDir, projectDir = process.cwd(), dryRun = false }) {
  const rootDir = path.resolve(projectDir);
  await assertDirectory(rootDir, "Project directory");
  const runInstall = () => install({
    sourcePluginDir,
    rootDir,
    scope: "project",
    dryRun,
    activate: false,
  });
  return dryRun ? runInstall() : withProjectLock(rootDir, "install", runInstall);
}

async function uninstall({ rootDir, scope, dryRun = false, deactivate = true }) {
  await assertDirectory(rootDir, scope === "global" ? "User home directory" : "Project directory");
  const targetPluginDir = path.join(rootDir, "plugins", PLUGIN_NAME);
  const marketplacePath = path.join(rootDir, MARKETPLACE_RELATIVE_PATH);
  const targetSkillsDir = path.join(rootDir, PROJECT_SKILLS_RELATIVE_PATH);
  const statePath = path.join(targetSkillsDir, PROJECT_INSTALL_STATE);
  if (scope === "project") {
    await assertProjectPathSafe(rootDir, targetSkillsDir, "project skills path");
    await assertProjectPathSafe(rootDir, statePath, "project install state");
    await assertProjectPathSafe(rootDir, marketplacePath, "legacy project marketplace");
    await assertProjectPathSafe(rootDir, targetPluginDir, "legacy project plugin target");
  }
  if (scope === "global") {
    await assertProjectPathSafe(rootDir, targetPluginDir, "global plugin target");
    await assertProjectPathSafe(rootDir, marketplacePath, "global marketplace");
  }
  const marketplace = await exists(marketplacePath)
    ? await readMarketplace(marketplacePath, {})
    : null;
  const projectState = scope === "project" ? await readProjectInstallState(statePath) : null;
  const ownership = scope === "global"
    ? await globalOwnership(rootDir, targetPluginDir, marketplacePath, marketplace) : null;
  const projectTransactions = scope === "project"
    ? await inspectProjectTransactions(rootDir)
    : null;
  if (scope === "project") {
    await validateLegacyProjectPlugin({
      projectDir: rootDir,
      targetPluginDir,
      marketplace,
    });
  }
  const managedDirectories = [
    ...new Set([
      ...(projectState?.managedDirectories ?? []),
      ...(projectTransactions?.managedDirectories ?? []),
    ]),
  ];
  const managedTargets = [];
  if (scope === "project") {
    for (const directoryName of managedDirectories) {
      const targetDirectory = path.join(targetSkillsDir, directoryName);
      await assertProjectPathSafe(rootDir, targetDirectory, "managed project skill target");
      const targetDetails = await lstatIfExists(targetDirectory);
      if (targetDetails && !targetDetails.isDirectory()) {
        throw installError(`Managed project skill target is not a directory: ${targetDirectory}`);
      }
      managedTargets.push(targetDirectory);
    }
  }

  const result = {
    scope,
    dryRun,
    targetPluginDir,
    marketplacePath,
    marketplaceName: marketplace?.name,
    targetSkillsDir,
    statePath,
    installedSkills: managedDirectories.map(
      (directoryName) => directoryName.replace(`${PLUGIN_NAME}-`, `${PLUGIN_NAME}:`),
    ),
    deactivated: false,
    ...(scope === "global" ? { ownership } : {}),
  };
  if (dryRun) {
    return result;
  }

  if (scope === "project") {
    for (const targetDirectory of managedTargets) {
      await removeDirectory(targetDirectory, "managed skill directory");
    }
    await rm(statePath, { force: true });
    await removeLegacyProjectPlugin({
      projectDir: rootDir,
      targetPluginDir,
      marketplacePath,
      marketplace,
    });
    await cleanupProjectTransactions(projectTransactions);
    return result;
  }

  const plugins = marketplace?.plugins.filter((plugin) => plugin?.name !== PLUGIN_NAME) ?? [];
  const marketplaceChanged = plugins.length !== (marketplace?.plugins.length ?? 0);
  if (deactivate && marketplaceChanged) {
    runCodexPluginCommand("remove", marketplace.name);
    result.deactivated = true;
  }
  await removeDirectory(targetPluginDir, "plugin directory");
  if (marketplaceChanged) {
    await writeJsonAtomically(marketplacePath, { ...marketplace, plugins });
  }
  return result;
}

export async function uninstallGlobal({ homeDir = os.homedir(), dryRun = false, deactivate = true } = {}) {
  return uninstall({ rootDir: path.resolve(homeDir), scope: "global", dryRun, deactivate });
}

export async function uninstallProject({ projectDir = process.cwd(), dryRun = false } = {}) {
  const rootDir = path.resolve(projectDir);
  await assertDirectory(rootDir, "Project directory");
  const runUninstall = () => uninstall({
    rootDir,
    scope: "project",
    dryRun,
    deactivate: false,
  });
  return dryRun ? runUninstall() : withProjectLock(rootDir, "uninstall", runUninstall);
}
