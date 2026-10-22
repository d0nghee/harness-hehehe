import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { digest, git, sourceSnapshot } from "./verification-policy.mjs";

function receiptStore(project) {
  const common = path.resolve(project, git(project, ["rev-parse", "--git-common-dir"]).trim());
  const store = path.join(common, "hehehe-verification");
  fs.mkdirSync(store, { recursive: true });
  if (fs.lstatSync(store).isSymbolicLink()) throw new Error("receipt store must not be a symbolic link");
  const keyFile = path.join(store, "receipt-key");
  try { fs.writeFileSync(keyFile, crypto.randomBytes(32), { flag: "wx", mode: 0o600 }); }
  catch (error) { if (error.code !== "EEXIST") throw error; }
  if (!fs.lstatSync(keyFile).isFile() || fs.lstatSync(keyFile).isSymbolicLink()) throw new Error("receipt key must be a regular file");
  return { store, key: fs.readFileSync(keyFile) };
}

function receiptPath(store, project, runId) {
  return path.join(store, `${digest(`${path.resolve(project)}\0${runId}`)}.json`);
}

function signature(payload, key) {
  return crypto.createHmac("sha256", key).update(JSON.stringify(payload)).digest("hex");
}

function writeEvidence(target, text) {
  // Exclusive temporary files + rename replace a malicious destination link instead of following it.
  const temporary = `${target}.${process.pid}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  fs.writeFileSync(temporary, text, { flag: "wx", mode: 0o600 });
  try { fs.renameSync(temporary, target); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}

function nodeTestSummary(output) {
  const keys = ["tests", "pass", "fail", "cancelled", "skipped", "todo"];
  const summary = {};
  for (const key of keys) {
    const entries = [...output.matchAll(new RegExp(`^# ${key} (\\d+)\\s*$`, "gm"))];
    if (entries.length !== 1) throw new Error(`missing or ambiguous TAP summary: ${key}`);
    summary[key] = Number(entries[0][1]);
  }
  if (summary.tests !== summary.pass + summary.fail + summary.cancelled + summary.skipped + summary.todo) {
    throw new Error("inconsistent TAP summary");
  }
  return summary;
}

export function runChecks(project, runId, context, runDirectory) {
  const { store, key } = receiptStore(project);
  const target = receiptPath(store, project, runId);
  // An interrupted or crashed re-verification must never resurrect an older pass.
  if (fs.existsSync(target)) fs.unlinkSync(target);
  const results = [];
  for (const id of context.required) {
    const check = context.policy.checks.find((entry) => entry.id === id);
    const command = check.command[0] === "$node" ? process.execPath : check.command[0];
    const startedAt = new Date().toISOString();
    const environment = { ...process.env };
    delete environment.NODE_OPTIONS;
    delete environment.NODE_TEST_CONTEXT;
    const output = spawnSync(command, check.command.slice(1), { cwd: project, encoding: "utf8",
      shell: false, windowsHide: true, timeout: check.timeout_ms, maxBuffer: 16 * 1024 * 1024,
      env: environment });
    const log = `${output.stdout ?? ""}\n${output.stderr ?? ""}`;
    writeEvidence(path.join(runDirectory, `verification-${id}.log`), log);
    let reason = output.error?.message ?? (output.signal ? `terminated by ${output.signal}` : null);
    let summary = null;
    if (output.status !== 0) reason ??= `exit code ${output.status}`;
    if (!reason && check.kind === "node-test") {
      try {
        summary = nodeTestSummary(output.stdout ?? "");
        if (summary.tests < check.minimum_tests || summary.fail || summary.cancelled || summary.skipped || summary.todo) {
          reason = "test count below minimum, or failed/cancelled/skipped/todo tests";
        }
      } catch (error) { reason = error.message; }
    }
    results.push({ id, command: check.command, started_at: startedAt, finished_at: new Date().toISOString(),
      exit_code: output.status, status: reason ? "fail" : "pass", reason, summary, log_hash: digest(log) });
  }
  const after = sourceSnapshot(project);
  const unchanged = JSON.stringify(after) === JSON.stringify(context.snapshot);
  const payload = { schema_version: 1, run_id: runId, base: context.base, policy_hash: context.policy_hash,
    approved_head: context.approved_head,
    required: context.required, snapshot: context.snapshot, finished_at: new Date().toISOString(),
    status: unchanged && results.every((result) => result.status === "pass") ? "pass" : "fail",
    source_changed_during_verification: !unchanged, results };
  const envelope = { payload, signature: signature(payload, key) };
  writeEvidence(target, JSON.stringify(envelope, null, 2) + "\n");
  writeEvidence(path.join(runDirectory, "verification.json"), JSON.stringify(payload, null, 2) + "\n");
  return payload;
}

export function assertVerified(project, runId, context, runDirectory) {
  const { store, key } = receiptStore(project);
  const target = receiptPath(store, project, runId);
  if (!fs.existsSync(target)) throw new Error("required verification has not run; use the verify command");
  if (!fs.lstatSync(target).isFile() || fs.lstatSync(target).isSymbolicLink()) throw new Error("verification receipt must be a regular file");
  const envelope = JSON.parse(fs.readFileSync(target, "utf8"));
  if (!envelope.payload || envelope.signature !== signature(envelope.payload, key)) throw new Error("verification receipt is invalid or modified");
  const record = envelope.payload;
  if (record.schema_version !== 1 || record.run_id !== runId || record.base !== context.base
    || record.policy_hash !== context.policy_hash || record.approved_head !== context.approved_head) throw new Error("verification receipt does not match the trusted policy/run or external approval");
  if (record.status !== "pass") throw new Error("required verification failed; completion blocked");
  const finishedAt = Date.parse(record.finished_at);
  if (!Number.isFinite(finishedAt) || finishedAt > Date.now()
    || Date.now() - finishedAt > context.policy.max_age_seconds * 1000) {
    throw new Error("stale verification: receipt expired or has an invalid timestamp; rerun verify");
  }
  if (JSON.stringify(record.snapshot) !== JSON.stringify(context.snapshot)) throw new Error("stale verification: source or HEAD changed; rerun verify");
  if (JSON.stringify(record.required) !== JSON.stringify(context.required)
    || record.results.length !== context.required.length
    || context.required.some((id) => !record.results.some((item) => item.id === id && item.status === "pass" && item.exit_code === 0))) {
    throw new Error("required verification results are missing");
  }
  for (const item of record.results) {
    const log = path.join(runDirectory, `verification-${item.id}.log`);
    if (!fs.existsSync(log) || !fs.lstatSync(log).isFile() || fs.lstatSync(log).isSymbolicLink()
      || digest(fs.readFileSync(log)) !== item.log_hash) {
      throw new Error(`verification evidence is missing or modified: ${item.id}`);
    }
  }
  return record;
}
