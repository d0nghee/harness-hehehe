import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { invokeStore } from '../plugins/hehehe/skills/experience-memory/scripts/sqlite-store.mjs';

const STORE_URL = new URL('../plugins/hehehe/skills/experience-memory/scripts/sqlite-store.mjs', import.meta.url).href;
const PYTHON = (process.env.HEHEHE_MEMORY_PYTHON
  ? [[process.env.HEHEHE_MEMORY_PYTHON, []]]
  : process.platform === 'win32' ? [['python', []], ['py', ['-3']]] : [['python3', []], ['python', []]])
  .find(([command, args]) => spawnSync(command, [...args, '-I', '-B', '-S', '-c', 'import sqlite3'],
    { windowsHide: true, timeout: 10_000 }).status === 0);

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hehehe-memory-store-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, database: path.join(root, 'memory.sqlite'), repoId: 'repo-a' };
}

function record(id, text = 'SQLite transaction lesson', extra = {}) {
  return { id, text, payload: { id, note: text, ...extra } };
}

function call(f, operation, options = {}) {
  return invokeStore({ operation, database: f.database, repoId: f.repoId, ...options });
}

function python(f, script, args = []) {
  assert.ok(PYTHON, 'Python SQLite runtime must be available for store integration tests');
  const [command, prefix] = PYTHON;
  const result = spawnSync(command, [...prefix, '-I', '-B', '-S', '-c', script, f.database, ...args], {
    encoding: 'utf8', windowsHide: true, shell: false, timeout: 10_000,
  });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}

async function holdLock(f, kind) {
  const [command, prefix] = PYTHON;
  const script = 'import sqlite3,sys\nc=sqlite3.connect(sys.argv[1],isolation_level=None)\n'
    + (kind === 'reader' ? 'c.execute("BEGIN");c.execute("SELECT * FROM memory_records").fetchall()\n'
      : 'c.execute("BEGIN IMMEDIATE")\n')
    + 'print("ready",flush=True)\nsys.stdin.readline()\nc.rollback();c.close()\n';
  const child = spawn(command, [...prefix, '-I', '-B', '-S', '-c', script, f.database], {
    stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true, shell: false,
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('lock helper did not start')); }, 10_000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.once('data', chunk => {
      clearTimeout(timer);
      if (String(chunk).trim() === 'ready') resolve(); else reject(new Error('invalid lock helper output'));
    });
    child.once('exit', code => { clearTimeout(timer); if (code !== 0) reject(new Error('lock helper exited')); });
  });
  return async () => {
    await new Promise(resolve => { child.once('exit', resolve); child.stdin.end('\n'); });
  };
}

test('Python FTS5 probe succeeds without creating database paths', t => {
  const f = fixture(t);
  assert.deepEqual(invokeStore({ operation: 'probe' }), {
    status: 'ok', search_engine: 'sqlite-fts5', runtime: 'python-sqlite3', schema_version: 1,
  });
  assert.deepEqual(fs.readdirSync(f.root), []);
});

test('status and search on absent databases do not create files or parent directories', t => {
  const f = fixture(t);
  f.database = path.join(f.root, 'absent', 'nested', 'memory.sqlite');
  assert.deepEqual(call(f, 'status'), {
    status: 'empty', count: 0, database_exists: false, search_engine: 'sqlite-fts5',
  });
  assert.deepEqual(call(f, 'search', { terms: ['lesson'] }), {
    status: 'empty', count: 0, database_exists: false, search_engine: 'sqlite-fts5', records: [],
  });
  assert.deepEqual(fs.readdirSync(f.root), []);
});

test('sync persists SQLite records and a new Node process can search them', t => {
  const f = fixture(t);
  const payload = record('one', 'SQLite rollback 해결 방법', { opaque: { nested: [1, true, null] } });
  assert.equal(call(f, 'sync', { records: [payload] }).status, 'ok');
  assert.equal(call(f, 'status').count, 1);
  assert.equal(fs.readFileSync(f.database).subarray(0, 16).toString(), 'SQLite format 3\0');
  const script = `import { invokeStore } from ${JSON.stringify(STORE_URL)}; console.log(JSON.stringify(invokeStore(JSON.parse(process.argv[1]))));`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script,
    JSON.stringify({ operation: 'search', database: f.database, repoId: f.repoId, terms: ['해결'] })], {
    encoding: 'utf8', shell: false, windowsHide: true, timeout: 15_000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(JSON.parse(result.stdout).records, [payload.payload]);
});

test('sync replaces exactly one repository and preserves another repository', t => {
  const f = fixture(t);
  assert.equal(call(f, 'sync', { records: [record('old')] }).status, 'ok');
  assert.equal(call(f, 'sync', { repoId: 'repo-b', records: [record('other')] }).status, 'ok');
  assert.equal(call(f, 'sync', { records: [record('new')] }).status, 'ok');
  assert.deepEqual(call(f, 'search', { terms: ['SQLite'] }).records.map(x => x.id), ['new']);
  assert.deepEqual(call(f, 'search', { repoId: 'repo-b', terms: ['SQLite'] }).records.map(x => x.id), ['other']);
  assert.equal(call(f, 'sync', { records: [] }).count, 0);
  assert.equal(call(f, 'status').count, 0);
  assert.equal(call(f, 'status', { repoId: 'repo-b' }).count, 1);
});

test('parameterized identities and tokenized FTS queries cannot escape repository scope', t => {
  const f = fixture(t);
  const hostile = "x'); DROP TABLE memory_records; --";
  assert.equal(call(f, 'sync', { records: [record(hostile, 'sqlite syntax quote OR lesson')] }).status, 'ok');
  assert.equal(call(f, 'sync', { repoId: "repo' OR 1=1 --", records: [record('private', 'privateonly sqlite')] }).status, 'ok');
  const output = call(f, 'search', { terms: ['sqlite" OR repo_id:private NOT (', '-- * NEAR()'] });
  assert.equal(output.status, 'ok');
  assert.deepEqual(output.records.map(x => x.id), [hostile]);
  assert.equal(call(f, 'search', { terms: ['privateonly'] }).count, 0);
  assert.equal(call(f, 'status').count, 1);
  assert.equal(call(f, 'search', { terms: ['"*():_'] }).status, 'empty');
});

test('unicode61 prefix search, bm25 relevance and bounded result counts', t => {
  const f = fixture(t);
  assert.equal(call(f, 'sync', { records: Array.from({ length: 7 }, (_, i) => record(String(i),
    i === 0 ? 'transaction transaction transaction' : 'transaction lesson of a longer unrelated context example')) }).status, 'ok');
  assert.equal(call(f, 'search', { terms: ['transact'] }).count, 3);
  assert.equal(call(f, 'search', { terms: ['transact'], limit: 5 }).count, 5);
  assert.equal(call(f, 'search', { terms: ['transact'], limit: 50 }).count, 7);
  assert.equal(call(f, 'search', { terms: ['transact'], limit: 1 }).records[0].id, '0');
  assert.equal(call(f, 'search', { terms: ['transact'], limit: 51 }).error_code, 'MEMORY_INVALID_INPUT');
});

test('invalid replacement requests preserve existing persisted records', t => {
  const f = fixture(t);
  call(f, 'sync', { records: [record('original')] });
  for (const records of [[record('duplicate'), record('duplicate')], [record('large', 'x'.repeat(32769))],
    [record('payload', 'valid', { large: 'x'.repeat(65536) })]]) {
    assert.equal(call(f, 'sync', { records }).error_code, 'MEMORY_INVALID_INPUT');
    assert.deepEqual(call(f, 'search', { terms: ['SQLite'] }).records.map(x => x.id), ['original']);
  }
});

test('a commit blocked by a concurrent reader rolls back the whole repository replacement', async t => {
  const f = fixture(t);
  call(f, 'sync', { records: [record('original')] });
  const release = await holdLock(f, 'reader');
  let output;
  try { output = call(f, 'sync', { records: [record('replacement')] }); } finally { await release(); }
  assert.equal(output.error_code, 'MEMORY_STORE_BUSY');
  assert.deepEqual(call(f, 'search', { terms: ['SQLite'] }).records.map(x => x.id), ['original']);
});

test('a concurrent writer fails with a stable busy error and no lost records', async t => {
  const f = fixture(t);
  call(f, 'sync', { records: [record('original')] });
  const release = await holdLock(f, 'writer');
  let output;
  try { output = call(f, 'sync', { records: [record('replacement')] }); } finally { await release(); }
  assert.equal(output.error_code, 'MEMORY_STORE_BUSY');
  assert.equal(call(f, 'status').count, 1);
});

test('foreign databases and unsupported schema changes are rejected without writes', t => {
  const f = fixture(t);
  python(f, 'import sqlite3,sys\nc=sqlite3.connect(sys.argv[1]);c.execute("CREATE TABLE foreign_data(secret TEXT)");c.commit();c.close()');
  const before = fs.readFileSync(f.database);
  assert.equal(call(f, 'status').error_code, 'MEMORY_SCHEMA_UNSUPPORTED');
  assert.equal(call(f, 'sync', { records: [] }).error_code, 'MEMORY_SCHEMA_UNSUPPORTED');
  assert.deepEqual(fs.readFileSync(f.database), before);
  fs.unlinkSync(f.database);
  call(f, 'sync', { records: [record('original')] });
  python(f, 'import sqlite3,sys\nc=sqlite3.connect(sys.argv[1]);c.execute("CREATE VIEW unexpected AS SELECT * FROM memory_records");c.commit();c.close()');
  assert.equal(call(f, 'search', { terms: ['SQLite'] }).error_code, 'MEMORY_SCHEMA_UNSUPPORTED');
});

test('corrupt files return safe errors without including database contents', t => {
  const f = fixture(t);
  const secret = 'not sqlite; secret=do-not-return-this';
  fs.writeFileSync(f.database, secret);
  for (const operation of ['status', 'search', 'sync']) {
    const result = call(f, operation, { terms: ['secret'], records: [] });
    assert.equal(result.error_code, 'MEMORY_STORE_CORRUPT');
    assert.ok(!JSON.stringify(result).includes('do-not-return-this'));
  }
  assert.equal(fs.readFileSync(f.database, 'utf8'), secret);
});

test('database hardlinks, parent junctions and linked sidecars are rejected', t => {
  const f = fixture(t);
  call(f, 'sync', { records: [record('original')] });
  const hard = path.join(f.root, 'hard.sqlite');
  fs.linkSync(f.database, hard);
  assert.equal(call(f, 'status').error_code, 'MEMORY_UNSAFE_PATH');
  fs.unlinkSync(hard);
  const source = path.join(f.root, 'unrelated');
  fs.writeFileSync(source, 'do not overwrite');
  fs.linkSync(source, f.database + '-journal');
  assert.equal(call(f, 'sync', { records: [] }).error_code, 'MEMORY_UNSAFE_PATH');
  assert.equal(fs.readFileSync(source, 'utf8'), 'do not overwrite');
  fs.unlinkSync(f.database + '-journal');
  const alias = path.join(f.root, 'linked-parent');
  fs.symlinkSync(f.root, alias, process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(call(f, 'search', { database: path.join(alias, 'memory.sqlite'), terms: ['SQLite'] }).error_code,
    'MEMORY_UNSAFE_PATH');
  fs.unlinkSync(alias);
});

test('unavailable configured Python fails without automatic installation or filesystem writes', t => {
  const f = fixture(t);
  const script = `import { invokeStore } from ${JSON.stringify(STORE_URL)}; console.log(JSON.stringify(invokeStore({operation:'probe'})));`;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8', shell: false, windowsHide: true, timeout: 15_000,
    env: { ...process.env, HEHEHE_MEMORY_PYTHON: path.join(f.root, 'missing-python.exe') },
  });
  assert.equal(result.status, 0);
  assert.equal(JSON.parse(result.stdout).error_code, 'MEMORY_RUNTIME_UNAVAILABLE');
  assert.deepEqual(fs.readdirSync(f.root), []);
});

test('malformed and oversized bridge requests are rejected with bounded safe errors', t => {
  const f = fixture(t);
  assert.equal(invokeStore({ operation: 'unsafe' }).error_code, 'MEMORY_INVALID_INPUT');
  assert.equal(call(f, 'sync', { database: 'relative.sqlite', records: [] }).error_code, 'MEMORY_INVALID_INPUT');
  assert.equal(call(f, 'sync', { records: [record('huge', 'x'.repeat(1024 * 1024))] }).error_code, 'MEMORY_INVALID_INPUT');
  assert.equal(call(f, 'search', { terms: { raw: 'not a list' } }).error_code, 'MEMORY_INVALID_INPUT');
  assert.deepEqual(fs.readdirSync(f.root), []);
});
