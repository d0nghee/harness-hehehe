#!/usr/bin/env node

import { execFile } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);

const SOURCE_EXTENSIONS = new Set([
  ".c", ".cc", ".cpp", ".cs", ".css", ".go", ".html", ".java", ".js",
  ".jsx", ".kt", ".kts", ".mjs", ".php", ".py", ".rb", ".rs", ".scss",
  ".svelte", ".swift", ".ts", ".tsx", ".vue",
]);

const IGNORED_DIRECTORIES = new Set([
  ".git", ".hehehe", ".next", ".nuxt", ".output", ".turbo", "build",
  "coverage", "dist", "node_modules", "out", "target", "vendor",
]);

export function parseArgs(argv) {
  const args = {
    command: null,
    project: process.cwd(),
    sinceDays: 90,
    limit: 20,
    json: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!args.command && !value.startsWith("-")) {
      args.command = value;
    } else if (value === "--project") {
      args.project = argv[++index];
    } else if (value === "--since-days") {
      args.sinceDays = Number.parseInt(argv[++index], 10);
    } else if (value === "--limit") {
      args.limit = Number.parseInt(argv[++index], 10);
    } else if (value === "--json") {
      args.json = true;
    } else {
      throw new Error(`unknown argument: ${value}`);
    }
  }

  if (args.command !== "scan") {
    throw new Error("usage: maintenance-audit.mjs scan --project <root> [--since-days 90] [--limit 20] [--json]");
  }
  if (!args.project) throw new Error("--project requires a path");
  if (!Number.isInteger(args.sinceDays) || args.sinceDays < 1 || args.sinceDays > 3650) {
    throw new Error("--since-days must be an integer from 1 to 3650");
  }
  if (!Number.isInteger(args.limit) || args.limit < 1 || args.limit > 200) {
    throw new Error("--limit must be an integer from 1 to 200");
  }
  return args;
}

async function runGit(project, args) {
  try {
    const { stdout } = await execFileAsync("git", ["-C", project, ...args], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      windowsHide: true,
    });
    return stdout;
  } catch {
    return "";
  }
}

export async function discoverSourceFiles(root) {
  const files = [];

  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!IGNORED_DIRECTORIES.has(entry.name)) await walk(absolute);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(absolute);
      }
    }
  }

  await walk(root);
  return files;
}

export function parseNumstat(output) {
  const churn = new Map();
  for (const line of output.split(/\r?\n/)) {
    const match = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (!match) continue;
    const additions = match[1] === "-" ? 0 : Number.parseInt(match[1], 10);
    const deletions = match[2] === "-" ? 0 : Number.parseInt(match[2], 10);
    const normalized = match[3].replaceAll("\\", "/");
    churn.set(normalized, (churn.get(normalized) ?? 0) + additions + deletions);
  }
  return churn;
}

export function scoreHotspot({ lines, churn, markers, dirty }) {
  let score = 0;
  const reasons = [];

  if (lines >= 1000) {
    score += 4;
    reasons.push("very-large-file");
  } else if (lines >= 600) {
    score += 3;
    reasons.push("large-file");
  } else if (lines >= 350) {
    score += 2;
    reasons.push("growing-file");
  } else if (lines >= 200) {
    score += 1;
    reasons.push("moderate-size");
  }

  if (churn >= 1500) {
    score += 4;
    reasons.push("very-high-churn");
  } else if (churn >= 600) {
    score += 3;
    reasons.push("high-churn");
  } else if (churn >= 200) {
    score += 2;
    reasons.push("repeated-churn");
  } else if (churn >= 50) {
    score += 1;
    reasons.push("recent-churn");
  }

  if (markers >= 10) {
    score += 2;
    reasons.push("many-maintenance-markers");
  } else if (markers >= 3) {
    score += 1;
    reasons.push("maintenance-markers");
  }

  if (dirty) {
    score += 1;
    reasons.push("currently-changing");
  }

  return { score: Math.min(score, 10), reasons };
}

async function inspectFile(root, absolute, churn, dirtyPaths) {
  const relative = path.relative(root, absolute).replaceAll("\\", "/");
  const content = await readFile(absolute, "utf8");
  const lines = content.length === 0 ? 0 : content.split(/\r?\n/).length;
  const markers = (
    content.match(/(?:\/\/|#|\/\*|\*)\s*(?:TODO|FIXME|HACK|XXX)\b/g) ?? []
  ).length;
  const dirty = [...dirtyPaths].some(
    (dirtyPath) =>
      dirtyPath === relative ||
      (dirtyPath.endsWith("/") && relative.startsWith(dirtyPath)),
  );
  const recentChurn = churn.get(relative) ?? 0;
  const ranking = scoreHotspot({ lines, churn: recentChurn, markers, dirty });
  return {
    path: relative,
    score: ranking.score,
    reasons: ranking.reasons,
    lines,
    recent_churn: recentChurn,
    maintenance_markers: markers,
    dirty,
  };
}

export async function buildReport(project, options = {}) {
  const root = path.resolve(project);
  const rootStat = await stat(root);
  if (!rootStat.isDirectory()) throw new Error(`project is not a directory: ${root}`);

  const sinceDays = options.sinceDays ?? 90;
  const limit = options.limit ?? 20;
  const [files, numstat, porcelain, branch, head] = await Promise.all([
    discoverSourceFiles(root),
    runGit(root, ["log", `--since=${sinceDays}.days`, "--numstat", "--format="]),
    runGit(root, ["status", "--porcelain=v1"]),
    runGit(root, ["branch", "--show-current"]),
    runGit(root, ["rev-parse", "HEAD"]),
  ]);

  const churn = parseNumstat(numstat);
  const dirtyPaths = new Set(
    porcelain
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => line.slice(3).split(" -> ").at(-1).replaceAll("\\", "/")),
  );
  const inspected = await Promise.all(
    files.map((file) => inspectFile(root, file, churn, dirtyPaths)),
  );
  const hotspots = inspected
    .filter((item) => item.score > 0)
    .sort((left, right) =>
      right.score - left.score ||
      right.recent_churn - left.recent_churn ||
      right.lines - left.lines ||
      left.path.localeCompare(right.path))
    .slice(0, limit);
  const topScore = hotspots[0]?.score ?? 0;
  const status = topScore >= 7 ? "ACTION" : topScore >= 4 ? "WATCH" : "PASS";

  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    project: root,
    git: {
      branch: branch.trim() || null,
      head: head.trim() || null,
      dirty: dirtyPaths.size > 0,
      dirty_paths: [...dirtyPaths].sort(),
      churn_window_days: sinceDays,
    },
    inventory: {
      source_files: files.length,
      total_lines: inspected.reduce((sum, item) => sum + item.lines, 0),
      maintenance_markers: inspected.reduce(
        (sum, item) => sum + item.maintenance_markers,
        0,
      ),
    },
    status,
    top_score: topScore,
    hotspots,
    interpretation: "Ranking evidence only; verify responsibility, references, tests, and runtime ownership before refactoring or deletion.",
  };
}

function formatReport(report) {
  const lines = [
    `maintenance audit: ${report.status}`,
    `project: ${report.project}`,
    `source files: ${report.inventory.source_files}`,
    `total lines: ${report.inventory.total_lines}`,
    `top score: ${report.top_score}/10`,
  ];
  for (const hotspot of report.hotspots) {
    lines.push(
      `${hotspot.score}/10 ${hotspot.path} (${hotspot.lines} lines, ${hotspot.recent_churn} churn) ${hotspot.reasons.join(", ")}`,
    );
  }
  lines.push(report.interpretation);
  return lines.join("\n");
}

export async function runCli(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const report = await buildReport(args.project, {
    sinceDays: args.sinceDays,
    limit: args.limit,
  });
  process.stdout.write(`${args.json ? JSON.stringify(report, null, 2) : formatReport(report)}\n`);
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(scriptPath)) {
  runCli().catch((error) => {
    console.error(`maintenance-audit failed: ${error.message}`);
    process.exitCode = 1;
  });
}
