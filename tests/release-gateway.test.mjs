import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import test from "node:test";
import { createReleaseGateway, resolveNpmCli } from "../scripts/release-gateway.mjs";

const head = "a".repeat(40);
const tarball = Buffer.from("frozen package archive");
const integrity = (bytes) => `sha512-${createHash("sha512").update(bytes).digest("base64")}`;
function record(extra = {}) {
  return { head, name: "release-fixture", version: "1.2.3", tag: "v1.2.3", repository: "owner/repo",
    registry: "https://registry.npmjs.org", dist_tag: "latest", target_branch: "main",
    notes: { text: "Frozen notes\n\n- exact change\n" }, artifact: { integrity: integrity(tarball) }, ...extra };
}
function metadata(extra = {}) {
  return { name: "release-fixture", version: "1.2.3", dist: {
    integrity: integrity(tarball), tarball: "https://registry.npmjs.org/release-fixture/-/release-fixture-1.2.3.tgz" }, ...extra };
}
function json(data, status = 200) { return new Response(JSON.stringify(data), { status }); }
function github(data, status = 200) {
  return { status: status >= 400 ? 1 : 0, stdout: `HTTP/2.0 ${status} Response\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}`, stderr: "" };
}

test("npm absence accepts only metadata HTTP 404, not network/auth/rate/server/JSON failures", async () => {
  assert.equal(await createReleaseGateway({ fetchImpl: async () => json({}, 404) }).getNpmVersion(record()), null);
  for (const status of [401, 403, 429, 500, 503]) {
    await assert.rejects(createReleaseGateway({ fetchImpl: async () => json({}, status) }).getNpmVersion(record()), /HTTP/);
  }
  await assert.rejects(createReleaseGateway({ fetchImpl: async () => { throw new Error("secret network diagnostic"); } }).getNpmVersion(record()), /request failed$/);
  await assert.rejects(createReleaseGateway({ fetchImpl: async () => new Response("not JSON") }).getNpmVersion(record()), /Invalid npm registry metadata/);
});

test("npm existence downloads actual tarball bytes and rejects metadata-only integrity claims", async () => {
  let reads = 0;
  const gateway = createReleaseGateway({ fetchImpl: async (url, options) => {
    reads += 1;
    assert.equal(options.redirect, "manual"); assert.equal(options.credentials, "omit");
    assert.equal(options.headers.authorization, undefined);
    return url.endsWith(".tgz") ? new Response(tarball) : json(metadata());
  } });
  const found = await gateway.getNpmVersion(record());
  assert.equal(reads, 2); assert.deepEqual(found.bytes, tarball); assert.equal(found.integrity, integrity(tarball));
  const wrong = createReleaseGateway({ fetchImpl: async (url) => url.endsWith(".tgz") ? new Response("different archive") : json(metadata()) });
  await assert.rejects(wrong.getNpmVersion(record()), /does not match registry integrity/);
});

test("wrong npm identities, missing SRI and absent tarball do not count as a released version", async () => {
  for (const value of [metadata({ name: "other" }), metadata({ version: "2.0.0" }), metadata({ dist: {} })]) {
    await assert.rejects(createReleaseGateway({ fetchImpl: async () => json(value) }).getNpmVersion(record()), /unexpected package/);
  }
  await assert.rejects(createReleaseGateway({ fetchImpl: async (url) => url.endsWith(".tgz") ? json({}, 404) : json(metadata()) }).getNpmVersion(record()), /HTTP 404/);
});

test("tarball URLs and redirects cannot escape the official credential-free HTTPS registry", async () => {
  for (const location of ["http://registry.npmjs.org/file.tgz", "https://evil.invalid/file.tgz", "https://user:secret@registry.npmjs.org/file.tgz", "https://registry.npmjs.org:444/file.tgz"]) {
    let reads = 0;
    const gateway = createReleaseGateway({ fetchImpl: async () => {
      reads += 1;
      return json(metadata({ dist: { integrity: integrity(tarball), tarball: location } }));
    } });
    await assert.rejects(gateway.getNpmVersion(record()), /official HTTPS/); assert.equal(reads, 1);
  }
  const gateway = createReleaseGateway({ fetchImpl: async (url) => url.endsWith(".tgz")
    ? new Response(null, { status: 302, headers: { location: "https://evil.invalid/archive" } }) : json(metadata()) });
  await assert.rejects(gateway.getNpmVersion(record()), /official HTTPS/);
});

test("official redirects remain bounded and preserve downloaded bytes", async () => {
  const gateway = createReleaseGateway({ fetchImpl: async (url) => url.endsWith("/redirected") ? new Response(tarball)
    : url.endsWith(".tgz") ? new Response(null, { status: 302, headers: { location: "/redirected" } }) : json(metadata()) });
  assert.deepEqual((await gateway.getNpmVersion(record())).bytes, tarball);
  let reads = 0;
  const loop = createReleaseGateway({ fetchImpl: async () => { reads += 1; return new Response(null, { status: 307, headers: { location: "/again" } }); } });
  await assert.rejects(loop.getNpmVersion(record()), /redirect limit/); assert.equal(reads, 4);
});

test("oversized metadata and streamed archives fail before accepting remote integrity", async () => {
  await assert.rejects(createReleaseGateway({ maxJsonBytes: 4, fetchImpl: async () => json(metadata()) }).getNpmVersion(record()), /permitted size/);
  const contentLength = createReleaseGateway({ fetchImpl: async (url) => url.endsWith(".tgz")
    ? new Response(tarball, { headers: { "content-length": "999999999" } }) : json(metadata()) });
  await assert.rejects(contentLength.getNpmVersion(record()), /permitted size/);
  const streamed = createReleaseGateway({ maxTarballBytes: 4, fetchImpl: async (url) => url.endsWith(".tgz") ? new Response(tarball) : json(metadata()) });
  await assert.rejects(streamed.getNpmVersion(record()), /permitted size/);
});

test("npm latest is observed independently and validates the returned package identity", async () => {
  assert.equal(await createReleaseGateway({ fetchImpl: async () => json(metadata()) }).getNpmLatest(record()), "1.2.3");
  assert.equal(await createReleaseGateway({ fetchImpl: async () => json({}, 404) }).getNpmLatest(record()), null);
  for (const value of [metadata({ name: "other" }), metadata({ version: "1.2.3-beta" })]) {
    await assert.rejects(createReleaseGateway({ fetchImpl: async () => json(value) }).getNpmLatest(record()), /unexpected latest/);
  }
});

test("GitHub read absence requires an actual HTTP 404, and requests pin github.com", async () => {
  const calls = [];
  const gateway = createReleaseGateway({ environment: { GH_HOST: "evil.invalid", GH_TOKEN: "not-an-argv-token", NODE_OPTIONS: "forbidden" }, executor: (command, args, options) => {
    calls.push({ command, args, options }); return github({}, 404);
  } });
  assert.equal(await gateway.getTag(record()), null); assert.equal(await gateway.getGithubRelease(record()), null);
  for (const call of calls) {
    assert.equal(call.command, "gh"); assert.equal(call.options.shell, false);
    assert.equal(call.args[call.args.indexOf("--hostname") + 1], "github.com");
    assert.equal(call.args.some((arg) => arg.includes("not-an-argv-token")), false);
    assert.equal(call.options.env.NODE_OPTIONS, undefined);
  }
  for (const status of [401, 403, 429, 500]) {
    await assert.rejects(createReleaseGateway({ executor: () => github({}, status) }).getTag(record()), /failed/);
  }
  await assert.rejects(createReleaseGateway({ executor: () => ({ error: new Error("network"), status: null }) }).getGithubRelease(record()), /could not execute/);
  await assert.rejects(createReleaseGateway({ executor: () => ({ status: 1, stdout: "not a status line", stderr: "HTTP 404" }) }).getTag(record()), /failed/);
});

test("Git tag lookups peel annotated tags and creation never moves an existing tag", async () => {
  const annotated = "b".repeat(40), calls = [];
  const gateway = createReleaseGateway({ executor: (command, args, options) => {
    calls.push({ args, options });
    if (args.includes("POST")) return github({ ref: "refs/tags/v1.2.3" }, 201);
    return github({ object: { type: args.at(-1).includes("git/tags/") ? "commit" : "tag", sha: args.at(-1).includes("git/tags/") ? head : annotated } });
  } });
  assert.deepEqual(await gateway.getTag(record()), { sha: head });
  await gateway.createTag(record());
  const body = JSON.parse(calls.at(-1).options.input);
  assert.deepEqual(body, { ref: "refs/tags/v1.2.3", sha: head });
  assert.equal(calls.at(-1).args.includes("PATCH"), false);
});

test("GitHub release creation binds exact tag, source SHA, frozen notes and stable public state", async () => {
  let created;
  const gateway = createReleaseGateway({ executor: (command, args, options) => {
    if (args.includes("POST")) { created = JSON.parse(options.input); return github(created, 201); }
    return github({ tag_name: "v1.2.3", body: record().notes.text, draft: false, prerelease: false, target_commitish: head });
  } });
  await gateway.createGithubRelease(record());
  assert.equal(created.tag_name, "v1.2.3"); assert.equal(created.target_commitish, head);
  assert.equal(created.body, record().notes.text); assert.equal(created.draft, false); assert.equal(created.prerelease, false);
  assert.deepEqual(await gateway.getGithubRelease(record()), { tag: "v1.2.3", body: record().notes.text, draft: false, prerelease: false, target_commitish: head });
});

test("publication uses only the verified absolute tgz with Node npm-cli argv, never a shell or source repack", async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-gateway-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const archive = path.join(root, "approved package.tgz"); fs.writeFileSync(archive, tarball);
  const runtime = path.join(root, "npm-cli.js"), calls = [];
  const gateway = createReleaseGateway({ npmCliPath: runtime, environment: { GITHUB_ACTIONS: "true", ACTIONS_ID_TOKEN_REQUEST_URL: "oidc-environment", NODE_TEST_CONTEXT: "forbidden" }, executor: (command, args, options) => {
    calls.push({ command, args, options }); return { status: 0 };
  } });
  const approved = record({ artifact: { path: archive, integrity: integrity(tarball) } });
  await gateway.publishNpm(approved);
  assert.equal(calls.length, 1); const call = calls[0];
  assert.equal(call.command, process.execPath); assert.deepEqual(call.args.slice(0, 3), [runtime, "publish", archive]);
  assert.ok(call.args.includes("--ignore-scripts")); assert.ok(call.args.includes("--provenance"));
  assert.equal(call.args.includes("pack"), false); assert.equal(call.options.cwd, root); assert.equal(call.options.shell, false);
  assert.equal(call.options.env.NODE_TEST_CONTEXT, undefined);
  fs.writeFileSync(archive, "changed");
  await assert.rejects(gateway.publishNpm(approved), /changed before publication/); assert.equal(calls.length, 1);
  await assert.rejects(gateway.publishNpm(record({ artifact: { path: "relative.tgz", integrity: integrity(tarball) } })), /absolute tarball/);
});

test("npm CLI locator resolves only an existing npm-cli.js rather than executing npm.cmd", (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hehehe-npm-runtime-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.join(root, "node_modules/npm/bin/npm-cli.js"); fs.mkdirSync(path.dirname(cli), { recursive: true }); fs.writeFileSync(cli, "// fake locator fixture");
  assert.equal(resolveNpmCli({ execPath: path.join(root, "node.exe"), pathValue: "", npmExecPath: null }), cli);
  const preferred = path.join(root, "preferred/npm-cli.js");
  fs.mkdirSync(path.dirname(preferred)); fs.writeFileSync(preferred, "// explicit npm runtime fixture");
  assert.equal(resolveNpmCli({ execPath: path.join(root, "node.exe"), pathValue: "", npmExecPath: preferred }), preferred);
  assert.throws(() => resolveNpmCli({ execPath: path.join(root, "missing/node.exe"), pathValue: "", npmExecPath: path.join(root, "npm.cmd") }), /not found/);
});

test("gateways reject unapproved repository/registry/tag scope before executing any request", async () => {
  let calls = 0;
  const gateway = createReleaseGateway({ executor: () => { calls += 1; throw new Error("must not run"); }, fetchImpl: async () => { calls += 1; throw new Error("must not fetch"); } });
  for (const value of [record({ repository: "owner/.." }), record({ registry: "https://evil.invalid" }), record({ tag: "other" }), record({ target_branch: "other" })]) {
    await assert.rejects(gateway.getNpmVersion(value));
  }
  assert.equal(calls, 0);
});
