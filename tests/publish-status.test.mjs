import assert from "node:assert/strict";
import test from "node:test";
import { needsPublication } from "../scripts/publish-status.mjs";

const pkg = { name: "harness-hehehe", version: "0.3.14" };

test("published versions skip publication only after matching registry metadata", async () => {
  const publish = await needsPublication(pkg, async (url, options) => {
    assert.equal(url, "https://registry.npmjs.org/harness-hehehe/0.3.14");
    assert.ok(options.signal instanceof AbortSignal);
    return new Response(JSON.stringify(pkg), { status: 200 });
  });
  assert.equal(publish, false);
});

test("an explicit version-not-found response permits publication", async () => {
  assert.equal(await needsPublication(pkg, async () => new Response(null, { status: 404 })), true);
});

test("authentication, rate limit and server errors fail the publication check", async () => {
  for (const status of [401, 403, 429, 500, 503]) {
    await assert.rejects(needsPublication(pkg, async () => new Response(null, { status })), new RegExp(`HTTP ${status}`));
  }
});

test("network failures and timeouts fail instead of granting a publication decision", async () => {
  for (const error of [new TypeError("network unavailable"), new DOMException("timeout", "TimeoutError")]) {
    await assert.rejects(needsPublication(pkg, async () => { throw error; }), error);
  }
});

test("unexpected or malformed registry metadata cannot skip publication", async () => {
  for (const metadata of [{ ...pkg, version: "0.3.13" }, { ...pkg, name: "another-package" }, {}]) {
    await assert.rejects(needsPublication(pkg, async () => new Response(JSON.stringify(metadata))), /unexpected package metadata/);
  }
  await assert.rejects(needsPublication(pkg, async () => new Response("not json")), SyntaxError);
});

test("package identity is required before querying the registry", async () => {
  for (const metadata of [null, {}, { name: pkg.name }, { version: pkg.version }]) {
    await assert.rejects(needsPublication(metadata, async () => { assert.fail("registry must not be queried"); }), /name and version/);
  }
});
