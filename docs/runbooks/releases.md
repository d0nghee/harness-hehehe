# Approval-bound package releases

This procedure belongs to the harness-hehehe repository. It does not grant publication authority to another project or turn a local implementation request into a release request. The default handoff reports source delivery and publication separately. Several commits may be grouped in one release; a pending plan must remain visible until publication is requested.

## Read-only planning

```text
npm run release:plan
npm run release:status -- --request <release-request-id>
```

The plan compares the package's committed publishable files with the last matching release tag, including removals. It reports the current version and preparation gaps. Package content changes, including packaged documentation, remain pending even when that version already exists. Local execution records are not package changes. A plan is not proof that npm or GitHub has been updated.

The reviewed configuration lives in `.hehehe/release-policy.json`; unknown fields and invalid identities are rejected. Verification reads that policy from the externally pinned `HEHEHE_VERIFICATION_BASE`. If the baseline predates this feature, planning can describe the proposed configuration, but verification/publication are blocked until independent policy adoption. Never select HEAD as a replacement trust root or add an exemption to suppress pending changes.

## Prepare one candidate

Prepare the new version in both `package.json` and `plugins/hehehe/.codex-plugin/plugin.json`, a versioned CHANGELOG entry and concise README version displays before committing and freezing a candidate. Inspect its changes and the plan first. Local-only work can keep the old version and remain pending; it does not need a publication attempt.

```text
node scripts/release.mjs prepare --project <repository-root> --json
node scripts/release.mjs verify --project <repository-root> --request <release-request-id> --json
```

Preparation rejects dirty source and unsafe linked paths. It copies the committed Git blobs to an owned staging area and runs `npm pack --ignore-scripts`; ignored files, checkout line-ending conversions and unrelated worktree changes are excluded. The resulting `.tgz`, integrity, source SHA, version, tag, release notes and policy are bound to one deterministic request. The Git-common release store holds its artifact, signed journal and verification evidence outside the source snapshot. Do not hand-edit that state or reuse a request after changing the candidate.

Use consistent Node/npm tooling for the reviewed package and manual workflow reconstruction. If a toolchain difference changes the package integrity, reconstruction must stop for a new package review; it must not replace the approved hash with the newly computed value. Canonical Git bytes remove checkout line-ending differences, rather than promising arbitrary npm versions produce identical archives.

Verification executes the existing pinned completion checks and enforces the release identity. The original checks and thresholds still apply. A missing, failing, expired, changed-source or modified-artifact result blocks publication. Reverify an unchanged request when evidence expires. Policy and protected-input changes need their own exact human review; promotion of a replacement verification baseline remains a separate decision.

Keep the recorded verification baseline and any exact-head protected-input approval unchanged through publication. A later baseline promotion does not repin an existing request: finish the release first or prepare and approve a replacement request under the newly adopted base. First adoption of these release tools must be completed separately before preparing the first publishable request. If main is uploaded before the remote CI baseline is promoted, its initial planning job deliberately blocks; update the variable only under the separately approved promotion, then rerun planning.

## Approval and publication

Present the full source SHA, version, tag, notes, artifact integrity, release request ID and all intended external actions before approval. The sole owner may approve them; a second account is not required. Main delivery, remote push and publication authority must each be explicit, and may be approved together for the same candidate. The release command never pushes main itself.

After the approved source is present on remote main and the checks are fresh, the trusted caller supplies the actual decision:

```text
HEHEHE_RELEASE_APPROVED_HEAD=<full-candidate-SHA>
HEHEHE_RELEASE_APPROVED_VERSION=<approved-version>
HEHEHE_RELEASE_APPROVAL_ID=<release-request-id>
HEHEHE_RELEASE_APPROVED_INTEGRITY=<approved-tgz-sha512-SRI>
```

These fields must come from the human decision or trusted operator integration. They must not be synthesized from a plan, passing checks or an implementation agent's own approval claim. Existing `HEHEHE_VERIFICATION_APPROVED_HEAD`, when necessary for protected source changes, likewise remains an independently supplied exact-head decision.

```text
node scripts/release.mjs publish --project <repository-root> --request <release-request-id> --json
```

The command checks remote main, publishes the exact tested file, and verifies actual registry bytes. An existing version is a successful retry only if its bytes match. A different artifact is a conflict, never permission to overwrite or automatically bump the version. It checks the distribution tag, resolves the Git tag to the exact commit and creates the matching GitHub Release notes. It never moves an existing conflicting tag. Network, authorization, rate-limit and malformed metadata errors stop the operation; only explicit not-found results allow creation.

The `publish.yml` workflow keeps its filename for existing npm trusted-publisher identity. A main push has read-only permissions and only validates/plans. An explicitly authorized manual dispatch supplies the candidate SHA, version, request ID and integrity; the job prepares the same identity, runs trusted checks and checks those operator-supplied values before publishing. Tools are loaded from the configured reviewed baseline. Never substitute the dispatch SHA for the trust baseline or protected-input approval. Keep the npm trusted-publisher repository/workflow and allowed publication action configured by the operator; this feature does not silently change npm or repository settings.

The manual job can publish and therefore accepts only human-reviewed main code. Its verification step clears publication token and OIDC request environment variables, and checkout persists no credentials. This is not a sandbox against hostile code running with the same job account; use separate trusted jobs or an external approval boundary for that threat model. OIDC publication requires the npm-supported Node/npm versions; the workflow selects Node 24. Older local tooling can plan and prepare without being an OIDC publishing environment.

## Partial results and completion

Every external step is journaled. If npm succeeds and GitHub publication fails, retry the same request after resolving the cause. Remote reconciliation also handles a process stopping after an external success but before its journal update. Do not republish, delete an existing version, move tags, or create a new version merely to retry. A fresh runner can prepare the same committed candidate and request and reconcile its remote results.

A process killed while holding `hehehe-release/mutation.lock` leaves the lock in the Git common directory. Inspect its recorded PID and interrupted operation before explicitly removing that exact stale lock; commands never steal it automatically. Preserve the request journal, integrity key and package while recovering.

Only matching package bytes, the expected distribution tag, exact tag commit and published release notes authorize `released`. A previously released journal still describes that recorded release; it is not a fresh audit that no external state has subsequently changed. Keep pending or partial states visible and retain evidence for recovery. Do not infer a successful release from a main push, version string, registry metadata alone or local receipt alone.

The integrity key and approval assertions share the current filesystem/account trust boundary. They detect ordinary worktree tampering and stale results; they cannot distinguish a human from an unrestricted process using the same credentials. Stronger separation requires operator-controlled credentials or an external approval boundary.
