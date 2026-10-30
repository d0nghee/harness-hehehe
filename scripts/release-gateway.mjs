import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const REGISTRY = "https://registry.npmjs.org";
const SHA = /^[a-f0-9]{40}$/;
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const INTEGRITY = /^sha512-[A-Za-z0-9+/]{86}==$/;

export function resolveNpmCli({ execPath = process.execPath, pathValue = process.env.PATH ?? "", npmExecPath = process.env.npm_execpath } = {}) {
  const candidates = [];
  if (npmExecPath && path.isAbsolute(npmExecPath)) candidates.push(npmExecPath);
  const directories = [path.dirname(execPath), ...pathValue.split(path.delimiter).filter(Boolean)];
  for (const directory of directories) {
    candidates.push(path.join(directory, "node_modules/npm/bin/npm-cli.js"),
      path.resolve(directory, "../lib/node_modules/npm/bin/npm-cli.js"), path.join(directory, "npm"));
  }
  for (const candidate of candidates) {
    try {
      const resolved = fs.realpathSync(candidate);
      if (path.basename(resolved) === "npm-cli.js" && fs.statSync(resolved).isFile()) return resolved;
    } catch (error) {
      if (!["ENOENT", "ENOTDIR"].includes(error.code)) throw new Error("Could not inspect npm CLI runtime");
    }
  }
  throw new Error("npm-cli.js was not found; install npm alongside the selected Node runtime");
}

function validateRecord(record) {
  const repository = record?.repository;
  if (typeof repository !== "string" || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)
    || repository.split("/").some((part) => [".", ".."].includes(part))) throw new Error("Invalid release repository");
  if (!SHA.test(record.head ?? "") || !VERSION.test(record.version ?? "") || record.tag !== `v${record.version}`) {
    throw new Error("Release target must bind a full commit SHA and stable version tag");
  }
  if (record.registry !== REGISTRY || record.dist_tag !== "latest" || record.target_branch !== "main") {
    throw new Error("Unsupported release registry, distribution tag or target branch");
  }
  if (typeof record.name !== "string" || !/^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*$/.test(record.name)) {
    throw new Error("Invalid npm package name");
  }
  return repository;
}

function officialUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Invalid npm registry URL"); }
  if (url.protocol !== "https:" || url.hostname !== "registry.npmjs.org" || url.port || url.username || url.password || url.hash) {
    throw new Error("npm metadata and tarballs must use the official HTTPS registry without credentials");
  }
  return url;
}

async function boundedBody(response, limit) {
  const length = response.headers.get("content-length");
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit)) {
    await response.body?.cancel();
    throw new Error("npm response exceeds the permitted size");
  }
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader(), chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error("npm response exceeds the permitted size"); }
      chunks.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks, size);
}

export function createReleaseGateway({ executor = spawnSync, fetchImpl = fetch, npmCliPath,
  environment = process.env, maxTarballBytes = 64 * 1024 * 1024, maxJsonBytes = 2 * 1024 * 1024 } = {}) {
  const execute = (command, args, options = {}) => {
    const env = { ...environment };
    delete env.NODE_OPTIONS; delete env.NODE_TEST_CONTEXT;
    return executor(command, args, { encoding: "utf8", shell: false, windowsHide: true,
      timeout: 120000, maxBuffer: 16 * 1024 * 1024, env, ...options });
  };
  const github = (record, method, endpoint, body, allowMissing = false) => {
    validateRecord(record);
    const args = ["api", "--hostname", "github.com", "--include", "--method", method, `repos/${record.repository}/${endpoint}`];
    if (body !== undefined) args.push("--input", "-");
    const result = execute("gh", args, body === undefined ? {} : { input: JSON.stringify(body) });
    if (result.error || result.signal) throw new Error("GitHub release operation could not execute");
    let contents = String(result.stdout ?? "").trimStart(), status;
    while (/^HTTP\/[\d.]+ \d{3}/.test(contents)) {
      status = Number(contents.match(/^HTTP\/[\d.]+ (\d{3})/)[1]);
      const boundary = contents.match(/\r?\n\r?\n/);
      if (!boundary) throw new Error("Invalid GitHub API response headers");
      contents = contents.slice(boundary.index + boundary[0].length);
    }
    if (status === 404 && allowMissing && result.status === 1) return null;
    if (result.status !== 0 || !status || status < 200 || status >= 300) {
      throw new Error(`GitHub release operation failed${status ? ` (HTTP ${status})` : ""}`);
    }
    try {
      const data = JSON.parse(contents);
      if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
      return data;
    } catch { throw new Error("Invalid GitHub release metadata"); }
  };
  const registry = async (value, { json = true, allowMissing = false } = {}) => {
    let url = officialUrl(value);
    const signal = AbortSignal.timeout(30000);
    for (let redirects = 0; redirects <= 3; redirects += 1) {
      let response;
      try {
        response = await fetchImpl(url.href, { redirect: "manual", credentials: "omit", referrerPolicy: "no-referrer",
          headers: { accept: json ? "application/json" : "application/octet-stream", "cache-control": "no-cache" }, signal });
      } catch { throw new Error("npm registry request failed"); }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location || redirects === 3) throw new Error("npm registry redirect limit or location is invalid");
        url = officialUrl(new URL(location, url).href);
        continue;
      }
      if (response.status === 404 && allowMissing) { await response.body?.cancel(); return null; }
      if (response.status !== 200) { await response.body?.cancel(); throw new Error(`npm registry request failed (HTTP ${response.status})`); }
      let bytes;
      try { bytes = await boundedBody(response, json ? maxJsonBytes : maxTarballBytes); }
      catch (error) { throw new Error(error.message === "npm response exceeds the permitted size" ? error.message : "npm response could not be read"); }
      if (!json) return bytes;
      try {
        const data = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
        if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
        return data;
      } catch { throw new Error("Invalid npm registry metadata"); }
    }
    throw new Error("npm registry redirect limit exceeded");
  };
  return {
    async remoteMain(record) {
      const data = github(record, "GET", "git/ref/heads/main");
      if (data.object?.type !== "commit" || !SHA.test(data.object?.sha ?? "")) throw new Error("Invalid remote main identity");
      return data.object.sha;
    },
    async getTag(record) {
      let data = github(record, "GET", `git/ref/tags/${encodeURIComponent(record.tag)}`, undefined, true);
      if (!data) return null;
      for (let depth = 0; depth < 8; depth += 1) {
        if (!SHA.test(data.object?.sha ?? "")) throw new Error("Invalid Git tag identity");
        if (data.object.type === "commit") return { sha: data.object.sha };
        if (data.object.type !== "tag") throw new Error("Release tag does not resolve to a commit");
        data = github(record, "GET", `git/tags/${data.object.sha}`);
      }
      throw new Error("Release tag nesting exceeds the permitted depth");
    },
    async createTag(record) {
      github(record, "POST", "git/refs", { ref: `refs/tags/${record.tag}`, sha: record.head });
    },
    async getGithubRelease(record) {
      const data = github(record, "GET", `releases/tags/${encodeURIComponent(record.tag)}`, undefined, true);
      if (!data) return null;
      if (data.tag_name !== record.tag || typeof data.body !== "string" || typeof data.draft !== "boolean"
        || typeof data.prerelease !== "boolean" || typeof data.target_commitish !== "string") throw new Error("Invalid GitHub release identity");
      return { tag: data.tag_name, body: data.body, draft: data.draft, prerelease: data.prerelease, target_commitish: data.target_commitish };
    },
    async createGithubRelease(record) {
      if (typeof record.notes?.text !== "string") throw new Error("Frozen release notes are required");
      github(record, "POST", "releases", { tag_name: record.tag, target_commitish: record.head,
        name: record.tag, body: record.notes.text, draft: false, prerelease: false, make_latest: "true" });
    },
    async getNpmVersion(record) {
      validateRecord(record);
      const data = await registry(`${REGISTRY}/${encodeURIComponent(record.name)}/${encodeURIComponent(record.version)}`, { allowMissing: true });
      if (!data) return null;
      if (data.name !== record.name || data.version !== record.version || !INTEGRITY.test(data.dist?.integrity ?? "")
        || typeof data.dist?.tarball !== "string") throw new Error("npm returned unexpected package identity or integrity");
      const bytes = await registry(data.dist.tarball, { json: false });
      const integrity = `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
      if (bytes.length === 0 || integrity !== data.dist.integrity) throw new Error("Downloaded npm tarball does not match registry integrity");
      return { name: data.name, version: data.version, integrity, bytes };
    },
    async getNpmLatest(record) {
      validateRecord(record);
      const data = await registry(`${REGISTRY}/${encodeURIComponent(record.name)}/latest`, { allowMissing: true });
      if (!data) return null;
      if (data.name !== record.name || !VERSION.test(data.version ?? "")) throw new Error("npm returned unexpected latest metadata");
      return data.version;
    },
    async publishNpm(record) {
      validateRecord(record);
      const artifact = record.artifact;
      if (!artifact || !path.isAbsolute(artifact.path ?? "") || path.extname(artifact.path).toLowerCase() !== ".tgz"
        || !INTEGRITY.test(artifact.integrity ?? "")) throw new Error("Frozen absolute tarball and integrity are required");
      const details = fs.lstatSync(artifact.path);
      if (!details.isFile() || details.isSymbolicLink()) throw new Error("Frozen npm tarball must be a regular file");
      if (`sha512-${createHash("sha512").update(fs.readFileSync(artifact.path)).digest("base64")}` !== artifact.integrity) throw new Error("Frozen npm tarball changed before publication");
      const runtime = npmCliPath ?? resolveNpmCli();
      if (!path.isAbsolute(runtime)) throw new Error("npm CLI runtime must be an absolute path");
      const args = [runtime, "publish", artifact.path, "--registry", record.registry, "--tag", record.dist_tag, "--access", "public", "--ignore-scripts"];
      if (environment.GITHUB_ACTIONS === "true" && environment.ACTIONS_ID_TOKEN_REQUEST_URL) args.push("--provenance");
      const result = execute(process.execPath, args, { cwd: path.dirname(artifact.path), timeout: 300000 });
      if (result.error || result.signal || result.status !== 0) throw new Error("npm publication failed; reconcile the exact version before retrying");
    },
  };
}
