#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { isUtf8 } from "node:buffer";
import { createHash } from "node:crypto";
import {
  access,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MANIFEST_PATH = ".hehehe/knowledge.json";
const REQUIRED_PATHS = [
  "AGENTS.md",
  "docs/README.md",
  "docs/architecture/overview.md",
  MANIFEST_PATH,
];
const IGNORED_DIRECTORIES = new Set([
  ".git",
  ".hehehe",
  ".next",
  ".nuxt",
  ".output",
  ".venv",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "target",
  "vendor",
]);
const MANIFEST_NAMES = [
  "package.json",
  "pyproject.toml",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",
  "pom.xml",
  "build.gradle",
  "build.gradle.kts",
  "docker-compose.yml",
  "docker-compose.yaml",
];

async function exists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

function normalizeRelative(project, candidate, label) {
  const resolved = path.resolve(project, candidate);
  const relative = path.relative(project, resolved);
  if (
    relative === ".."
    || relative.startsWith(`..${path.sep}`)
    || path.isAbsolute(relative)
  ) {
    throw new Error(`${label} must stay inside the project: ${candidate}`);
  }
  return relative.replaceAll("\\", "/") || ".";
}

async function assertSafeExistingPath(project, absolutePath, label) {
  const details = await lstat(absolutePath);
  if (details.isSymbolicLink()) {
    throw new Error(`${label} must not be a symbolic link or junction: ${absolutePath}`);
  }
  const projectRealPath = await realpath(project);
  const candidateRealPath = await realpath(absolutePath);
  const relative = path.relative(projectRealPath, candidateRealPath);
  if (
    relative === ".."
    || relative.startsWith(`..${path.sep}`)
    || path.isAbsolute(relative)
  ) {
    throw new Error(`${label} resolves outside the project: ${absolutePath}`);
  }
  return details;
}

async function readJson(filePath, label) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    if (error instanceof SyntaxError) {
      throw new Error(`${label} is invalid JSON: ${filePath}`, { cause: error });
    }
    throw error;
  }
}

function validateManifest(value, manifestPath) {
  if (value === null) return null;
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`knowledge manifest must be a JSON object: ${manifestPath}`);
  }
  if (value.schema_version !== 1) {
    throw new Error(`knowledge manifest must declare schema_version=1: ${manifestPath}`);
  }
  if (!Array.isArray(value.documents)) {
    throw new Error(`knowledge manifest documents must be an array: ${manifestPath}`);
  }
  const seen = new Set();
  for (const entry of value.documents) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`knowledge manifest document entries must be objects: ${manifestPath}`);
    }
    if (typeof entry.path !== "string" || !entry.path.endsWith(".md")) {
      throw new Error(`knowledge document path must be a Markdown file: ${manifestPath}`);
    }
    if (seen.has(entry.path)) {
      throw new Error(`duplicate knowledge document path "${entry.path}": ${manifestPath}`);
    }
    seen.add(entry.path);
    if (typeof entry.kind !== "string" || entry.kind.length === 0) {
      throw new Error(`knowledge document kind is required for ${entry.path}`);
    }
    if (
      !Array.isArray(entry.source_paths)
      || entry.source_paths.length === 0
      || entry.source_paths.some((source) => typeof source !== "string" || source.length === 0)
    ) {
      throw new Error(`knowledge document source_paths are required for ${entry.path}`);
    }
    if (
      typeof entry.last_verified !== "string"
      || Number.isNaN(Date.parse(entry.last_verified))
    ) {
      throw new Error(`knowledge document last_verified is invalid for ${entry.path}`);
    }
    if (
      typeof entry.source_fingerprint !== "string"
      || !/^[a-f0-9]{64}$/.test(entry.source_fingerprint)
    ) {
      throw new Error(`knowledge document source_fingerprint is invalid for ${entry.path}`);
    }
  }
  return value;
}

async function walkFiles(directory, project, results, limit = 10000) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await walkFiles(absolutePath, project, results, limit);
    } else if (entry.isFile()) {
      results.push({
        absolutePath,
        relativePath: path.relative(project, absolutePath).replaceAll("\\", "/"),
      });
      if (results.length > limit) {
        throw new Error(`source fingerprint exceeds ${limit} files; use narrower source paths`);
      }
    }
  }
}

async function sourceFiles(project, sourcePaths) {
  const files = [];
  for (const candidate of [...new Set(sourcePaths)].sort()) {
    const relativePath = normalizeRelative(project, candidate, "knowledge source path");
    const absolutePath = path.resolve(project, relativePath);
    if (!(await exists(absolutePath))) {
      throw new Error(`knowledge source path does not exist: ${relativePath}`);
    }
    const sourceStat = await assertSafeExistingPath(
      project,
      absolutePath,
      "knowledge source path",
    );
    if (sourceStat.isDirectory()) {
      await walkFiles(absolutePath, project, files);
    } else if (sourceStat.isFile()) {
      files.push({ absolutePath, relativePath });
    }
  }
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function hasGitMetadata(project) {
  let directory = project;
  while (true) {
    const metadataPath = path.join(directory, ".git");
    let metadata;
    try {
      metadata = await lstat(metadataPath);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    if (metadata) {
      // Links count even if dangling: access() would hide their presence and
      // incorrectly permit text normalization when Git cannot read attributes.
      if (metadata.isSymbolicLink()) return true;
      if (metadata.isDirectory() && await exists(path.join(metadataPath, "HEAD"))) return true;
      if (metadata.isFile() && /^gitdir:\s*\S/m.test(await readFile(metadataPath, "utf8"))) return true;
    }
    const parent = path.dirname(directory);
    if (parent === directory) return false;
    directory = parent;
  }
}

async function byteSensitiveSources(project, files) {
  if (files.length === 0) return new Set();
  const paths = [...new Set(files.map((file) => file.relativePath))];
  // One NUL-delimited query handles nested attributes and Git's binary macro
  // without spawning Git for every source file or interpreting paths as options.
  const result = spawnSync("git", ["-C", project, "check-attr", "-z", "--stdin", "text", "binary"], {
    input: paths.join("\0") + "\0",
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 32 * 1024 * 1024,
    timeout: 10000,
    env: { ...process.env, LC_ALL: "C" },
  });
  if (result.error || result.status !== 0) {
    const unavailable = result.error?.code === "ENOENT"
      || (result.status === 128 && result.stderr?.includes("not a git repository"));
    if (unavailable && !await hasGitMetadata(project)) return new Set();
    throw new Error(`Could not inspect knowledge source text/binary attributes: ${result.error?.message ?? result.stderr?.trim() ?? result.status}`);
  }
  const attributes = new Map(paths.map((file) => [file, new Map()]));
  const fields = result.stdout.split("\0");
  if (fields.pop() !== "" || fields.length % 3 !== 0) {
    throw new Error("Invalid Git attribute response for knowledge sources");
  }
  for (let index = 0; index < fields.length; index += 3) {
    const [file, attribute, value] = fields.slice(index, index + 3);
    const entry = attributes.get(file);
    if (!entry || !["text", "binary"].includes(attribute) || entry.has(attribute)) {
      throw new Error("Unexpected Git attribute response for knowledge sources");
    }
    entry.set(attribute, value);
  }
  const sensitive = new Set();
  for (const [file, entry] of attributes) {
    if (entry.size !== 2) throw new Error(`Missing Git text/binary attributes for knowledge source: ${file}`);
    if (entry.get("text") === "unset" || !["unspecified", "unset"].includes(entry.get("binary"))) sensitive.add(file);
  }
  return sensitive;
}

export async function fingerprintSources(projectDir, sourcePaths) {
  const project = path.resolve(projectDir);
  const normalizedSources = sourcePaths
    .map((candidate) => normalizeRelative(project, candidate, "knowledge source path"))
    .sort();
  const hash = createHash("sha256");
  for (const source of normalizedSources) {
    hash.update(`source:${source}\0`);
  }
  const files = await sourceFiles(project, normalizedSources);
  const byteSensitive = await byteSensitiveSources(project, files);
  for (const file of files) {
    hash.update(`file:${file.relativePath}\0`);
    const contents = await readFile(file.absolutePath);
    // Canonicalize UTF-8 text only. Binary attributes, NUL and invalid UTF-8
    // retain exact bytes; BOM, lone CR and final-newline changes remain visible.
    hash.update(!byteSensitive.has(file.relativePath) && !contents.includes(0) && isUtf8(contents)
      ? contents.toString("utf8").replaceAll("\r\n", "\n") : contents);
    hash.update("\0");
  }
  return hash.digest("hex");
}

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

function gitChangedPaths(project) {
  const result = spawnSync(
    "git",
    ["-C", project, "status", "--short", "--untracked-files=all"],
    { encoding: "utf8", windowsHide: true },
  );
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean)
    .sort();
}

export async function inventoryProject(projectDir = process.cwd()) {
  const project = path.resolve(projectDir);
  if (!(await exists(project)) || !(await stat(project)).isDirectory()) {
    throw new Error(`project directory does not exist: ${project}`);
  }
  const topLevel = (await readdir(project, { withFileTypes: true }))
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => ({
      name: entry.name,
      type: entry.isDirectory() ? "directory" : entry.isFile() ? "file" : "other",
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
  const manifests = [];
  for (const name of MANIFEST_NAMES) {
    if (await exists(path.join(project, name))) manifests.push(name);
  }
  const docsPath = path.join(project, "docs");
  const documents = [];
  if (await exists(docsPath)) {
    await assertSafeExistingPath(project, docsPath, "docs directory");
    const files = [];
    await walkFiles(docsPath, project, files);
    documents.push(
      ...files
        .map((file) => file.relativePath)
        .filter((file) => file.toLowerCase().endsWith(".md")),
    );
  }
  return {
    schema_version: 1,
    project,
    baseline: Object.fromEntries(
      await Promise.all(
        REQUIRED_PATHS.map(async (relativePath) => [
          relativePath,
          await exists(path.join(project, relativePath)),
        ]),
      ),
    ),
    manifests,
    top_level: topLevel,
    markdown_documents: documents.sort(),
    changed_paths: gitChangedPaths(project),
  };
}

function markdownLinkTargets(content) {
  const markdown = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/~~~[\s\S]*?~~~/g, "")
    .replace(/`[^`\r\n]*`/g, "");
  const targets = [];
  let cursor = 0;
  while (cursor < markdown.length) {
    const start = markdown.indexOf("](", cursor);
    if (start === -1) break;
    let depth = 1;
    let escaped = false;
    let end = start + 2;
    for (; end < markdown.length; end += 1) {
      const character = markdown[end];
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === "(") {
        depth += 1;
      } else if (character === ")") {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    if (depth !== 0) break;
    targets.push(markdown.slice(start + 2, end));
    cursor = end + 1;
  }
  const definitionPattern = /^\s*\[[^\]]+]:\s*(\S+)/gm;
  for (const match of markdown.matchAll(definitionPattern)) {
    targets.push(match[1]);
  }
  return targets.map((rawTarget) => {
    let target = rawTarget.trim();
    if (target.startsWith("<")) {
      const close = target.indexOf(">");
      if (close !== -1) target = target.slice(1, close);
    } else {
      target = target.split(/\s+(?=["'])/)[0];
    }
    return target;
  }).filter(Boolean);
}

function localLinkPath(project, documentPath, target) {
  if (
    target.startsWith("#")
    || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(target)
  ) {
    return null;
  }
  let pathname = target.split("#", 1)[0].split("?", 1)[0];
  if (!pathname) return null;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    // Keep the literal path so the missing-link report remains actionable.
  }
  const resolved = pathname.startsWith("/")
    ? path.resolve(project, `.${pathname}`)
    : path.resolve(path.dirname(documentPath), pathname);
  const relative = path.relative(project, resolved);
  if (
    relative === ".."
    || relative.startsWith(`..${path.sep}`)
    || path.isAbsolute(relative)
  ) {
    return { outside: true, absolutePath: resolved, relativePath: pathname };
  }
  return {
    outside: false,
    absolutePath: resolved,
    relativePath: relative.replaceAll("\\", "/"),
  };
}

async function collectDocumentLinks(project, relativePath) {
  const absolutePath = path.join(project, relativePath);
  if (!(await exists(absolutePath))) return [];
  await assertSafeExistingPath(project, absolutePath, "knowledge document");
  const content = await readFile(absolutePath, "utf8");
  return markdownLinkTargets(content)
    .map((target) => ({
      target,
      resolved: localLinkPath(project, absolutePath, target),
    }))
    .filter((link) => link.resolved !== null);
}

function addIssue(issues, severity, code, issuePath, message) {
  issues.push({ severity, code, path: issuePath, message });
}

export async function checkKnowledge({
  projectDir = process.cwd(),
  maxAgeDays = 90,
} = {}) {
  const project = path.resolve(projectDir);
  const issues = [];
  for (const relativePath of REQUIRED_PATHS) {
    if (!(await exists(path.join(project, relativePath)))) {
      addIssue(
        issues,
        "error",
        "missing_baseline",
        relativePath,
        `required knowledge baseline is missing: ${relativePath}`,
      );
    }
  }

  const manifestPath = path.join(project, MANIFEST_PATH);
  let manifest = null;
  try {
    manifest = validateManifest(
      await readJson(manifestPath, "knowledge manifest"),
      manifestPath,
    );
  } catch (error) {
    addIssue(issues, "error", "invalid_manifest", MANIFEST_PATH, error.message);
  }

  const inventory = await inventoryProject(project);
  const linkDocuments = new Set([
    "AGENTS.md",
    ...inventory.markdown_documents,
  ]);
  const linkedFromIndex = new Set();
  const documentLinks = new Map();
  for (const document of [...linkDocuments].sort()) {
    let links;
    try {
      links = await collectDocumentLinks(project, document);
      documentLinks.set(document, links);
    } catch (error) {
      addIssue(issues, "error", "unsafe_document", document, error.message);
      continue;
    }
    for (const link of links) {
      if (link.resolved.outside) {
        addIssue(
          issues,
          "warning",
          "outside_link",
          document,
          `local link leaves the project: ${link.target}`,
        );
      } else if (!(await exists(link.resolved.absolutePath))) {
        addIssue(
          issues,
          "error",
          "broken_link",
          document,
          `local link target does not exist: ${link.target}`,
        );
      } else {
        try {
          await assertSafeExistingPath(
            project,
            link.resolved.absolutePath,
            "local link target",
          );
          if (document === "docs/README.md") {
            linkedFromIndex.add(link.resolved.relativePath);
          }
        } catch (error) {
          addIssue(
            issues,
            "error",
            "unsafe_link_target",
            document,
            error.message,
          );
        }
      }
    }
  }

  const tracked = new Set();
  if (manifest) {
    for (const entry of manifest.documents) {
      let documentPath;
      try {
        documentPath = normalizeRelative(project, entry.path, "knowledge document");
      } catch (error) {
        addIssue(issues, "error", "outside_document", entry.path, error.message);
        continue;
      }
      tracked.add(documentPath);
      if (!(await exists(path.join(project, documentPath)))) {
        addIssue(
          issues,
          "error",
          "missing_document",
          documentPath,
          "tracked knowledge document does not exist",
        );
        continue;
      }
      if (documentPath !== "docs/README.md" && !linkedFromIndex.has(documentPath)) {
        addIssue(
          issues,
          "warning",
          "not_in_index",
          documentPath,
          "tracked knowledge document is not linked directly from docs/README.md",
        );
      }
      try {
        const fingerprint = await fingerprintSources(project, entry.source_paths);
        if (fingerprint !== entry.source_fingerprint) {
          addIssue(
            issues,
            "error",
            "stale_sources",
            documentPath,
            `source fingerprint changed: ${entry.source_paths.join(", ")}`,
          );
        }
      } catch (error) {
        addIssue(issues, "error", "invalid_source", documentPath, error.message);
      }
      const ageMilliseconds = Date.now() - Date.parse(entry.last_verified);
      if (ageMilliseconds > maxAgeDays * 24 * 60 * 60 * 1000) {
        addIssue(
          issues,
          "warning",
          "verification_age",
          documentPath,
          `last verified more than ${maxAgeDays} days ago`,
        );
      }
    }
  }

  for (const document of inventory.markdown_documents) {
    if (!tracked.has(document)) {
      addIssue(
        issues,
        "warning",
        "untracked_document",
        document,
        "Markdown document is not tracked in the knowledge manifest",
      );
    }
  }

  const agentsLinks = documentLinks.get("AGENTS.md") ?? [];
  if (
    await exists(path.join(project, "AGENTS.md"))
    && !agentsLinks.some((link) => link.resolved?.relativePath === "docs/README.md")
  ) {
    addIssue(
      issues,
      "warning",
      "agents_missing_index",
      "AGENTS.md",
      "AGENTS.md does not link to docs/README.md",
    );
  }

  const counts = {
    errors: issues.filter((issue) => issue.severity === "error").length,
    warnings: issues.filter((issue) => issue.severity === "warning").length,
  };
  return {
    schema_version: 1,
    checked_at: new Date().toISOString(),
    project,
    status: counts.errors > 0 ? "STALE" : counts.warnings > 0 ? "WARN" : "FRESH",
    counts,
    tracked_documents: manifest?.documents.length ?? 0,
    issues,
  };
}

export async function recordKnowledge({
  projectDir = process.cwd(),
  document,
  kind = "knowledge",
  sourcePaths,
} = {}) {
  const project = path.resolve(projectDir);
  if (!document) throw new Error("--doc is required");
  if (!Array.isArray(sourcePaths) || sourcePaths.length === 0) {
    throw new Error("at least one --source is required");
  }
  const documentPath = normalizeRelative(project, document, "knowledge document");
  if (!documentPath.endsWith(".md")) {
    throw new Error(`knowledge document must be Markdown: ${documentPath}`);
  }
  if (!(await exists(path.join(project, documentPath)))) {
    throw new Error(`knowledge document does not exist: ${documentPath}`);
  }
  await assertSafeExistingPath(
    project,
    path.join(project, documentPath),
    "knowledge document",
  );
  const normalizedSources = [...new Set(
    sourcePaths.map((source) => normalizeRelative(project, source, "knowledge source path")),
  )].sort();
  const sourceFingerprint = await fingerprintSources(project, normalizedSources);
  const manifestPath = path.join(project, MANIFEST_PATH);
  const previous = validateManifest(
    await readJson(manifestPath, "knowledge manifest"),
    manifestPath,
  ) ?? {
    schema_version: 1,
    updated_at: null,
    documents: [],
  };
  const entry = {
    path: documentPath,
    kind,
    source_paths: normalizedSources,
    last_verified: new Date().toISOString(),
    source_fingerprint: sourceFingerprint,
  };
  const documents = previous.documents
    .filter((candidate) => candidate.path !== documentPath)
    .concat(entry)
    .sort((left, right) => left.path.localeCompare(right.path));
  const manifest = {
    schema_version: 1,
    updated_at: new Date().toISOString(),
    documents,
  };
  await writeJsonAtomic(manifestPath, manifest);
  return { manifest_path: manifestPath, entry, document_count: documents.length };
}

export function formatCheck(result) {
  const lines = [
    `Repository knowledge: ${result.status}`,
    `Tracked documents: ${result.tracked_documents}`,
    `Errors: ${result.counts.errors}`,
    `Warnings: ${result.counts.warnings}`,
  ];
  for (const issue of result.issues) {
    lines.push(
      `${issue.severity.toUpperCase()} ${issue.code} ${issue.path}: ${issue.message}`,
    );
  }
  return `${lines.join("\n")}\n`;
}

export function parseArguments(argv) {
  const command = argv[0];
  if (!["inventory", "record", "check", "status"].includes(command)) {
    throw new Error(
      "usage: knowledge-system.mjs <inventory|record|check|status> [options]",
    );
  }
  const options = {
    command,
    projectDir: process.cwd(),
    sourcePaths: [],
    json: false,
    maxAgeDays: 90,
  };
  for (let index = 1; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--json") {
      options.json = true;
      continue;
    }
    if (["--project", "--doc", "--kind", "--source", "--max-age-days"].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) throw new Error(`${argument} requires a value`);
      if (argument === "--project") options.projectDir = value;
      if (argument === "--doc") options.document = value;
      if (argument === "--kind") options.kind = value;
      if (argument === "--source") options.sourcePaths.push(value);
      if (argument === "--max-age-days") {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < 1) {
          throw new Error("--max-age-days must be a positive integer");
        }
        options.maxAgeDays = parsed;
      }
      index += 1;
      continue;
    }
    throw new Error(`unknown argument: ${argument}`);
  }
  return options;
}

export async function runCli(argv) {
  const options = parseArguments(argv);
  let result;
  if (options.command === "inventory") {
    result = await inventoryProject(options.projectDir);
  } else if (options.command === "record") {
    result = await recordKnowledge(options);
  } else {
    result = await checkKnowledge(options);
  }
  if (options.json || options.command === "inventory" || options.command === "record") {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write(formatCheck(result));
  }
  if (options.command === "check" && result.counts.errors > 0) {
    process.exitCode = 1;
  }
  return result;
}

const isMain = process.argv[1]
  && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isMain) {
  runCli(process.argv.slice(2)).catch((error) => {
    process.stderr.write(`repository-knowledge: ${error.message}\n`);
    process.exitCode = 2;
  });
}
