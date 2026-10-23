import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { git } from "./verification-policy.mjs";

export function repository(project) {
  const root = path.resolve(git(project, ["rev-parse", "--show-toplevel"]).trim());
  if (root.toLowerCase() !== path.resolve(project).toLowerCase()) throw new Error("delivery requires a repository root");
  const common = fs.realpathSync(path.resolve(root, git(root, ["rev-parse", "--git-common-dir"]).trim()));
  return { root, common, store: path.join(common, "hehehe-delivery") };
}

export function samePath(left, right) {
  return path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase();
}

export function safeDirectory(target) {
  let current = path.resolve(target);
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) {
      throw new Error(`delivery path must not traverse a symlink or junction: ${current}`);
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}

export function loadDelivery(project) {
  const repo = repository(project);
  const file = path.join(repo.store, "state.json");
  if (!fs.existsSync(file)) return { repo, state: null };
  if (fs.lstatSync(file).isSymbolicLink()) throw new Error("delivery state must be a regular file");
  const state = JSON.parse(fs.readFileSync(file, "utf8"));
  if (state.schema_version !== 1 || typeof state.review_path !== "string" || !path.isAbsolute(state.review_path)
    || typeof state.target !== "string" || state.review_branch !== "integration/hehehe-review"
    || !["integrated", "awaiting_approval", "verification_failed", "approved_update_pending", "main_updated_checkout_pending", "merged"].includes(state.status)
    || !/^[a-f0-9]{40}$/.test(state.candidate) || !/^[a-f0-9]{40}$/.test(state.target_base)
    || !/^delivery-[a-f0-9]{24}$/.test(state.request_id)
    || !["trusted", "bootstrap_provisional"].includes(state.verification_mode)) {
    throw new Error("unsupported delivery state");
  }
  return { repo, state };
}

export function saveDelivery(repo, state) {
  fs.mkdirSync(repo.store, { recursive: true });
  safeDirectory(repo.store);
  const temporary = path.join(repo.store, `state.${process.pid}.${crypto.randomBytes(5).toString("hex")}.tmp`);
  fs.writeFileSync(temporary, JSON.stringify(state, null, 2) + "\n", { flag: "wx" });
  fs.renameSync(temporary, path.join(repo.store, "state.json"));
}

export function withDeliveryLock(project, action) {
  const repo = repository(project);
  fs.mkdirSync(repo.store, { recursive: true });
  safeDirectory(repo.store);
  const lock = path.join(repo.store, "mutation.lock");
  let descriptor;
  try { descriptor = fs.openSync(lock, "wx"); }
  catch (error) {
    if (error.code === "EEXIST") throw new Error("delivery is locked; investigate another or interrupted operation");
    throw error;
  }
  fs.closeSync(descriptor);
  try { return action(repo); }
  finally { fs.unlinkSync(lock); }
}
