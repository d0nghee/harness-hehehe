#!/usr/bin/env node

import { execFile } from "node:child_process";
import crypto from "node:crypto";
import { lstat, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);

function fail(message) {
  throw new Error(message);
}

function localDateStamp(date = new Date()) {
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function validateDateStamp(value) {
  if (!/^\d{8}$/.test(value)) fail("--date must use YYYYMMDD.");
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year
    || candidate.getUTCMonth() + 1 !== month
    || candidate.getUTCDate() !== day
  ) {
    fail("--date must be a real calendar date.");
  }
  return value;
}

function positiveInteger(value, option) {
  if (!/^\d+$/.test(String(value))) fail(`${option} must be a positive integer.`);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) {
    fail(`${option} must be a positive integer.`);
  }
  return number;
}

export function normalizeTaskSlug(task) {
  if (typeof task !== "string" || !task.trim()) fail("--task is required.");
  const ascii = task
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
  const digest = crypto.createHash("sha256").update(task.trim()).digest("hex").slice(0, 10);
  // Retain readable labels while keeping lossy transliteration/truncation out of task identity.
  return `${ascii || "task"}-${digest}`;
}

function usage() {
  return `worktree-isolation

Usage:
  node worktree-isolation.mjs plan --project <root> --task <identity> [options]
  node worktree-isolation.mjs create --project <root> --task <identity> [options]
  node worktree-isolation.mjs status --project <root> [--json]

Options:
  --branch <name>
  --path <directory>
  --base <git-ref>
  --date <YYYYMMDD>
  --port-base <number>
  --port-span <number>
  --allow-dirty-source
  --json`;
}

export function parseArguments(argv) {
  const [command, ...rest] = argv;
  if (!["plan", "create", "status"].includes(command)) {
    fail(`Expected plan, create, or status.\n\n${usage()}`);
  }
  const parsed = {
    command,
    projectDir: ".",
    baseRef: "HEAD",
    date: localDateStamp(),
    portBase: 3000,
    portSpan: 1000,
    allowDirtySource: false,
    json: false,
  };
  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--json") {
      parsed.json = true;
    } else if (argument === "--allow-dirty-source") {
      parsed.allowDirtySource = true;
    } else if (
      ["--project", "--task", "--branch", "--path", "--base", "--date", "--port-base", "--port-span"]
        .includes(argument)
    ) {
      const value = rest[index + 1];
      if (!value || value.startsWith("--")) fail(`${argument} requires a value.`);
      index += 1;
      if (argument === "--project") parsed.projectDir = value;
      if (argument === "--task") parsed.task = value;
      if (argument === "--branch") parsed.branch = value;
      if (argument === "--path") parsed.worktreePath = value;
      if (argument === "--base") parsed.baseRef = value;
      if (argument === "--date") parsed.date = validateDateStamp(value);
      if (argument === "--port-base") parsed.portBase = positiveInteger(value, argument);
      if (argument === "--port-span") parsed.portSpan = positiveInteger(value, argument);
    } else {
      fail(`Unknown argument: ${argument}\n\n${usage()}`);
    }
  }
  if (command !== "status" && !parsed.task) fail("--task is required for plan and create.");
  if (parsed.allowDirtySource && command !== "create") {
    fail("--allow-dirty-source is valid only for create.");
  }
  if (parsed.portBase + parsed.portSpan - 1 > 65535) {
    fail("The suggested port range must end at or below 65535.");
  }
  return parsed;
}

async function runGit(projectDir, args, { allowFailure = false } = {}) {
  try {
    const result = await execFileAsync("git", ["-C", projectDir, ...args], {
      encoding: "utf8",
      windowsHide: true,
    });
    return { ok: true, stdout: result.stdout.trimEnd(), stderr: result.stderr.trim() };
  } catch (error) {
    if (allowFailure) {
      return {
        ok: false,
        stdout: String(error.stdout ?? "").trimEnd(),
        stderr: String(error.stderr ?? error.message).trim(),
        code: error.code,
      };
    }
    fail(`git ${args.join(" ")} failed: ${String(error.stderr ?? error.message).trim()}`);
  }
}

export function parseWorktreePorcelain(output) {
  if (!output.trim()) return [];
  return output.trim().split(/\r?\n\r?\n/).map((record) => {
    const result = { path: null, head: null, branch: null, detached: false, locked: false };
    for (const line of record.split(/\r?\n/)) {
      const separator = line.indexOf(" ");
      const key = separator === -1 ? line : line.slice(0, separator);
      const value = separator === -1 ? "" : line.slice(separator + 1);
      if (key === "worktree") result.path = value;
      if (key === "HEAD") result.head = value;
      if (key === "branch") result.branch = value.replace(/^refs\/heads\//, "");
      if (key === "detached") result.detached = true;
      if (key === "locked") result.locked = true;
    }
    return result;
  });
}

function comparable(filePath) {
  const normalized = path.resolve(filePath).replace(/[\\/]+$/, "");
  return process.platform === "win32" ? normalized.toLowerCase() : normalized;
}

function isInside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function inspectPath(targetPath) {
  try {
    const stats = await lstat(targetPath);
    if (stats.isSymbolicLink()) fail(`Worktree path must not be a symbolic link: ${targetPath}`);
    if (!stats.isDirectory()) fail(`Worktree path exists and is not a directory: ${targetPath}`);
    const entries = await readdir(targetPath);
    return { exists: true, empty: entries.length === 0 };
  } catch (error) {
    if (error.code === "ENOENT") return { exists: false, empty: true };
    throw error;
  }
}

async function validatePathChain(targetPath) {
  let current = path.resolve(targetPath);
  while (true) {
    try {
      const stats = await lstat(current);
      if (stats.isSymbolicLink()) {
        fail(`Worktree path must not traverse a symbolic link or junction: ${current}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

export async function inspectRepository(projectDir = ".") {
  const rootResult = await runGit(projectDir, ["rev-parse", "--show-toplevel"]);
  const root = path.resolve(rootResult.stdout);
  const branchResult = await runGit(root, ["branch", "--show-current"]);
  const headResult = await runGit(root, ["rev-parse", "HEAD"]);
  const statusResult = await runGit(root, ["status", "--porcelain=v1", "--untracked-files=all"]);
  const worktreeResult = await runGit(root, ["worktree", "list", "--porcelain"]);
  const dirtyPaths = statusResult.stdout
    ? statusResult.stdout.split(/\r?\n/).map((line) => line.slice(3)).filter(Boolean)
    : [];
  return {
    root,
    branch: branchResult.stdout || null,
    head: headResult.stdout,
    dirty: dirtyPaths.length > 0,
    dirty_paths: dirtyPaths,
    worktrees: parseWorktreePorcelain(worktreeResult.stdout),
  };
}

async function branchExists(root, branch) {
  const result = await runGit(
    root,
    ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`],
    { allowFailure: true },
  );
  return result.ok;
}

async function validateBranch(root, branch) {
  const result = await runGit(root, ["check-ref-format", "--branch", branch], {
    allowFailure: true,
  });
  if (!result.ok) fail(`Invalid task branch: ${branch}`);
}

export async function buildPlan(options) {
  const repository = await inspectRepository(options.projectDir ?? ".");
  const slug = normalizeTaskSlug(options.task);
  const branch = options.branch ?? `task/${slug}`;
  await validateBranch(repository.root, branch);
  const baseRef = options.baseRef ?? "HEAD";
  const baseResult = await runGit(repository.root, ["rev-parse", "--verify", `${baseRef}^{commit}`]);
  const baseCommit = baseResult.stdout;
  const existingWorktree = repository.worktrees.find((item) => item.branch === branch);
  const date = validateDateStamp(options.date ?? localDateStamp());
  const defaultPath = path.join(
    path.dirname(repository.root),
    `${path.basename(repository.root)}-worktrees`,
    `${date}-${slug}`,
  );
  const worktreePath = path.resolve(existingWorktree?.path ?? options.worktreePath ?? defaultPath);
  if (!existingWorktree && isInside(repository.root, worktreePath)) {
    fail("Task worktree must be outside the primary repository directory.");
  }
  if (!existingWorktree) await validatePathChain(worktreePath);
  const branchAlreadyExists = await branchExists(repository.root, branch);
  const commonResult = await runGit(repository.root, ["rev-parse", "--git-common-dir"]);
  const commonDirectory = await realpath(path.resolve(repository.root, commonResult.stdout));
  const digest = crypto
    .createHash("sha256")
    .update(`${comparable(commonDirectory)}\n${branch}`)
    .digest("hex");
  const shortHash = digest.slice(0, 8);
  const runtimeLabel = branch.replace(/^task\//, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 44).replace(/-+$/g, "") || "task";
  const workspaceId = `${runtimeLabel}-${shortHash}`;
  const portBase = positiveInteger(options.portBase ?? 3000, "--port-base");
  const portSpan = positiveInteger(options.portSpan ?? 1000, "--port-span");
  if (portBase + portSpan - 1 > 65535) fail("The suggested port range must end at or below 65535.");
  const suggestedPort = portBase + (Number.parseInt(digest.slice(0, 8), 16) % portSpan);
  return {
    schema_version: 1,
    action: existingWorktree ? "reuse" : "create",
    task: options.task,
    task_slug: slug,
    source: {
      root: repository.root,
      branch: repository.branch,
      head: repository.head,
      dirty: repository.dirty,
      dirty_paths: repository.dirty_paths,
      dirty_changes_will_be_excluded: repository.dirty && !existingWorktree,
    },
    task_workspace: {
      branch,
      branch_exists: branchAlreadyExists,
      worktree: worktreePath,
      registered: Boolean(existingWorktree),
      base_ref: baseRef,
      base_commit: baseCommit,
      date_label: date,
    },
    runtime: {
      workspace_id: workspaceId,
      suggested_port: suggestedPort,
      log_directory: `.hehehe/workspaces/${workspaceId}/logs`,
      compose_project: `hehehe-${workspaceId}`.slice(0, 63).replace(/-+$/g, ""),
      database_name: `app_${workspaceId.replace(/-/g, "_")}`.slice(0, 63),
    },
  };
}

export async function createWorktree(options) {
  const plan = await buildPlan(options);
  if (plan.action === "reuse") {
    return { ...plan, result: "reused" };
  }
  if (plan.source.dirty && !options.allowDirtySource) {
    fail(
      "Source worktree is dirty. Review the listed paths and rerun with "
      + "--allow-dirty-source only when those changes are intentionally excluded.",
    );
  }
  const targetState = await inspectPath(plan.task_workspace.worktree);
  if (targetState.exists && !targetState.empty) {
    fail(`Worktree path already exists and is not empty: ${plan.task_workspace.worktree}`);
  }
  const args = plan.task_workspace.branch_exists
    ? ["worktree", "add", plan.task_workspace.worktree, plan.task_workspace.branch]
    : [
        "worktree",
        "add",
        "-b",
        plan.task_workspace.branch,
        plan.task_workspace.worktree,
        plan.task_workspace.base_commit,
      ];
  await runGit(plan.source.root, args);
  const repository = await inspectRepository(plan.source.root);
  const registered = repository.worktrees.find(
    (item) =>
      item.branch === plan.task_workspace.branch
      && comparable(item.path) === comparable(plan.task_workspace.worktree),
  );
  if (!registered) fail("Git did not register the expected task worktree.");
  return { ...plan, result: "created", registered_worktree: registered };
}

function printHuman(result) {
  if (result.worktrees) {
    console.log(`Repository: ${result.root}`);
    console.log(`Branch: ${result.branch ?? "(detached)"}`);
    console.log(`Dirty: ${result.dirty ? "yes" : "no"}`);
    for (const worktree of result.worktrees) {
      console.log(`- ${worktree.path} [${worktree.branch ?? "detached"}]`);
    }
    if (result.task_workspace) {
      console.log(`Task branch: ${result.task_workspace.branch}`);
      console.log(`Task worktree: ${result.task_workspace.worktree}`);
      console.log(`Suggested port: ${result.runtime.suggested_port}`);
    }
    return;
  }
  console.log(`Decision: ${result.result ?? result.action}`);
  console.log(`Task branch: ${result.task_workspace.branch}`);
  console.log(`Worktree: ${result.task_workspace.worktree}`);
  console.log(`Base: ${result.task_workspace.base_commit}`);
  console.log(`Source dirty: ${result.source.dirty ? "yes" : "no"}`);
  console.log(`Suggested port: ${result.runtime.suggested_port}`);
  console.log(`Compose project: ${result.runtime.compose_project}`);
}

export async function runCli(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  let result;
  if (options.command === "status") {
    const repository = await inspectRepository(options.projectDir);
    if (options.task) {
      const plan = await buildPlan(options);
      result = {
        ...repository,
        task_workspace: plan.task_workspace,
        runtime: plan.runtime,
      };
    } else {
      result = repository;
    }
  } else if (options.command === "plan") {
    result = await buildPlan(options);
  } else {
    result = await createWorktree(options);
  }
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printHuman(result);
  }
  return result;
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(scriptPath)) {
  runCli().catch((error) => {
    console.error(`worktree-isolation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
