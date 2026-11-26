import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import { git, digest } from "../plugins/hehehe/skills/resume/scripts/verification-policy.mjs";
import { safeDirectory } from "../plugins/hehehe/skills/resume/scripts/delivery-store.mjs";
import { repositoryInfo, requestPattern, safeRelative } from "./release-policy.mjs";
import { resolveNpmCli } from "./release-gateway.mjs";

export const integrityOf = (bytes) => `sha512-${crypto.createHash("sha512").update(bytes).digest("base64")}`;
export function releaseStore(project) {
  const repo = repositoryInfo(project);
  const directory = path.join(repo.common, "hehehe-release");
  safeDirectory(directory);
  return { ...repo, directory };
}
export function requestDirectory(store, requestId) {
  if (!requestPattern.test(requestId ?? "")) throw new Error("invalid release request ID");
  const directory = path.join(store.directory, "requests", requestId);
  safeDirectory(directory);
  return directory;
}
function atomicJson(file, value) {
  safeDirectory(path.dirname(file));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n", { flag: "wx" });
  fs.renameSync(temporary, file);
}
export function saveRelease(store, record) {
  const directory = requestDirectory(store, record.request_id);
  const key = journalKey(store, true);
  atomicJson(path.join(directory, "state.json"), { record, signature: crypto.createHmac("sha256", key).update(JSON.stringify(record)).digest("hex") });
  atomicJson(path.join(store.directory, "latest.json"), { request_id: record.request_id });
  return record;
}
export function loadRelease(store, requestId) {
  if (!requestId) {
    const pointer = path.join(store.directory, "latest.json");
    if (!fs.existsSync(pointer)) return null;
    if (!fs.lstatSync(pointer).isFile() || fs.lstatSync(pointer).isSymbolicLink()) throw new Error("release pointer must be a regular file");
    requestId = JSON.parse(fs.readFileSync(pointer, "utf8")).request_id;
  }
  const file = path.join(requestDirectory(store, requestId), "state.json");
  if (!fs.existsSync(file)) throw new Error("release request does not exist");
  if (!fs.lstatSync(file).isFile() || fs.lstatSync(file).isSymbolicLink()) throw new Error("release journal must be a regular file");
  const envelope = JSON.parse(fs.readFileSync(file, "utf8"));
  const record = envelope.record;
  if (!record || envelope.signature !== crypto.createHmac("sha256", journalKey(store)).update(JSON.stringify(record)).digest("hex")) throw new Error("release journal integrity check failed");
  if (record.schema_version !== 1 || record.request_id !== requestId || !/^[a-f0-9]{40}$/.test(record.head ?? "")
    || !["prepared", "verified", "verification_failed", "publishing", "partial", "released"].includes(record.status)
    || !record.artifact || record.artifact.path !== path.join(requestDirectory(store, requestId), "package.tgz")) throw new Error("unsupported release journal");
  return record;
}
function journalKey(store, create = false) {
  const file = path.join(store.directory, "journal-key");
  safeDirectory(store.directory);
  if (create) {
    fs.mkdirSync(store.directory, { recursive: true });
    try { fs.writeFileSync(file, crypto.randomBytes(32), { flag: "wx", mode: 0o600 }); }
    catch (error) { if (error.code !== "EEXIST") throw error; }
  }
  const details = fs.lstatSync(file);
  if (!details.isFile() || details.isSymbolicLink()) throw new Error("release journal key must be a regular file");
  const key = fs.readFileSync(file);
  if (key.length !== 32) throw new Error("invalid release journal integrity key");
  return key;
}
export async function withReleaseLock(project, action) {
  const store = releaseStore(project);
  fs.mkdirSync(store.directory, { recursive: true });
  const lock = path.join(store.directory, "mutation.lock");
  let descriptor;
  try { descriptor = fs.openSync(lock, "wx"); }
  catch (error) { if (error.code === "EEXIST") throw new Error("release is locked; inspect another or interrupted operation before retrying"); throw error; }
  fs.writeFileSync(descriptor, JSON.stringify({ pid: process.pid, started_at: new Date().toISOString() }));
  fs.closeSync(descriptor);
  try { return await action(store); } finally { fs.unlinkSync(lock); }
}
function committedFiles(project, ref, destination) {
  const rows = git(project, ["ls-tree", "-r", "-z", "--full-tree", ref]).split("\0").filter(Boolean);
  const entries = rows.map((row) => {
    const match = row.match(/^(100644|100755) blob ([a-f0-9]{40})\t(.+)$/s);
    if (!match) throw new Error("release refuses linked, submodule or non-regular Git tree entries");
    return { mode: match[1], object: match[2], file: safeRelative(match[3]) };
  });
  const seen = new Set();
  for (const entry of entries) {
    const key = entry.file.toLowerCase();
    if (seen.has(key)) throw new Error("release tree contains case-colliding paths");
    seen.add(key);
  }
  const batch = git(project, ["cat-file", "--batch"], { input: entries.map((entry) => entry.object).join("\n") + "\n", stdio: ["pipe", "pipe", "pipe"], encoding: null, maxBuffer: 128 * 1024 * 1024 });
  let offset = 0;
  const files = new Map();
  for (const entry of entries) {
    const end = batch.indexOf(10, offset), header = batch.subarray(offset, end).toString("ascii");
    const expected = header.match(/^([a-f0-9]{40}) blob (\d+)$/);
    if (!expected || expected[1] !== entry.object) throw new Error("invalid canonical Git blob response");
    const size = Number(expected[2]), content = batch.subarray(end + 1, end + 1 + size);
    if (!Number.isSafeInteger(size) || content.length !== size || batch[end + 1 + size] !== 10) throw new Error("truncated canonical Git blob response");
    offset = end + size + 2;
    const target = path.join(destination, entry.file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, { flag: "wx", mode: entry.mode === "100755" ? 0o755 : 0o644 });
    files.set(entry.file, content);
  }
  return files;
}
function tarFiles(bytes) {
  const tar = gunzipSync(bytes, { maxOutputLength: 128 * 1024 * 1024 });
  const files = new Map();
  let pax = {};
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const string = (start, length) => header.subarray(start, start + length).toString("utf8").replace(/\0.*$/s, "");
    const size = parseInt(string(124, 12).trim() || "0", 8);
    if (!Number.isSafeInteger(size) || size < 0 || offset + 512 + size > tar.length) throw new Error("invalid release tar entry size");
    const content = tar.subarray(offset + 512, offset + 512 + size), type = string(156, 1);
    const name = [string(345, 155), string(0, 100)].filter(Boolean).join("/");
    offset += 512 + Math.ceil(size / 512) * 512;
    if (type === "x") {
      pax = {};
      for (let cursor = 0; cursor < content.length;) {
        const space = content.indexOf(32, cursor), length = Number(content.subarray(cursor, space).toString("ascii"));
        if (!Number.isSafeInteger(length) || length <= 0 || cursor + length > content.length) throw new Error("invalid release tar PAX entry");
        const field = content.subarray(space + 1, cursor + length - 1).toString("utf8"), equals = field.indexOf("=");
        if (equals !== -1) pax[field.slice(0, equals)] = field.slice(equals + 1);
        cursor += length;
      }
      continue;
    }
    const fullPath = pax.path ?? name;
    pax = {};
    if (type === "5") continue;
    if (!["", "0"].includes(type) || !fullPath.startsWith("package/")) throw new Error("release archive contains an unsafe entry");
    const file = safeRelative(fullPath.slice(8));
    if (files.has(file)) throw new Error("release archive contains duplicate entries");
    files.set(file, content);
  }
  if (!files.has("package.json")) throw new Error("release archive has no package manifest");
  return files;
}
export function inspectArtifact(bytes) {
  const files = tarFiles(bytes);
  return [...files].map(([file, content]) => ({ path: file, size: content.length, sha256: digest(content) }))
    .sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
}
export function packCommitted(project, ref) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-release-pack-"));
  try {
    const staging = path.join(scratch, "source"), output = path.join(scratch, "artifact");
    fs.mkdirSync(staging); fs.mkdirSync(output);
    const canonical = committedFiles(project, ref, staging);
    const environment = { ...process.env, npm_config_audit: "false", npm_config_fund: "false" };
    delete environment.NODE_OPTIONS; delete environment.NODE_TEST_CONTEXT;
    const result = spawnSync(process.execPath, [resolveNpmCli(), "pack", "--json", "--ignore-scripts", "--pack-destination", output],
      { cwd: staging, encoding: "utf8", shell: false, windowsHide: true, timeout: 120000, maxBuffer: 16 * 1024 * 1024, env: environment });
    if (result.error || result.status !== 0) throw new Error(`canonical npm pack failed: ${result.error?.message ?? result.stderr?.trim() ?? result.status}`);
    const report = JSON.parse(result.stdout);
    if (!Array.isArray(report) || report.length !== 1 || path.basename(report[0].filename) !== report[0].filename) throw new Error("unexpected canonical npm pack report");
    const bytes = fs.readFileSync(path.join(output, report[0].filename));
    const actual = tarFiles(bytes);
    for (const [file, content] of actual) {
      if (!canonical.has(file) || !content.equals(canonical.get(file))) throw new Error(`release archive differs from its committed source: ${file}`);
    }
    const pkg = JSON.parse(actual.get("package.json"));
    const bins = typeof pkg.bin === "string" ? [pkg.bin] : Object.values(pkg.bin ?? {});
    for (const bin of bins) if (!actual.has(safeRelative(bin.replace(/^\.\//, "")))) throw new Error("release archive omits a declared executable");
    const manifest = inspectArtifact(bytes);
    return { bytes, integrity: integrityOf(bytes), sha256: digest(bytes), size: bytes.length, files: manifest };
  } finally {
    if (path.dirname(scratch) !== path.resolve(os.tmpdir()) || !path.basename(scratch).startsWith("hehehe-release-pack-")) throw new Error("unexpected release staging cleanup path");
    fs.rmSync(scratch, { recursive: true, force: true });
  }
}
