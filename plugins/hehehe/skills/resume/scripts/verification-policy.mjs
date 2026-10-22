import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

export const policyPath = ".hehehe/verification-policy.json";

export function git(project, args, options = {}) {
  return execFileSync("git", ["-C", project, ...args], {
    encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "pipe"], maxBuffer: 32 * 1024 * 1024, ...options,
  });
}

export function digest(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function requireShape(condition, message) {
  if (!condition) throw new Error(`verification policy: ${message}`);
}

function exactKeys(value, keys) {
  requireShape(value && typeof value === "object" && !Array.isArray(value), "expected an object");
  requireShape(Object.keys(value).every((key) => keys.includes(key)), "unknown field");
}

function relativePath(value) {
  requireShape(typeof value === "string" && value.length > 0
    && !value.startsWith("/") && !value.includes("\\") && !value.includes(":")
    && !value.split("/").some((part) => part === ".." || part === "." || !part),
  "paths must be non-empty repository-relative POSIX paths");
  return value;
}

function stringList(value, label, { empty = false } = {}) {
  requireShape(Array.isArray(value) && (empty || value.length > 0)
    && value.every((item) => typeof item === "string" && item.length > 0)
    && new Set(value).size === value.length, `${label} must contain unique strings`);
}

export function validatePolicy(policy) {
  exactKeys(policy, ["schema_version", "checks", "always_required", "change_rules", "protected_paths", "max_age_seconds"]);
  requireShape(policy.schema_version === 1, "unsupported schema_version");
  requireShape(Number.isSafeInteger(policy.max_age_seconds) && policy.max_age_seconds > 0
    && policy.max_age_seconds <= 604800, "max_age_seconds must be 1..604800");
  requireShape(Array.isArray(policy.checks) && policy.checks.length > 0, "checks cannot be empty");
  const ids = new Set();
  for (const check of policy.checks) {
    exactKeys(check, ["id", "command", "kind", "timeout_ms", "minimum_tests"]);
    requireShape(typeof check.id === "string" && /^[a-z][a-z0-9-]*$/.test(check.id)
      && !ids.has(check.id), "invalid or duplicate check id");
    ids.add(check.id);
    requireShape(Array.isArray(check.command) && check.command.length > 0
      && check.command.every((arg) => typeof arg === "string" && arg.length > 0
        && !arg.includes("\0")), "command must be a non-empty argv array");
    requireShape(["exit", "node-test"].includes(check.kind), "unknown result kind");
    requireShape(Number.isSafeInteger(check.timeout_ms) && check.timeout_ms > 0
      && check.timeout_ms <= 3_600_000, "timeout_ms must be 1..3600000");
    if (check.kind === "node-test") {
      requireShape(Number.isSafeInteger(check.minimum_tests) && check.minimum_tests > 0,
        "node-test requires positive minimum_tests");
    } else {
      requireShape(check.minimum_tests === undefined, "minimum_tests only applies to node-test");
    }
  }
  stringList(policy.always_required, "always_required");
  stringList(policy.protected_paths, "protected_paths");
  policy.protected_paths.forEach(relativePath);
  requireShape(Array.isArray(policy.change_rules), "change_rules must be an array");
  const referenced = [...policy.always_required];
  for (const rule of policy.change_rules) {
    exactKeys(rule, ["paths", "required"]);
    stringList(rule.paths, "rule paths");
    rule.paths.forEach(relativePath);
    stringList(rule.required, "rule required");
    referenced.push(...rule.required);
  }
  requireShape(referenced.every((id) => ids.has(id)), "required check id is not defined");
  return policy;
}

export function matches(file, pattern) {
  // Only '*' (one segment) and '**' (across segments) are special. No shell expansion.
  const escaped = pattern.split(/(\*\*|\*)/).map((part) => part === "**" ? ".*"
    : part === "*" ? "[^/]*" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
  return new RegExp(`^${escaped}$`).test(file);
}

function runtimeArtifact(file) {
  return file === ".hehehe/current.json" || file.startsWith(".hehehe/runs/")
    || file === ".hehehe/run-state.lock" || file.startsWith(".hehehe/workspaces/");
}

export function sourceSnapshot(project) {
  const files = [...new Set(git(project, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"])
    .split("\0").filter((file) => file && !runtimeArtifact(file)))].sort();
  const hash = crypto.createHash("sha256");
  for (const file of files) {
    const target = path.join(project, file);
    hash.update(`${file}\0`);
    if (!fs.existsSync(target)) { hash.update("deleted\0"); continue; }
    const stats = fs.lstatSync(target);
    if (!stats.isFile()) throw new Error(`verification refuses non-regular source file: ${file}`);
    hash.update(`${stats.mode & 0o111}\0${digest(fs.readFileSync(target))}\0`);
  }
  return { head: git(project, ["rev-parse", "HEAD"]).trim(), source_hash: hash.digest("hex") };
}

export function trustedContext(project, expectedBase) {
  const requested = process.env.HEHEHE_VERIFICATION_BASE;
  if (!requested || !/^[a-f0-9]{40}$/.test(requested)) {
    throw new Error("HEHEHE_VERIFICATION_BASE must be an operator/CI supplied full trusted commit SHA; no HEAD fallback");
  }
  if (expectedBase && requested !== expectedBase) throw new Error("trusted verification base changed during the run");
  const root = path.resolve(git(project, ["rev-parse", "--show-toplevel"]).trim());
  if (root.toLowerCase() !== path.resolve(project).toLowerCase()) throw new Error("verification requires the repository root");
  if (git(project, ["rev-parse", `${requested}^{commit}`]).trim() !== requested) throw new Error("invalid trusted commit");
  git(project, ["merge-base", "--is-ancestor", requested, "HEAD"]);
  let text;
  try { text = git(project, ["show", `${requested}:${policyPath}`]); }
  catch { throw new Error("trusted commit has no verification policy; an operator must establish a reviewed baseline"); }
  const policy = validatePolicy(JSON.parse(text));
  const head = git(project, ["rev-parse", "HEAD"]).trim();
  // This is an external maintainer/CI decision, never a field in PR-controlled JSON.
  const reviewedHead = process.env.HEHEHE_VERIFICATION_APPROVED_HEAD;
  const approved = reviewedHead === head && /^[a-f0-9]{40}$/.test(reviewedHead);
  function approvedFile(file) {
    if (!approved) return false;
    return git(project, ["diff", "--no-renames", "--name-only", "HEAD", "--", file]).trim() === "";
  }
  const workingPolicy = path.join(project, policyPath);
  if (!fs.existsSync(workingPolicy) || fs.readFileSync(workingPolicy, "utf8").replaceAll("\r\n", "\n")
    !== text.replaceAll("\r\n", "\n")) {
    if (!approvedFile(policyPath)) throw new Error("verification policy changed from the trusted baseline");
    // A reviewed future policy must still be valid; this run ALWAYS executes the old trusted policy.
    validatePolicy(JSON.parse(fs.readFileSync(workingPolicy, "utf8")));
  }
  const changed = [...new Set([
    ...git(project, ["diff", "--no-renames", "--name-only", "-z", requested, "--"]).split("\0"),
    ...git(project, ["ls-files", "--others", "--exclude-standard", "-z"]).split("\0"),
  ].filter(Boolean))];
  const existing = new Set(git(project, ["ls-tree", "-r", "--name-only", "-z", requested]).split("\0").filter(Boolean));
  const forbidden = changed.filter((file) => existing.has(file)
    && policy.protected_paths.some((pattern) => matches(file, pattern)) && !approvedFile(file));
  if (forbidden.length) throw new Error(`protected verification inputs changed; reviewed baseline update required: ${forbidden.join(", ")}`);
  const required = new Set(policy.always_required);
  for (const rule of policy.change_rules) {
    if (changed.some((file) => rule.paths.some((pattern) => matches(file, pattern)))) {
      rule.required.forEach((id) => required.add(id));
    }
  }
  return { base: requested, policy_hash: digest(text), policy,
    approved_head: approved ? head : null,
    required: [...required].sort(), snapshot: sourceSnapshot(project) };
}
