import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import cp from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import fsp, { access, lstat, mkdtemp, mkdir, readFile, rm, rmdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkKnowledge, fingerprintSources, recordKnowledge } from "../plugins/hehehe/skills/repository-knowledge/scripts/knowledge-system.mjs";

function git(project, ...args) {
  return cp.execFileSync("git", ["-C", project, ...args], {
    encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}
async function put(project, file, contents) {
  const target = path.join(project, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}
async function fixture(t, useGit = false) {
  const container = await mkdtemp(path.join(os.tmpdir(), "hehehe-knowledge-portable-"));
  t.after(() => rm(container, { recursive: true, force: true }));
  const project = path.join(container, "project");
  await mkdir(project);
  if (useGit) {
    git(project, "init", "-b", "main");
    git(project, "config", "user.name", "Knowledge Fixture");
    git(project, "config", "user.email", "knowledge@example.test");
    git(project, "config", "core.autocrlf", "false");
    git(project, "config", "maintenance.auto", "false");
    git(project, "config", "gc.auto", "0");
  }
  return { container, project };
}
async function baseline(project) {
  await put(project, "AGENTS.md", "# Guide\n\nSee [knowledge](docs/README.md).\n");
  await put(project, "docs/README.md", "# Knowledge\n\n- [Architecture](architecture/overview.md)\n");
  await put(project, "docs/architecture/overview.md", "# Architecture\n\nSource is under src.\n");
  await put(project, "package.json", '{"name":"knowledge-portability"}\n');
  await put(project, "src/index.js", "export const value = 1;\n// café 한국어\n");
  await recordKnowledge({ projectDir: project, document: "docs/README.md", kind: "index", sourcePaths: ["package.json"] });
  await recordKnowledge({ projectDir: project, document: "docs/architecture/overview.md", kind: "architecture", sourcePaths: ["src"] });
}
function staleArchitecture(result) {
  assert.equal(result.status, "STALE");
  assert.ok(result.issues.some((issue) => issue.code === "stale_sources" && issue.path === "docs/architecture/overview.md"));
}

test("clean LF and CRLF Git clones share a fingerprint and remain FRESH; real edits are STALE", async (t) => {
  const { container, project } = await fixture(t, true);
  await put(project, ".gitattributes", "* text=auto\n");
  await baseline(project);
  git(project, "add", "."); git(project, "commit", "-m", "reviewed knowledge");
  const lf = path.join(container, "lf"), crlf = path.join(container, "crlf");
  git(project, "clone", "--config", "core.autocrlf=false", "--config", "core.eol=lf", project, lf);
  git(project, "clone", "--config", "core.autocrlf=true", "--config", "core.eol=crlf", project, crlf);
  assert.equal(git(lf, "status", "--porcelain"), "");
  assert.equal(git(crlf, "status", "--porcelain"), "");
  assert.equal((await readFile(path.join(lf, "src/index.js"))).includes(Buffer.from("\r\n")), false);
  assert.equal((await readFile(path.join(crlf, "src/index.js"))).includes(Buffer.from("\r\n")), true);
  assert.equal(await fingerprintSources(lf, ["src"]), await fingerprintSources(crlf, ["src"]));
  assert.equal((await checkKnowledge({ projectDir: lf })).status, "FRESH");
  assert.equal((await checkKnowledge({ projectDir: crlf })).status, "FRESH");
  await put(crlf, "src/index.js", "export const value = 2;\r\n// café 한국어\r\n");
  staleArchitecture(await checkKnowledge({ projectDir: crlf }));
});

test("Git -text and binary attributes preserve exact bytes even for valid UTF-8 without NUL", async (t) => {
  const { project } = await fixture(t, true);
  await baseline(project);
  await put(project, ".gitattributes", "src/*.raw -text\nsrc/*.bin binary\n");
  for (const file of ["src/payload.raw", "src/payload.bin"]) {
    await put(project, file, "payload\r\nsecond\r\n");
    await recordKnowledge({ projectDir: project, document: "docs/architecture/overview.md", kind: "architecture", sourcePaths: ["src"] });
    assert.equal((await checkKnowledge({ projectDir: project })).status, "FRESH");
    const recorded = await fingerprintSources(project, [file]);
    await put(project, file, "payload\nsecond\n");
    assert.notEqual(await fingerprintSources(project, [file]), recorded);
    staleArchitecture(await checkKnowledge({ projectDir: project }));
  }
});

test("NUL and invalid UTF-8 payloads remain byte-sensitive without binary attributes", async (t) => {
  const { project } = await fixture(t);
  await baseline(project);
  for (const [before, after] of [
    [Buffer.from([65, 0, 13, 10, 66]), Buffer.from([65, 0, 10, 66])],
    [Buffer.from([0xff, 13, 10, 65]), Buffer.from([0xff, 10, 65])],
    [Buffer.from([0xff, 13, 10]), Buffer.from([0xfe, 13, 10])],
  ]) {
    await put(project, "src/payload.dat", before);
    await recordKnowledge({ projectDir: project, document: "docs/architecture/overview.md", kind: "architecture", sourcePaths: ["src"] });
    assert.equal((await checkKnowledge({ projectDir: project })).status, "FRESH");
    await put(project, "src/payload.dat", after);
    staleArchitecture(await checkKnowledge({ projectDir: project }));
  }
});

test("nested Git attributes apply to source paths containing spaces and Unicode", async (t) => {
  const { project } = await fixture(t, true);
  await put(project, ".gitattributes", "* text=auto\n");
  await put(project, "src/nested/.gitattributes", "*.raw -text\n");
  const file = "src/nested/한국어 payload.raw";
  await put(project, file, "payload\r\n");
  const before = await fingerprintSources(project, [file]);
  await put(project, file, "payload\n");
  assert.notEqual(await fingerprintSources(project, [file]), before);
});

test("non-Git knowledge works without Git on PATH and canonicalizes UTF-8 text only", async (t) => {
  const { container, project } = await fixture(t);
  const originalPath = process.env.PATH;
  process.env.PATH = path.join(container, "no-git-binaries");
  try {
    await baseline(project);
    const before = await fingerprintSources(project, ["src"]);
    const text = await readFile(path.join(project, "src/index.js"), "utf8");
    await put(project, "src/index.js", text.replaceAll("\n", "\r\n"));
    assert.equal(await fingerprintSources(project, ["src"]), before);
    assert.equal((await checkKnowledge({ projectDir: project })).status, "FRESH");
    await put(project, "src/index.js", "export const value = 3;\n");
    staleArchitecture(await checkKnowledge({ projectDir: project }));
  } finally {
    if (originalPath === undefined) delete process.env.PATH; else process.env.PATH = originalPath;
  }
});

test("missing Git cannot silently ignore binary attributes in an existing checkout", async (t) => {
  const { container, project } = await fixture(t, true);
  await put(project, ".gitattributes", "*.raw -text\n");
  await put(project, "payload.raw", "payload\r\n");
  const originalPath = process.env.PATH;
  process.env.PATH = path.join(container, "no-git-binaries");
  try {
    await assert.rejects(fingerprintSources(project, ["payload.raw"]), /Could not inspect knowledge source text\/binary attributes/);
  } finally {
    if (originalPath === undefined) delete process.env.PATH; else process.env.PATH = originalPath;
  }
});

test("linked Git metadata cannot fall back to non-Git normalization when Git is unavailable", async (t) => {
  const { container, project } = await fixture(t);
  const metadataSource = path.join(container, "metadata-source");
  await mkdir(metadataSource);
  git(metadataSource, "init", "-b", "main");
  await symlink(path.join(metadataSource, ".git"), path.join(project, ".git"), "junction");
  assert.equal((await lstat(path.join(project, ".git"))).isSymbolicLink(), true);
  await baseline(project);
  await put(project, ".gitattributes", "src/payload.raw -text\n");
  await put(project, "src/payload.raw", "payload\n");
  await recordKnowledge({ projectDir: project, document: "docs/architecture/overview.md", kind: "architecture", sourcePaths: ["src"] });
  const before = await fingerprintSources(project, ["src/payload.raw"]);
  await put(project, "src/payload.raw", "payload\r\n");
  assert.notEqual(await fingerprintSources(project, ["src/payload.raw"]), before);
  const originalPath = process.env.PATH;
  process.env.PATH = path.join(container, "no-git-binaries");
  try {
    await assert.rejects(fingerprintSources(project, ["src/payload.raw"]), /Could not inspect knowledge source text\/binary attributes/);
    assert.equal((await checkKnowledge({ projectDir: project })).status, "STALE");
  } finally {
    if (originalPath === undefined) delete process.env.PATH; else process.env.PATH = originalPath;
  }
});

test("dangling Git metadata remains detectable even when access reports ENOENT", async (t) => {
  const { container, project } = await fixture(t);
  await put(project, "source.txt", "source\r\n");
  const missingMetadata = path.join(container, "missing-metadata");
  await mkdir(missingMetadata);
  await symlink(missingMetadata, path.join(project, ".git"), "junction");
  await rmdir(missingMetadata);
  assert.equal((await lstat(path.join(project, ".git"))).isSymbolicLink(), true);
  await assert.rejects(access(missingMetadata), { code: "ENOENT" });
  // Windows may report access(F_OK) on the reparse entry itself as successful.
  // Exercise the POSIX/failed-target ENOENT path on every platform as well.
  const originalAccess = fsp.access;
  fsp.access = async (target, ...args) => {
    if (path.resolve(target) === path.join(project, ".git")) {
      throw Object.assign(new Error("dangling Git metadata target"), { code: "ENOENT" });
    }
    return originalAccess(target, ...args);
  };
  syncBuiltinESMExports();
  const originalPath = process.env.PATH;
  try {
    await assert.rejects(access(path.join(project, ".git")), { code: "ENOENT" });
    await assert.rejects(fingerprintSources(project, ["source.txt"]), /Could not inspect knowledge source text\/binary attributes/);
    process.env.PATH = path.join(container, "no-git-binaries");
    await assert.rejects(fingerprintSources(project, ["source.txt"]), /Could not inspect knowledge source text\/binary attributes/);
  } finally {
    if (originalPath === undefined) delete process.env.PATH; else process.env.PATH = originalPath;
    fsp.access = originalAccess;
    syncBuiltinESMExports();
  }
});

test("BOM, lone CR and final newline edits are preserved rather than normalized away", async (t) => {
  const { project } = await fixture(t);
  for (const [before, after] of [["\uFEFFvalue\r\n", "value\n"], ["value\r", "value\n"], ["value\n", "value"]]) {
    await put(project, "source.txt", before);
    const fingerprint = await fingerprintSources(project, ["source.txt"]);
    await put(project, "source.txt", after);
    assert.notEqual(await fingerprintSources(project, ["source.txt"]), fingerprint);
  }
});

test("legacy schema-1 CRLF fingerprints become STALE without silent refresh; explicit re-record restores freshness", async (t) => {
  const { project } = await fixture(t);
  await baseline(project);
  const text = "export const value = 1;\r\n// café 한국어\r\n";
  await put(project, "src/index.js", text);
  const manifestPath = path.join(project, ".hehehe/knowledge.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const architecture = manifest.documents.find((entry) => entry.kind === "architecture");
  architecture.source_fingerprint = createHash("sha256").update("source:src\0file:src/index.js\0").update(text).update("\0").digest("hex");
  await writeFile(manifestPath, JSON.stringify(manifest));
  const before = await readFile(manifestPath);
  staleArchitecture(await checkKnowledge({ projectDir: project }));
  assert.deepEqual(await readFile(manifestPath), before);
  await recordKnowledge({ projectDir: project, document: "docs/architecture/overview.md", kind: "architecture", sourcePaths: ["src"] });
  assert.equal((await checkKnowledge({ projectDir: project })).status, "FRESH");
  const lf = "legacy LF\n";
  await put(project, "plain.txt", lf);
  const legacyLf = createHash("sha256").update("source:plain.txt\0file:plain.txt\0").update(lf).update("\0").digest("hex");
  assert.equal(await fingerprintSources(project, ["plain.txt"]), legacyLf);
});

test("attribute inspection is batched for hundreds of files and overlapping source paths", async (t) => {
  const { project } = await fixture(t, true);
  await Promise.all(Array.from({ length: 300 }, (_, index) => put(project, `src/file-${index}.txt`, "text\r\n")));
  const original = cp.spawnSync;
  const queries = [];
  cp.spawnSync = (command, args, options) => {
    if (command === "git" && args.includes("check-attr")) queries.push(options.input.split("\0").filter(Boolean));
    return original(command, args, options);
  };
  syncBuiltinESMExports();
  try {
    await fingerprintSources(project, ["src", "src/file-1.txt"]);
  } finally {
    cp.spawnSync = original;
    syncBuiltinESMExports();
  }
  assert.equal(queries.length, 1);
  assert.equal(queries[0].length, 300);
  assert.equal(new Set(queries[0]).size, 300);
});
