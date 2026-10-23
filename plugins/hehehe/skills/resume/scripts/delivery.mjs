#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL } from "node:url";
import { digest, git, policyPath, sourceSnapshot, trustedContext, validatePolicy } from "./verification-policy.mjs";
import { assertVerified, runChecks } from "./verification-runner.mjs";
import { loadDelivery, repository, safeDirectory, samePath, saveDelivery, withDeliveryLock } from "./delivery-store.mjs";
import { parseWorktreePorcelain } from "./worktree-isolation.mjs";

const reviewBranch = "integration/hehehe-review";

function resolveCommit(project, ref) {
  return git(project, ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`]).trim();
}

function targetHead(project, target) {
  git(project, ["check-ref-format", "--branch", target]);
  return resolveCommit(project, `refs/heads/${target}`);
}

function worktrees(project) {
  return parseWorktreePorcelain(git(project, ["worktree", "list", "--porcelain"]));
}

function clean(project, allowRuntime = false) {
  const runtime = (file) => file === ".hehehe/current.json" || file === ".hehehe/run-state.lock"
    || file === ".hehehe/architecture-profile.json" || file.startsWith(".hehehe/runs/") || file.startsWith(".hehehe/workspaces/");
  const entries = git(project, ["status", "--porcelain=v1", "-z", "--untracked-files=all"]).split("\0").filter(Boolean);
  // Rename records include a second path; never silently classify that path as runtime.
  if (entries.some((entry) => !allowRuntime || !runtime(entry.slice(3)))) {
    throw new Error(`delivery requires a clean committed workspace: ${project}`);
  }
}

function assertReview(repo, state) {
  safeDirectory(state.review_path);
  const registered = worktrees(repo.root).find((item) => samePath(item.path, state.review_path));
  if (!registered || !samePath(repository(state.review_path).common, repo.common)) throw new Error("fixed review worktree is missing or belongs to another repository");
  if (![state.target, reviewBranch].includes(registered.branch)) throw new Error("review worktree is on an unexpected branch");
  clean(state.review_path);
  return registered;
}

function hasPolicy(project, ref) {
  try { git(project, ["cat-file", "-e", `${ref}:${policyPath}`], { stdio: ["ignore", "pipe", "pipe"] }); return true; }
  catch { return false; }
}

function provisionalContext(project, candidate, targetBase) {
  if (hasPolicy(project, targetBase)) throw new Error("bootstrap review is only allowed before the target has a verification policy");
  const text = git(project, ["show", `${candidate}:${policyPath}`]);
  const policy = validatePolicy(JSON.parse(text));
  // First-adoption preview runs every proposed check, including conditional ones.
  return { base: candidate, policy_hash: digest(text), policy, approved_head: null,
    required: policy.checks.map((check) => check.id).sort(), snapshot: sourceSnapshot(project) };
}

function contextFor(state) {
  if (state.verification_mode === "bootstrap_provisional") {
    return provisionalContext(state.review_path, state.candidate, state.target_base);
  }
  return trustedContext(state.review_path, state.verification_base);
}

function evidenceDirectory(repo, state) {
  const directory = path.join(repo.store, "evidence", state.request_id);
  fs.mkdirSync(directory, { recursive: true });
  safeDirectory(directory);
  return directory;
}

function verifyCandidate(repo, state) {
  const registered = assertReview(repo, state);
  const merged = state.status === "merged";
  if (merged && (state.verification_mode !== "trusted" || state.main_head !== state.candidate
    || state.approved_candidate !== state.candidate || registered.branch !== state.target)) {
    throw new Error("merged verification requires the exact approved candidate on the target checkout");
  }
  if (resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("review candidate changed; prepare a new approval request");
  const expectedTarget = merged ? state.candidate : state.target_base;
  if (targetHead(repo.root, state.target) !== expectedTarget) throw new Error("target moved; reintegrate and request approval for the new candidate");
  const context = contextFor(state);
  const result = runChecks(state.review_path, state.request_id, context, evidenceDirectory(repo, state));
  assertReview(repo, state);
  if (targetHead(repo.root, state.target) !== expectedTarget
    || resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("delivery identities changed during verification");
  const next = { ...state, status: merged ? "merged" : result.status === "pass" ? "awaiting_approval" : "verification_failed",
    verification_status: result.status,
    verification_base: context.base, verified_at: result.finished_at, snapshot: result.snapshot, updated_at: new Date().toISOString() };
  saveDelivery(repo, next);
  if (result.status !== "pass") throw new Error(`integrated verification failed; inspect ${evidenceDirectory(repo, state)}`);
  return next;
}

function currentReviewHead(project) {
  const ref = `refs/heads/${reviewBranch}`;
  const rows = git(project, ["for-each-ref", "--format=%(refname) %(objectname)", ref]).trim().split(/\r?\n/);
  return rows.find((row) => row.startsWith(`${ref} `))?.slice(ref.length + 1) ?? null;
}

function finishPreparation(repo, state) {
  const preparation = state.preparation;
  const validateTarget = () => {
    if (targetHead(repo.root, state.target) !== state.target_base) throw new Error("target moved during preparation; reconcile before recovering this candidate");
  };
  validateTarget();
  safeDirectory(state.review_path);
  const registered = worktrees(repo.root);
  if (registered.some((item) => [state.target, reviewBranch].includes(item.branch) && !samePath(item.path, state.review_path))) {
    throw new Error("preparation branch is checked out elsewhere; refusing to displace it");
  }
  let oldReview = currentReviewHead(repo.root);
  if (![preparation.previous_review, state.candidate].includes(oldReview)) throw new Error("review ref changed outside the recorded preparation");
  let tree = registered.find((item) => samePath(item.path, state.review_path));
  if (!tree) {
    if (preparation.review_existed || fs.existsSync(state.review_path)) throw new Error("recorded review checkout is missing or occupied; inspect it before recovery");
    git(repo.root, ["worktree", "add", "--detach", state.review_path, state.candidate]);
    tree = worktrees(repo.root).find((item) => samePath(item.path, state.review_path));
  }
  safeDirectory(state.review_path);
  if (!tree || tree.locked || !samePath(repository(state.review_path).common, repo.common)) throw new Error("preparation review worktree is missing, locked or belongs to another repository");
  if (![null, preparation.initial_branch, reviewBranch].includes(tree.branch)
    || ![preparation.initial_head, state.candidate].includes(resolveCommit(state.review_path, "HEAD"))) {
    throw new Error("review checkout changed outside the recorded preparation");
  }
  clean(state.review_path);
  validateTarget();
  if (tree.branch !== null) git(state.review_path, ["switch", "--detach", state.candidate]);
  else if (resolveCommit(state.review_path, "HEAD") !== state.candidate) git(state.review_path, ["switch", "--detach", state.candidate]);
  // Both Git mutations are replayable: intent is already durable, and ref
  // advancement uses the recorded old identity rather than an unchecked reset.
  oldReview = currentReviewHead(repo.root);
  if (![preparation.previous_review, state.candidate].includes(oldReview)) throw new Error("review ref changed outside the recorded preparation");
  if (oldReview !== state.candidate) git(repo.root, ["update-ref", `refs/heads/${reviewBranch}`, state.candidate, oldReview ?? "0".repeat(40)]);
  git(state.review_path, ["switch", reviewBranch]);
  assertReview(repo, state);
  validateTarget();
  if (resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("prepared review candidate changed");
  const next = { ...state, status: "integrated", updated_at: new Date().toISOString() };
  delete next.preparation;
  saveDelivery(repo, next);
  return verifyCandidate(repo, next);
}

export function prepareDelivery(options) {
  return withDeliveryLock(options.project, (repo) => {
    const previous = loadDelivery(repo.root).state;
    const target = options.target ?? previous?.target;
    const reviewPath = options.reviewPath ? path.resolve(options.reviewPath) : previous?.review_path;
    if (!target || !reviewPath) throw new Error("first delivery requires --target and --review-path");
    if (target === reviewBranch) throw new Error("target must differ from the reserved review branch");
    if (previous && (target !== previous.target || !samePath(reviewPath, previous.review_path))) {
      throw new Error("review path and target are pinned; do not create another user review location");
    }
    if (previous?.status === "preparing") {
      const requested = [...new Set((options.sources ?? []).map((ref) => resolveCommit(repo.root, ref)))];
      if (requested.length && JSON.stringify(requested) !== JSON.stringify(previous.source_commits)) {
        throw new Error("interrupted preparation is frozen; finish its recorded sources before requesting another candidate");
      }
      if (options.bootstrapReview && previous.verification_mode !== "bootstrap_provisional") throw new Error("bootstrap cannot replace a trusted preparation");
      if (options.replaceCandidate && options.replaceCandidate !== previous.preparation.previous_review) throw new Error("replacement identity differs from the recorded preparation");
      return finishPreparation(repo, previous);
    }
    if (previous?.status !== "merged" && previous
      && options.replaceCandidate !== previous.candidate) throw new Error("pending review is frozen; explicit --replace-candidate with its exact SHA is required");
    const base = targetHead(repo.root, target);
    safeDirectory(reviewPath);
    const registered = worktrees(repo.root);
    const targetCheckout = registered.find((item) => item.branch === target);
    const relative = path.relative(repo.root, reviewPath);
    if (!relative.startsWith("..") && !path.isAbsolute(relative)
      && !(samePath(reviewPath, repo.root) && targetCheckout && samePath(targetCheckout.path, reviewPath))) {
      throw new Error("review worktree must be outside the source checkout, or its existing target checkout");
    }
    if (targetCheckout && !samePath(targetCheckout.path, reviewPath)) {
      throw new Error(`target is checked out elsewhere; use its path as the one review location: ${targetCheckout.path}`);
    }
    if (previous) assertReview(repo, previous);
    if (!previous) {
      const occupied = worktrees(repo.root).find((item) => item.branch === reviewBranch);
      if (occupied) throw new Error("reserved review branch is already owned by another checkout");
      try {
        git(repo.root, ["show-ref", "--verify", `refs/heads/${reviewBranch}`]);
        throw new Error("reserved review branch already exists without delivery ownership");
      } catch (error) {
        if (error.message === "reserved review branch already exists without delivery ownership") throw error;
      }
    }
    const sources = options.sources ?? [];
    if (!sources.length) throw new Error("at least one committed --source is required");
    const commits = [...new Set(sources.map((ref) => resolveCommit(repo.root, ref)))];
    for (const commit of commits) {
      for (const tree of registered.filter((item) => item.head === commit)) clean(tree.path, true);
    }
    if (options.bootstrapReview && hasPolicy(repo.root, base)) throw new Error("bootstrap cannot bypass an established target policy");
    if (!options.bootstrapReview && !process.env.HEHEHE_VERIFICATION_BASE) throw new Error("trusted baseline required; no automatic bootstrap fallback");
    const scratch = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-integration-"));
    const staging = path.join(scratch, "checkout");
    let stagingCreated = false;
    let candidate;
    try {
      git(repo.root, ["worktree", "add", "--detach", staging, base]);
      stagingCreated = true;
      for (const commit of commits) {
        try { git(staging, ["merge", "--no-edit", commit]); }
        catch (error) {
          try { git(staging, ["merge", "--abort"]); } catch { /* No merge may have started. */ }
          throw new Error(`source integration failed; main and review were not changed: ${error.message}`);
        }
      }
      clean(staging);
      candidate = resolveCommit(staging, "HEAD");
      if (candidate === base) throw new Error("no new integrated changes to review");
    } finally {
      if (stagingCreated) git(repo.root, ["worktree", "remove", staging]);
      fs.rmdirSync(scratch);
    }
    const atPath = worktrees(repo.root).find((item) => samePath(item.path, reviewPath));
    if (!atPath) {
      if (fs.existsSync(reviewPath)) throw new Error("review path already exists and is not a registered worktree");
    } else {
      const allowed = previous ? [target, reviewBranch] : [target];
      if (!allowed.includes(atPath.branch)) throw new Error("refusing to replace an unrelated checkout");
      clean(reviewPath);
    }
    const oldReview = currentReviewHead(repo.root);
    if (oldReview !== (previous?.candidate ?? null)) throw new Error("review branch moved outside the delivery lifecycle");
    if (targetHead(repo.root, target) !== base) throw new Error("target moved during integration; prepare again");
    const state = { schema_version: 1, status: "preparing", target, target_base: base,
      review_path: reviewPath, review_branch: reviewBranch, candidate, source_commits: commits,
      request_id: `delivery-${crypto.randomBytes(12).toString("hex")}`,
      verification_mode: options.bootstrapReview ? "bootstrap_provisional" : "trusted",
      verification_base: process.env.HEHEHE_VERIFICATION_BASE ?? null, updated_at: new Date().toISOString(),
      preparation: { previous_review: oldReview, review_existed: Boolean(atPath),
        initial_head: atPath ? resolveCommit(reviewPath, "HEAD") : null, initial_branch: atPath?.branch ?? null } };
    saveDelivery(repo, state);
    return finishPreparation(repo, state);
  });
}

export function verifyDelivery(project) {
  return withDeliveryLock(project, (repo) => {
    const state = loadDelivery(project).state;
    if (!state) throw new Error("no delivery to verify");
    if (state.status === "preparing") throw new Error("preparation was interrupted; repeat prepare or run finish before verification");
    return verifyCandidate(repo, state);
  });
}

export function mergeDelivery(project) {
  return withDeliveryLock(project, (repo) => {
    const state = loadDelivery(project).state;
    if (!state || state.status !== "awaiting_approval") throw new Error("only a verified approval request can merge");
    if (process.env.HEHEHE_DELIVERY_APPROVED_HEAD !== state.candidate
      || process.env.HEHEHE_DELIVERY_APPROVED_TARGET !== state.target_base
      || process.env.HEHEHE_DELIVERY_APPROVAL_ID !== state.request_id) {
      throw new Error("external user approval must match the exact candidate, target HEAD and request ID");
    }
    assertReview(repo, state);
    if (targetHead(repo.root, state.target) !== state.target_base) throw new Error("target moved since approval; reintegration and new approval required");
    if (resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("approved candidate changed");
    const context = contextFor(state);
    assertVerified(state.review_path, state.request_id, context, evidenceDirectory(repo, state));
    if (state.verification_mode === "bootstrap_provisional") {
      if (process.env.HEHEHE_DELIVERY_BOOTSTRAP_APPROVED !== state.request_id) {
        throw new Error("initial verification baseline needs explicit external bootstrap approval");
      }
      // Only an actual caller approval permits the proposed baseline to become authoritative.
      const saved = process.env.HEHEHE_VERIFICATION_BASE;
      try {
        process.env.HEHEHE_VERIFICATION_BASE = state.candidate;
        const approvedContext = trustedContext(state.review_path, state.candidate);
        const approvedId = `${state.request_id}-approved`;
        const checked = runChecks(state.review_path, approvedId, approvedContext, evidenceDirectory(repo, state));
        if (checked.status !== "pass") throw new Error("approved initial baseline verification failed");
        assertVerified(state.review_path, approvedId, approvedContext, evidenceDirectory(repo, state));
      } finally {
        if (saved === undefined) delete process.env.HEHEHE_VERIFICATION_BASE;
        else process.env.HEHEHE_VERIFICATION_BASE = saved;
      }
    }
    // Recheck immediately before mutation. Target advancement is a compare-and-swap fast-forward.
    assertReview(repo, state);
    if (resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("candidate changed during merge validation");
    git(repo.root, ["merge-base", "--is-ancestor", state.target_base, state.candidate]);
    const targetCheckout = worktrees(repo.root).find((item) => item.branch === state.target);
    if (targetCheckout && !samePath(targetCheckout.path, state.review_path)) throw new Error("target was checked out elsewhere during review");
    // Write intent before the irreversible ref update so either crash boundary is recoverable.
    let next = { ...state, status: "approved_update_pending", approved_candidate: state.candidate,
      approved_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    saveDelivery(repo, next);
    git(repo.root, ["update-ref", `refs/heads/${state.target}`, state.candidate, state.target_base]);
    next = { ...next, status: "main_updated_checkout_pending", merged_at: new Date().toISOString() };
    saveDelivery(repo, next);
    git(state.review_path, ["switch", state.target]);
    clean(state.review_path);
    if (resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("post-merge checkout verification failed");
    next = { ...next, status: "merged", main_head: state.candidate };
    saveDelivery(repo, next);
    return next;
  });
}

export function finishDelivery(project) {
  return withDeliveryLock(project, (repo) => {
    const state = loadDelivery(project).state;
    if (state?.status === "preparing") return finishPreparation(repo, state);
    if (!state || !["approved_update_pending", "main_updated_checkout_pending"].includes(state.status)) throw new Error("no interrupted approved checkout to finish");
    assertReview(repo, state);
    if (state.approved_candidate !== state.candidate
      || resolveCommit(state.review_path, "HEAD") !== state.candidate) throw new Error("interrupted merge identities changed; manual reconciliation required");
    const target = targetHead(repo.root, state.target);
    if (target !== state.candidate) {
      if (state.status !== "approved_update_pending" || target !== state.target_base) {
        throw new Error("interrupted merge identities changed; manual reconciliation required");
      }
      // If the ref never moved, require fresh evidence and the exact approval again.
      if (process.env.HEHEHE_DELIVERY_APPROVED_HEAD !== state.candidate
        || process.env.HEHEHE_DELIVERY_APPROVED_TARGET !== state.target_base
        || process.env.HEHEHE_DELIVERY_APPROVAL_ID !== state.request_id) {
        throw new Error("resuming a pending ref update requires the exact external user approval");
      }
      if (state.verification_mode !== "trusted") throw new Error("unfinished bootstrap requires a fresh approval and verification request");
      assertVerified(state.review_path, state.request_id, contextFor(state), evidenceDirectory(repo, state));
      git(repo.root, ["merge-base", "--is-ancestor", state.target_base, state.candidate]);
      const occupied = worktrees(repo.root).find((item) => item.branch === state.target && !samePath(item.path, state.review_path));
      if (occupied) throw new Error("target is checked out elsewhere; refusing to displace it");
      git(repo.root, ["update-ref", `refs/heads/${state.target}`, state.candidate, state.target_base]);
      saveDelivery(repo, { ...state, status: "main_updated_checkout_pending", merged_at: new Date().toISOString() });
    }
    const elsewhere = worktrees(repo.root).find((item) => item.branch === state.target && !samePath(item.path, state.review_path));
    if (elsewhere) throw new Error("target is checked out elsewhere; refusing to displace it");
    git(state.review_path, ["switch", state.target]);
    clean(state.review_path);
    const next = { ...state, status: "merged", main_head: state.candidate, updated_at: new Date().toISOString() };
    saveDelivery(repo, next);
    return next;
  });
}

export function deliveryStatus(project) {
  return loadDelivery(project).state ?? { status: "unconfigured" };
}

function parse(argv) {
  const command = argv[0];
  const options = { project: process.cwd(), sources: [] };
  const flags = { "--project": "project", "--target": "target", "--review-path": "reviewPath", "--replace-candidate": "replaceCandidate" };
  for (let i = 1; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") continue;
    if (arg === "--bootstrap-review") { options.bootstrapReview = true; continue; }
    if (arg === "--source" || flags[arg]) {
      const value = argv[++i];
      if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
      if (arg === "--source") options.sources.push(value);
      else options[flags[arg]] = value;
    } else throw new Error(`unsupported delivery option: ${arg}`);
  }
  if (command !== "prepare" && (options.sources.length || options.target || options.reviewPath || options.replaceCandidate || options.bootstrapReview)) {
    throw new Error("prepare options cannot be used to bypass merge approval");
  }
  return { command, options };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  try {
    const { command, options } = parse(process.argv.slice(2));
    let result;
    if (command === "prepare") result = prepareDelivery(options);
    else if (command === "verify") result = verifyDelivery(options.project);
    else if (command === "merge") result = mergeDelivery(options.project);
    else if (command === "finish") result = finishDelivery(options.project);
    else if (command === "status") result = deliveryStatus(options.project);
    else throw new Error("Usage: delivery.mjs <prepare|verify|status|merge|finish> --project <root> [prepare options]");
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  } catch (error) {
    process.stderr.write(`delivery: ${error.message}\n`);
    process.exitCode = 2;
  }
}
