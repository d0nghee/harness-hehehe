import fs from "node:fs";
import path from "node:path";
import { digest, git, trustedContext } from "../plugins/hehehe/skills/resume/scripts/verification-policy.mjs";
import { assertVerified, runChecks } from "../plugins/hehehe/skills/resume/scripts/verification-runner.mjs";
import { compareVersions, packageIdentity, releasePolicyContext, releaseSource, releaseTags, repositoryInfo } from "./release-policy.mjs";
import { inspectArtifact, integrityOf, loadRelease, packCommitted, releaseStore, requestDirectory, saveRelease, withReleaseLock } from "./release-store.mjs";

function identity(record) {
  return { head: record.head, name: record.name, version: record.version, tag: record.tag,
    notes_hash: record.notes.hash, artifact_integrity: record.artifact.integrity,
    release_policy_hash: record.release_policy.hash, verification_base: record.verification_base };
}
const requestIdFor = (record) => `release-${digest(JSON.stringify(identity(record))).slice(0, 24)}`;
function baseRecord(source, details, policy, artifact) {
  return { schema_version: 1, head: source.head, name: details.name, version: details.version,
    tag: details.tag, notes: details.notes, artifact,
    repository: policy.policy.repository, registry: policy.policy.registry,
    dist_tag: policy.policy.dist_tag, target_branch: policy.policy.target_branch,
    verification_base: policy.base, release_policy: policy };
}
function manifestDiff(before, after) {
  const left = new Map(before.map((file) => [file.path, file])), right = new Map(after.map((file) => [file.path, file]));
  return { added: [...right.keys()].filter((file) => !left.has(file)).sort(),
    deleted: [...left.keys()].filter((file) => !right.has(file)).sort(),
    changed: [...right.keys()].filter((file) => left.has(file) && left.get(file).sha256 !== right.get(file).sha256).sort() };
}
export async function releasePlan(project) {
  repositoryInfo(project);
  const source = releaseSource(project, false), policy = releasePolicyContext(project);
  const details = packageIdentity(project, source.head, policy.policy), tags = releaseTags(project, source.head);
  const previous = tags.find((tag) => tag.ancestor) ?? null;
  const current = packCommitted(project, source.head);
  const last = previous ? packCommitted(project, previous.head) : { files: [] };
  const changes = manifestDiff(last.files, current.files);
  const artifactChanged = previous === null || current.integrity !== last.integrity;
  const pending = artifactChanged || source.dirty_paths.length > 0 || changes.added.length + changes.deleted.length + changes.changed.length > 0;
  const bump = pending && tags.length > 0 && compareVersions(details.version, tags[0].version) <= 0;
  const record = loadRelease(releaseStore(project));
  return { schema_version: 1, status: pending ? "release_pending" : "no_package_changes", external_state: "unchecked",
    head: source.head, name: details.name, version: details.version, tag: details.tag,
    policy_mode: policy.mode, verification_base: policy.base, dirty_paths: source.dirty_paths,
    previous_release: previous, highest_known_tag: tags[0] ?? null, version_bump_required: bump,
    notes_ready: Boolean(details.notes.text), artifact_changed: artifactChanged, changes, files: current.files,
    last_publication: record ? { request_id: record.request_id, status: record.status, observed_at: record.observed_at ?? null } : null };
}
function assertArtifact(record) {
  const details = fs.lstatSync(record.artifact.path);
  if (!details.isFile() || details.isSymbolicLink()) throw new Error("release artifact must be a regular frozen file");
  const bytes = fs.readFileSync(record.artifact.path);
  if (bytes.length !== record.artifact.size || integrityOf(bytes) !== record.artifact.integrity || digest(bytes) !== record.artifact.sha256
    || JSON.stringify(inspectArtifact(bytes)) !== JSON.stringify(record.artifact.files)) throw new Error("release artifact changed; prepare a new candidate and approval");
  return bytes;
}
function assertLocal(project, record, requireTrusted = true) {
  const source = releaseSource(project);
  if (source.head !== record.head) throw new Error("release source HEAD changed");
  const context = releasePolicyContext(project, { expectedBase: record.verification_base, requireTrusted });
  const details = packageIdentity(project, record.head, context.policy);
  if (context.hash !== record.release_policy.hash || context.mode !== record.release_policy.mode
    || details.name !== record.name || details.version !== record.version || details.tag !== record.tag
    || details.notes.hash !== record.notes.hash || details.notes.text !== record.notes.text
    || context.policy.repository !== record.repository || context.policy.registry !== record.registry
    || context.policy.target_branch !== record.target_branch || context.policy.dist_tag !== record.dist_tag
    || requestIdFor(record) !== record.request_id) throw new Error("release identity, notes or policy changed");
  assertArtifact(record);
  return trustedContext(project, record.verification_base);
}
export async function prepareRelease(project, { resumeRequestId } = {}) {
  return withReleaseLock(project, async (store) => {
    const source = releaseSource(project), policy = releasePolicyContext(project);
    const details = packageIdentity(project, source.head, policy.policy);
    if (!details.notes.text) throw new Error("release requires explicit non-empty versioned CHANGELOG notes");
    const existing = loadRelease(store);
    if (existing && existing.head === source.head && existing.version === details.version
      && existing.notes.hash === details.notes.hash && existing.release_policy.hash === policy.hash
      && existing.verification_base === policy.base) {
      if (resumeRequestId && resumeRequestId !== existing.request_id) throw new Error("resume request does not match the frozen release");
      assertArtifact(existing);
      return existing;
    }
    const tags = releaseTags(project, source.head), highest = tags[0];
    const exact = tags.find((tag) => tag.tag === details.tag);
    const reconstruct = resumeRequestId && exact?.head === source.head && highest?.version === details.version;
    if (highest && compareVersions(details.version, highest.version) <= 0 && !reconstruct) {
      throw new Error("release version must be greater than existing release tags; version bump required");
    }
    const packed = packCommitted(project, source.head);
    const record = baseRecord(source, details, policy, { integrity: packed.integrity, sha256: packed.sha256, size: packed.size, files: packed.files });
    record.request_id = requestIdFor(record);
    if (resumeRequestId && resumeRequestId !== record.request_id) throw new Error("reconstructed release does not match the requested artifact/notes/policy identity");
    const directory = requestDirectory(store, record.request_id);
    record.artifact.path = path.join(directory, "package.tgz");
    fs.mkdirSync(directory, { recursive: true });
    if (fs.existsSync(record.artifact.path)) {
      const details = fs.lstatSync(record.artifact.path);
      if (!details.isFile() || details.isSymbolicLink()) throw new Error("frozen artifact path must be a regular file");
      const old = fs.readFileSync(record.artifact.path);
      if (!old.equals(packed.bytes)) throw new Error("frozen artifact path is already occupied by different bytes");
    } else fs.writeFileSync(record.artifact.path, packed.bytes, { flag: "wx", mode: 0o600 });
    record.status = "prepared";
    record.steps = { npm: false, tag: false, github: false };
    record.created_at = new Date().toISOString();
    releaseSource(project);
    if (git(project, ["rev-parse", "HEAD"]).trim() !== record.head) throw new Error("source changed during release preparation");
    return saveRelease(store, record);
  });
}
export async function verifyRelease(project, requestId) {
  return withReleaseLock(project, async (store) => {
    const record = loadRelease(store, requestId), context = assertLocal(project, record);
    const directory = requestDirectory(store, record.request_id);
    // Request identity includes the frozen artifact, notes, policy and source.
    const result = runChecks(project, record.request_id, context, directory);
    assertLocal(project, record);
    const preserved = ["partial", "publishing", "released"].includes(record.status);
    const next = { ...record, status: preserved ? record.status : result.status === "pass" ? "verified" : "verification_failed",
      verification_status: result.status, verification: { project: path.resolve(project), approved_head: context.approved_head,
        base: context.base, policy_hash: context.policy_hash, finished_at: result.finished_at, snapshot: result.snapshot }, updated_at: new Date().toISOString() };
    saveRelease(store, next);
    if (result.status !== "pass") throw new Error("required release verification failed; publication blocked");
    return next;
  });
}
export async function releaseStatus(project, requestId) {
  return loadRelease(releaseStore(project), requestId) ?? { status: "not_prepared", external_state: "unchecked" };
}
function assertApproval(record) {
  if (process.env.HEHEHE_RELEASE_APPROVED_HEAD !== record.head
    || process.env.HEHEHE_RELEASE_APPROVED_VERSION !== record.version
    || process.env.HEHEHE_RELEASE_APPROVAL_ID !== record.request_id
    || process.env.HEHEHE_RELEASE_APPROVED_INTEGRITY !== record.artifact.integrity) throw new Error("external release approval must match the exact source, version, request and tarball integrity");
}
function verifiedLocal(project, record, store) {
  assertApproval(record);
  const context = assertLocal(project, record);
  if (record.verification_status !== "pass") throw new Error("release verification is missing or failed");
  assertVerified(project, record.request_id, context, requestDirectory(store, record.request_id));
}
function matchingNpm(record, value) {
  if (value === null) return false;
  if (value?.name !== record.name || value?.version !== record.version || !Buffer.isBuffer(value.bytes)
    || value.integrity !== record.artifact.integrity || integrityOf(value.bytes) !== record.artifact.integrity
    || digest(value.bytes) !== record.artifact.sha256) throw new Error("npm version conflicts with the approved tarball bytes");
  return true;
}
async function externalState(record, gateway) {
  const [remote, npm, latest, tag, github] = await Promise.all([
    gateway.remoteMain(record), gateway.getNpmVersion(record), gateway.getNpmLatest(record), gateway.getTag(record), gateway.getGithubRelease(record),
  ]);
  if (remote !== record.head) throw new Error("remote main is not the exact approved release source");
  const npmMatches = matchingNpm(record, npm);
  if ((npmMatches && latest !== record.version) || (!npmMatches && latest !== null && compareVersions(latest, record.version) >= 0)) throw new Error("npm latest conflicts with the approved release version");
  if (tag !== null && tag?.sha !== record.head) throw new Error("release tag points to a different source commit");
  if (github !== null && (github?.tag !== record.tag || github.body !== record.notes.text || github.draft !== false
    || github.prerelease !== false || tag === null
    || (/^[a-f0-9]{40}$/.test(github.target_commitish ?? "") && github.target_commitish !== record.head))) throw new Error("GitHub Release conflicts with the approved tag, notes or published state");
  return { npm: npmMatches, tag: tag !== null, github: github !== null, latest };
}
export async function publishRelease(project, requestId, gateway) {
  return withReleaseLock(project, async (store) => {
    let record = loadRelease(store, requestId);
    // No gateway call (including write calls) occurs before local authorization.
    verifiedLocal(project, record, store);
    let observed;
    try {
      observed = await externalState(record, gateway); // Preflight every conflict before irreversible npm publication.
      for (const [step, write] of [["npm", "publishNpm"], ["tag", "createTag"], ["github", "createGithubRelease"]]) {
        observed = await externalState(record, gateway);
        if (observed[step]) {
          record = saveRelease(store, { ...record, steps: { ...record.steps, [step]: true } });
          continue;
        }
        // Recheck both source/receipts and the external main immediately before each missing write.
        if (await gateway.remoteMain(record) !== record.head) throw new Error("remote main advanced before a release step");
        verifiedLocal(project, record, store);
        record = saveRelease(store, { ...record, status: "publishing", in_flight: step, updated_at: new Date().toISOString() });
        await gateway[write](record);
        observed = await externalState(record, gateway);
        if (!observed[step]) throw new Error(`external ${step} publication did not reconcile to the approved result`);
        record = saveRelease(store, { ...record, in_flight: null, steps: { ...record.steps, [step]: true } });
      }
      verifiedLocal(project, record, store);
      observed = await externalState(record, gateway);
      if (!observed.npm || !observed.tag || !observed.github || observed.latest !== record.version) throw new Error("release is incomplete");
      return saveRelease(store, { ...record, status: "released", in_flight: null, steps: observed, error: null, observed_at: new Date().toISOString() });
    } catch (error) {
      try { saveRelease(store, { ...record, status: "partial", error: error.message, updated_at: new Date().toISOString() }); }
      catch (journalError) { throw new AggregateError([error, journalError], "release interrupted; reconcile the same request before retrying"); }
      throw error;
    }
  });
}
