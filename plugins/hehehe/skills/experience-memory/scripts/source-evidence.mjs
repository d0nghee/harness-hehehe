import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isUtf8 } from "node:buffer";

export class MemoryError extends Error {
  constructor(code, message = "Experience memory is unavailable.") {
    super(message);
    this.code = code;
  }
}
export const fail = (code = "MEMORY_INVALID_INPUT") => { throw new MemoryError(code); };
export const hash = (value) => createHash("sha256").update(value).digest("hex");
export const canonical = (value) => JSON.stringify(value, (_, item) => item && typeof item === "object" && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]])) : item);
export const samePath = (left, right) => process.platform === "win32"
  ? path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase() : path.resolve(left) === path.resolve(right);
export const runPattern = /^[a-z0-9][a-z0-9-]{2,79}$/;

export function relativeFile(value) {
  if (typeof value !== "string" || value.length > 400 || !value || /[\\:\x00-\x1f\x7f\ud800-\udfff]/u.test(value)
    || value.split("/").some((part) => !part || part === "." || part === ".." || /[. ]$/.test(part)
      || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(part))) fail("MEMORY_UNSAFE_PATH");
  return value;
}

// Refuse linked parents and hard-linked leaves before reading any source or note.
export function checkedPath(root, relative = "", { missing = false } = {}) {
  const base = path.resolve(root);
  let current = base;
  const rootStat = fs.lstatSync(base);
  if (rootStat.isSymbolicLink() || !rootStat.isDirectory() || !samePath(fs.realpathSync(base), base)) fail("MEMORY_UNSAFE_PATH");
  const parts = relative ? relativeFile(relative).split("/") : [];
  for (let index = 0; index < parts.length; index += 1) {
    current = path.join(current, parts[index]);
    let stat;
    try { stat = fs.lstatSync(current); } catch (error) {
      if (error.code === "ENOENT" && missing && index === parts.length - 1) return current;
      throw error;
    }
    if (stat.isSymbolicLink() || (index < parts.length - 1 && !stat.isDirectory())
      || (stat.isFile() && stat.nlink !== 1) || (!stat.isDirectory() && !stat.isFile())) fail("MEMORY_UNSAFE_PATH");
  }
  return current;
}

function readRegular(root, relative, maxBytes) {
  const target = checkedPath(root, relative);
  const before = fs.lstatSync(target);
  if (!before.isFile() || before.size > maxBytes) fail("MEMORY_INVALID_SOURCE");
  const descriptor = fs.openSync(target, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0));
  try {
    const opened = fs.fstatSync(descriptor);
    if (!opened.isFile() || opened.nlink !== 1 || opened.dev !== before.dev || opened.ino !== before.ino || opened.size > maxBytes) fail("MEMORY_UNSAFE_PATH");
    const buffer = Buffer.allocUnsafe(maxBytes + 1);
    let length = 0;
    while (length < buffer.length) {
      const count = fs.readSync(descriptor, buffer, length, buffer.length - length, null);
      if (!count) break;
      length += count;
    }
    const bytes = buffer.subarray(0, length);
    const after = fs.fstatSync(descriptor);
    if (bytes.length > maxBytes || bytes.length !== opened.size || after.size !== opened.size || after.mtimeMs !== opened.mtimeMs) fail("MEMORY_INVALID_SOURCE");
    return bytes;
  } finally { fs.closeSync(descriptor); }
}

export function readJson(root, relative, maxBytes = 20000) {
  const bytes = readRegular(root, relative, maxBytes);
  if (!isUtf8(bytes)) fail("MEMORY_INVALID_SOURCE");
  return JSON.parse(bytes.toString("utf8"));
}

export function git(project, args, { input, allowExit = false } = {}) {
  const environment = { GIT_OPTIONAL_LOCKS: "0", LC_ALL: "C" };
  for (const key of ["PATH", "Path", "SystemRoot", "WINDIR", "HOME", "USERPROFILE", "TEMP", "TMP"]) {
    if (process.env[key]) environment[key] = process.env[key];
  }
  const result = spawnSync("git", ["--literal-pathspecs", "-c", "core.fsmonitor=false", "-C", project, ...args], {
    encoding: "utf8", input, stdio: ["pipe", "pipe", "pipe"], env: environment,
    timeout: 15000, maxBuffer: 4 * 1024 * 1024, windowsHide: true,
  });
  if (result.error || (!allowExit && result.status !== 0)) fail("MEMORY_GIT_UNAVAILABLE");
  return allowExit ? result : result.stdout;
}

export function repository(project) {
  const root = path.resolve(project);
  checkedPath(root);
  const actual = git(root, ["rev-parse", "--show-toplevel"]).trim();
  if (!samePath(root, actual)) fail("MEMORY_INVALID_PROJECT");
  const common = path.resolve(root, git(root, ["rev-parse", "--git-common-dir"]).trim());
  checkedPath(common);
  const head = git(root, ["rev-parse", "--verify", "HEAD^{commit}"]).trim();
  if (!/^[a-f0-9]{40,64}$/.test(head)) fail("MEMORY_INVALID_PROJECT");
  return { root, common, head, repoId: hash(process.platform === "win32" ? common.toLowerCase() : common),
    database: path.join(common, "hehehe-memory", "experience.sqlite") };
}

export function registeredRoots(repo) {
  const fields = git(repo.root, ["worktree", "list", "--porcelain", "-z"]).split("\0");
  const roots = fields.filter((field) => field.startsWith("worktree ")).map((field) => path.resolve(field.slice(9)));
  if (roots.length > 64) fail("MEMORY_LIMIT_EXCEEDED");
  if (!roots.some((root) => samePath(root, repo.root))) fail("MEMORY_INVALID_PROJECT");
  return roots;
}

export function validateSourcePaths(values) {
  if (!Array.isArray(values) || values.length < 1 || values.length > 16 || new Set(values).size !== values.length) fail();
  for (const file of values) {
    relativeFile(file);
    if (file.split("/").some((part) => /^(?:\.git|\.hehehe|\.env(?:\..*)?|id_rsa|id_ed25519)$/i.test(part))) fail("MEMORY_UNSAFE_PATH");
  }
  return [...values].sort();
}

export function sourceEvidence(repo, paths) {
  const sources = validateSourcePaths(paths);
  const tracked = git(repo.root, ["ls-files", "--stage", "-z", "--", ...sources]).split("\0").filter(Boolean);
  const modes = new Map();
  for (const entry of tracked) {
    const match = /^(100644|100755) [a-f0-9]{40,64} 0\t(.+)$/s.exec(entry);
    if (!match || !sources.includes(match[2]) || modes.has(match[2])) fail("MEMORY_INVALID_SOURCE");
    modes.set(match[2], match[1]);
  }
  if (modes.size !== sources.length) fail("MEMORY_INVALID_SOURCE");
  const attributes = git(repo.root, ["check-attr", "-z", "--stdin", "text", "binary"], { input: `${sources.join("\0")}\0` }).split("\0");
  if (attributes.pop() !== "" || attributes.length !== sources.length * 6) fail("MEMORY_INVALID_SOURCE");
  const binary = new Set();
  const seen = new Map();
  for (let index = 0; index < attributes.length; index += 3) {
    const [file, attr, value] = attributes.slice(index, index + 3);
    if (!sources.includes(file) || !["text", "binary"].includes(attr)) fail("MEMORY_INVALID_SOURCE");
    if (!seen.has(file)) seen.set(file, new Set());
    if (seen.get(file).has(attr)) fail("MEMORY_INVALID_SOURCE");
    seen.get(file).add(attr);
    if ((attr === "text" && value === "unset") || (attr === "binary" && !["unset", "unspecified"].includes(value))) binary.add(file);
  }
  return sources.map((file) => {
    const bytes = readRegular(repo.root, file, 4 * 1024 * 1024);
    const content = !binary.has(file) && !bytes.includes(0) && isUtf8(bytes) ? bytes.toString("utf8").replaceAll("\r\n", "\n") : bytes;
    return { path: file, sha256: hash(content) };
  });
}
