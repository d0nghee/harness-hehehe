import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";
import {
  buildPlan,
  createWorktree,
  inspectRepository,
  normalizeTaskSlug,
  parseArguments,
  parseWorktreePorcelain,
} from "../plugins/hehehe/skills/resume/scripts/worktree-isolation.mjs";

const execFileAsync = promisify(execFile);
const sourceRoot = path.resolve(import.meta.dirname, "..");

async function git(directory, args) {
  const result = await execFileAsync("git", ["-C", directory, ...args], {
    encoding: "utf8",
    windowsHide: true,
  });
  return result.stdout.trim();
}

async function fixture(t) {
  const container = await mkdtemp(path.join(os.tmpdir(), "hehehe-worktree-"));
  const repository = path.join(container, "repo");
  await mkdir(repository);
  await git(repository, ["init", "-b", "main"]);
  await git(repository, ["config", "user.name", "Hehehe Test"]);
  await git(repository, ["config", "user.email", "hehehe@example.test"]);
  await writeFile(path.join(repository, "tracked.txt"), "committed\n", "utf8");
  await git(repository, ["add", "tracked.txt"]);
  await git(repository, ["commit", "-m", "initial"]);
  t.after(() => rm(container, { recursive: true, force: true }));
  return { container, repository };
}

test("argument parser keeps task identity separate from date metadata", () => {
  const parsed = parseArguments([
    "plan",
    "--project",
    "C:\\work\\app",
    "--task",
    "Order error contract",
    "--date",
    "20260728",
    "--port-base",
    "4000",
    "--port-span",
    "500",
    "--json",
  ]);

  assert.equal(parsed.task, "Order error contract");
  assert.equal(parsed.date, "20260728");
  assert.equal(parsed.portBase, 4000);
  assert.equal(parsed.portSpan, 500);
  assert.equal(parsed.json, true);
  assert.throws(
    () => parseArguments(["create", "--task", "x", "--date", "20260230"]),
    /real calendar date/,
  );
});

test("task slug is stable and supports non-Latin task names", () => {
  assert.equal(normalizeTaskSlug("Order error contract"), "order-error-contract");
  assert.match(normalizeTaskSlug("주문 오류 개선"), /^task-[a-f0-9]{10}$/);
  assert.equal(normalizeTaskSlug("주문 오류 개선"), normalizeTaskSlug("주문 오류 개선"));
});

test("porcelain parser preserves branch and detached worktrees", () => {
  const parsed = parseWorktreePorcelain([
    "worktree C:/work/main",
    "HEAD abc",
    "branch refs/heads/main",
    "",
    "worktree C:/work/review",
    "HEAD def",
    "detached",
  ].join("\n"));

  assert.deepEqual(parsed.map((item) => item.branch), ["main", null]);
  assert.equal(parsed[1].detached, true);
});

test("plan uses a stable branch and date-labelled sibling path", async (t) => {
  const { repository } = await fixture(t);
  const first = await buildPlan({
    projectDir: repository,
    task: "Order error contract",
    date: "20260728",
  });
  const second = await buildPlan({
    projectDir: repository,
    task: "Order error contract",
    date: "20260729",
  });

  assert.equal(first.task_workspace.branch, "task/order-error-contract");
  assert.match(
    first.task_workspace.worktree.replaceAll("\\", "/"),
    /repo-worktrees\/20260728-order-error-contract$/,
  );
  assert.equal(first.runtime.workspace_id, second.runtime.workspace_id);
  assert.equal(first.runtime.suggested_port, second.runtime.suggested_port);
  assert.notEqual(first.task_workspace.worktree, second.task_workspace.worktree);
  assert.equal(first.source.dirty, false);
});

test("create registers a task branch and reuses it across dates", async (t) => {
  const { repository } = await fixture(t);
  const created = await createWorktree({
    projectDir: repository,
    task: "Order error contract",
    date: "20260728",
  });
  const worktreePath = created.task_workspace.worktree;

  assert.equal(created.result, "created");
  assert.equal(await git(worktreePath, ["branch", "--show-current"]), "task/order-error-contract");

  const reused = await createWorktree({
    projectDir: repository,
    task: "Order error contract",
    date: "20260729",
  });
  assert.equal(reused.result, "reused");
  assert.equal(path.resolve(reused.task_workspace.worktree), path.resolve(worktreePath));

  const status = await inspectRepository(repository);
  assert.ok(status.worktrees.some((item) => item.branch === "task/order-error-contract"));
});

test("dirty source requires acknowledgement and remains excluded", async (t) => {
  const { container, repository } = await fixture(t);
  await writeFile(path.join(repository, "tracked.txt"), "uncommitted\n", "utf8");
  const dirtyStatus = await inspectRepository(repository);
  assert.deepEqual(dirtyStatus.dirty_paths, ["tracked.txt"]);
  const worktreePath = path.join(container, "isolated-dirty");
  const options = {
    projectDir: repository,
    task: "Separate task",
    worktreePath,
    date: "20260728",
  };

  await assert.rejects(createWorktree(options), /Source worktree is dirty/);
  const created = await createWorktree({ ...options, allowDirtySource: true });

  assert.equal(created.source.dirty_changes_will_be_excluded, true);
  assert.equal(
    (await readFile(path.join(worktreePath, "tracked.txt"), "utf8")).replaceAll("\r\n", "\n"),
    "committed\n",
  );
  assert.equal(await readFile(path.join(repository, "tracked.txt"), "utf8"), "uncommitted\n");
});

test("task worktree path cannot be nested in the primary repository", async (t) => {
  const { repository } = await fixture(t);

  await assert.rejects(
    buildPlan({
      projectDir: repository,
      task: "Unsafe nested task",
      worktreePath: path.join(repository, ".worktrees", "unsafe"),
      date: "20260728",
    }),
    /outside the primary repository/,
  );
});

test("task worktree path cannot traverse a junction", async (t) => {
  const { container, repository } = await fixture(t);
  const actual = path.join(container, "actual-worktrees");
  const junction = path.join(container, "junction-worktrees");
  await mkdir(actual);
  await symlink(actual, junction, "junction");

  await assert.rejects(
    buildPlan({
      projectDir: repository,
      task: "Junction task",
      worktreePath: path.join(junction, "task"),
      date: "20260728",
    }),
    /symbolic link or junction/,
  );
});

test("resume owns task workspace isolation without a duplicate skill", async () => {
  const [fullResolve, resume, template, catalogText, manifestText] = await Promise.all([
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/full-resolve/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/resume/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/templates/done-criteria.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skill-catalog.json"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/.codex-plugin/plugin.json"), "utf8"),
  ]);
  const catalog = JSON.parse(catalogText);
  const manifest = JSON.parse(manifestText);

  assert.match(fullResolve, /hehehe:resume/);
  assert.match(resume, /scripts\/worktree-isolation\.mjs/);
  assert.match(template, /## Workspace Isolation/);
  assert.equal(catalog.skills.includes("worktree-isolation"), false);
  assert.equal(
    manifest.interface.defaultPrompt.some((prompt) =>
      prompt.includes("$hehehe:worktree-isolation")),
    false,
  );
});

test("resolve stays focused while full-resolve owns end-to-end delivery", async () => {
  const [resolve, fullResolve] = await Promise.all([
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/resolve/SKILL.md"), "utf8"),
    readFile(path.join(sourceRoot, "plugins/hehehe/skills/full-resolve/SKILL.md"), "utf8"),
  ]);

  assert.match(resolve, /focused repair loop/);
  assert.match(resolve, /Switch to `hehehe:full-resolve`/);
  assert.match(fullResolve, /end-to-end implementation/);
  assert.match(fullResolve, /Use `hehehe:resolve` instead/);
  assert.match(resolve, /Use `hehehe:resume` in automatic mode/);
  assert.match(fullResolve, /use `hehehe:resume` in automatic mode/);
});
