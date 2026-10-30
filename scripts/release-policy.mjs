import fs from "node:fs";
import path from "node:path";
import { digest, git, sourceSnapshot } from "../plugins/hehehe/skills/resume/scripts/verification-policy.mjs";

export const releasePolicyPath = ".hehehe/release-policy.json";
export const pluginManifestPath = "plugins/hehehe/.codex-plugin/plugin.json";
export const requestPattern = /^release-[a-f0-9]{24}$/;
export function stableVersion(value) {
  if (typeof value !== "string" || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)) throw new Error("release requires an explicit stable x.y.z version");
  return value;
}
export function compareVersions(left, right) {
  const a = stableVersion(left).split(".").map(BigInt), b = stableVersion(right).split(".").map(BigInt);
  for (let index = 0; index < 3; index += 1) if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  return 0;
}
export function safeRelative(file) {
  if (typeof file !== "string" || !file || file.includes("\\") || file.includes(":") || file.includes("\0")
    || file.split("/").some((part) => !part || part === "." || part === "..")) throw new Error(`unsafe release path: ${file}`);
  return file;
}
export function validateReleasePolicy(value) {
  const keys = ["schema_version", "package_name", "repository", "target_branch", "registry", "dist_tag", "tag_prefix", "changelog"];
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length
    || Object.keys(value).some((key) => !keys.includes(key)) || value.schema_version !== 1
    || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(value.package_name ?? "")
    || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(value.repository ?? "")
    || value.repository.split("/").some((part) => part === "." || part === "..")
    || value.target_branch !== "main" || value.registry !== "https://registry.npmjs.org"
    || value.dist_tag !== "latest" || value.tag_prefix !== "v") throw new Error("unsupported release policy; no optional approval or publication exemptions are allowed");
  safeRelative(value.changelog);
  return value;
}
export function repositoryInfo(projectDir) {
  const root = path.resolve(projectDir);
  if (path.resolve(git(root, ["rev-parse", "--show-toplevel"]).trim()).toLowerCase() !== root.toLowerCase()) throw new Error("release requires the repository root");
  return { root, common: fs.realpathSync(path.resolve(root, git(root, ["rev-parse", "--git-common-dir"]).trim())) };
}
export function readBlob(project, ref, file) {
  safeRelative(file);
  return git(project, ["show", `${ref}:${file}`], { encoding: null });
}
function hasBlob(project, ref, file) {
  return git(project, ["ls-tree", "-z", ref, "--", file]).split("\0").some((row) => row.endsWith(`\t${file}`));
}
function safePolicyFile(project) {
  let current = project;
  for (const part of releasePolicyPath.split("/")) {
    current = path.join(current, part);
    const details = fs.lstatSync(current);
    if (details.isSymbolicLink()) throw new Error("release policy path must not traverse a link or junction");
  }
  if (!fs.lstatSync(current).isFile()) throw new Error("release policy must be a regular file");
}
export function releasePolicyContext(project, { expectedBase, requireTrusted = false } = {}) {
  safePolicyFile(project);
  const base = process.env.HEHEHE_VERIFICATION_BASE ?? null;
  const head = git(project, ["rev-parse", "HEAD"]).trim();
  if (expectedBase && base !== expectedBase) throw new Error("release verification baseline changed");
  let trusted = false;
  if (base !== null) {
    if (!/^[a-f0-9]{40}$/.test(base)) throw new Error("release requires a full externally pinned verification base");
    git(project, ["merge-base", "--is-ancestor", base, head]);
    trusted = hasBlob(project, base, releasePolicyPath);
  }
  if (requireTrusted && !trusted) throw new Error("release policy is provisional; a separately approved baseline must contain it before verification or publication");
  let text;
  if (trusted) {
    text = readBlob(project, base, releasePolicyPath).toString("utf8");
    const working = fs.readFileSync(path.join(project, releasePolicyPath), "utf8");
    validateReleasePolicy(JSON.parse(working));
    if (working.replaceAll("\r\n", "\n") !== text.replaceAll("\r\n", "\n")
      && !(process.env.HEHEHE_VERIFICATION_APPROVED_HEAD === head
        && git(project, ["diff", "--no-renames", "--name-only", "HEAD", "--", releasePolicyPath]).trim() === "")) {
      throw new Error("release policy differs from the trusted baseline");
    }
  } else {
    text = fs.readFileSync(path.join(project, releasePolicyPath), "utf8");
  }
  return { mode: trusted ? "trusted" : "provisional", base, hash: digest(text.replaceAll("\r\n", "\n")), policy: validateReleasePolicy(JSON.parse(text)) };
}
export function runtimeFile(file) {
  return file === ".hehehe/current.json" || file === ".hehehe/run-state.lock"
    || file.startsWith(".hehehe/runs/") || file.startsWith(".hehehe/workspaces/");
}
export function releaseSource(project, clean = true) {
  const entries = git(project, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]).split("\0").filter(Boolean);
  const dirty = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index], paths = [entry.slice(3)];
    if (/[RC]/.test(entry.slice(0, 2))) {
      if (!entries[index + 1]) throw new Error("incomplete release source rename/copy record");
      paths.push(entries[++index]);
    }
    if (paths.some((file) => !runtimeFile(file))) dirty.push(...paths);
  }
  if (clean && dirty.length) throw new Error(`release preparation requires clean committed source: ${dirty.join(", ")}`);
  const snapshot = sourceSnapshot(project);
  return { head: snapshot.head, snapshot, dirty_paths: [...new Set(dirty)] };
}
export function packageIdentity(project, ref, policy) {
  const pkg = JSON.parse(readBlob(project, ref, "package.json"));
  const plugin = JSON.parse(readBlob(project, ref, pluginManifestPath));
  stableVersion(pkg.version);
  if (pkg.name !== policy.package_name || pkg.version !== plugin.version || plugin.name !== "hehehe") throw new Error("release package/plugin name or versions do not match the pinned policy");
  if (pkg.publishConfig?.registry && pkg.publishConfig.registry !== policy.registry) throw new Error("package publish registry conflicts with release policy");
  if (pkg.publishConfig?.tag && pkg.publishConfig.tag !== policy.dist_tag) throw new Error("package dist-tag conflicts with release policy");
  const source = readBlob(project, ref, policy.changelog).toString("utf8").replaceAll("\r\n", "\n");
  const lines = source.split("\n"), escaped = pkg.version.replaceAll(".", "\\.");
  const header = new RegExp(`^##\\s+(?:\\[${escaped}\\](?:\\([^)]*\\))?|${escaped})(?:\\s|$)`);
  const start = lines.findIndex((line) => header.test(line));
  let text = "";
  if (start !== -1) {
    let end = start + 1;
    while (end < lines.length && !/^##\s/.test(lines[end])) end += 1;
    text = lines.slice(start + 1, end).join("\n").trim();
  }
  return { name: pkg.name, version: pkg.version, tag: `${policy.tag_prefix}${pkg.version}`,
    notes: { path: policy.changelog, text, hash: digest(text) }, package_json: pkg };
}
export function releaseTags(project, head) {
  const tags = git(project, ["tag", "--list", "v*"]).split(/\r?\n/).filter((tag) => /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag));
  if (tags.length > 1000) throw new Error("too many release tags; inspect release history before preparation");
  const result = tags.map((tag) => {
    const sha = git(project, ["rev-parse", "--verify", "--end-of-options", `${tag}^{commit}`]).trim();
    let ancestor = true;
    try { git(project, ["merge-base", "--is-ancestor", sha, head]); } catch { ancestor = false; }
    return { tag, version: tag.slice(1), head: sha, ancestor };
  });
  return result.sort((a, b) => compareVersions(b.version, a.version));
}
