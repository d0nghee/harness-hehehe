import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import { invokeStore } from '../plugins/hehehe/skills/experience-memory/scripts/sqlite-store.mjs';

const worker = fileURLToPath(new URL('../plugins/hehehe/skills/experience-memory/scripts/sqlite_worker.py', import.meta.url));
const python = (process.env.HEHEHE_MEMORY_PYTHON
  ? [[process.env.HEHEHE_MEMORY_PYTHON, []]]
  : process.platform === 'win32' ? [['python', []], ['py', ['-3']]] : [['python3', []], ['python', []]])
  .find(([command, prefix]) => {
    const result = spawnSync(command, [...prefix, '-I', '-B', '-S', worker], {
      input: '{"operation":"probe"}', encoding: 'utf8', windowsHide: true, timeout: 10_000,
    });
    try {
      const response = JSON.parse(result.stdout);
      return result.status === 0 && response.status === 'ok' && response.search_engine === 'sqlite-fts5';
    } catch { return false; }
  });

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hehehe-memory-atomic-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    fs.rmSync(root, { recursive: true, force: true });
  });
  return { root, database: path.join(root, 'memory.sqlite'), repoId: 'atomic-repo' };
}

const row = id => ({ id, text: 'atomic publication lesson', payload: { id } });
const request = (f, records = [row('restored')]) => ({ operation: 'sync', database: f.database, repoId: f.repoId, records });
const call = (f, operation, extra = {}) => invokeStore({ ...request(f), operation, ...extra });

// Inject faults in the unmodified worker at real I/O/publication boundaries.
// No production fault flags or line-number coupling are introduced.
const faultScript = `import os,runpy,sqlite3,sys,time
from pathlib import Path
worker,mode,database=sys.argv[1:4]
original_connect=sqlite3.connect
if mode in ('before-schema','initialization-error'):
 def connect(database,*args,**kwargs):
  if database != ':memory:':
   if mode == 'before-schema': os._exit(99)
   raise sqlite3.OperationalError('injected initialization failure')
  return original_connect(database,*args,**kwargs)
 sqlite3.connect=connect
def trace(frame,event,arg):
 if event=='call' and frame.f_code.co_filename==worker:
  name=frame.f_code.co_name
  if mode=='before-publication' and name=='publish_no_replace': os._exit(99)
  if mode=='after-publication' and name=='fsync_directory': os._exit(99)
  if mode.startswith('foreign-') and name=='publish_no_replace':
   fd=os.open(database,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
   try:
    if mode=='foreign-content': os.write(fd,b'foreign data must survive')
   finally: os.close(fd)
  if mode=='concurrent' and name=='publish_no_replace':
   own,other=sys.argv[4:6]
   Path(own).write_text('ready',encoding='utf-8')
   deadline=time.monotonic()+8
   while not Path(other).exists():
    if time.monotonic()>deadline: raise RuntimeError('other creator did not reach publication')
    time.sleep(0.01)
 return trace
sys.settrace(trace)
runpy.run_path(worker,run_name='__main__')
`;

function startArgs(f, mode, extra = []) {
  assert.ok(python, 'Python SQLite runtime must be available for atomic publication tests');
  const [command, prefix] = python;
  return [command, [...prefix, '-I', '-B', '-S', '-c', faultScript, worker, mode, f.database, ...extra]];
}

function fault(f, mode) {
  const [command, args] = startArgs(f, mode);
  return spawnSync(command, args, { input: JSON.stringify(request(f)), encoding: 'utf8',
    shell: false, windowsHide: true, timeout: 12_000 });
}

test('killing the first connection before schema creation leaves no canonical DB and normal retry succeeds', t => {
  const f = fixture(t);
  assert.equal(fault(f, 'before-schema').status, 99);
  assert.equal(fs.existsSync(f.database), false);
  assert.equal(call(f, 'status').database_exists, false);
  assert.equal(call(f, 'sync').status, 'ok');
  assert.deepEqual(call(f, 'search', { terms: ['publication'] }).records, [{ id: 'restored' }]);
  assert.equal(fs.statSync(f.database).nlink, 1);
});

test('killing a committed private DB before publication leaves an absent canonical path and retry succeeds', t => {
  const f = fixture(t);
  assert.equal(fault(f, 'before-publication').status, 99);
  assert.equal(fs.existsSync(f.database), false);
  const leftovers = fs.readdirSync(f.root).filter(name => name.startsWith('.memory.sqlite.init-') && name.endsWith('.tmp'));
  assert.equal(leftovers.length, 1);
  assert.equal(fs.readFileSync(path.join(f.root, leftovers[0])).subarray(0, 16).toString(), 'SQLite format 3\0');
  assert.equal(call(f, 'sync').status, 'ok');
  assert.equal(call(f, 'status').count, 1);
  assert.equal(fs.statSync(f.database).nlink, 1);
});

test('killing immediately after atomic publication leaves a valid single-link DB and retry succeeds', t => {
  const f = fixture(t);
  assert.equal(fault(f, 'after-publication').status, 99);
  assert.equal(fs.readFileSync(f.database).subarray(0, 16).toString(), 'SQLite format 3\0');
  assert.equal(fs.statSync(f.database).nlink, 1);
  assert.equal(call(f, 'status').count, 0);
  assert.equal(call(f, 'sync').status, 'ok');
  assert.equal(call(f, 'status').count, 1);
  assert.deepEqual(fs.readdirSync(f.root), ['memory.sqlite']);
});

test('an ordinary first-initialization exception cleans its private file and leaves retry possible', t => {
  const f = fixture(t);
  const failed = fault(f, 'initialization-error');
  assert.equal(failed.status, 0, failed.stderr);
  assert.equal(JSON.parse(failed.stdout).error_code, 'MEMORY_STORE_ERROR');
  assert.equal(fs.existsSync(f.database), false);
  assert.deepEqual(fs.readdirSync(f.root), []);
  assert.equal(call(f, 'sync').status, 'ok');
});

test('two creators reaching publication together preserve both repositories without linked or partial canonical files', async t => {
  const f = fixture(t);
  const ready = [path.join(f.root, 'creator-a.ready'), path.join(f.root, 'creator-b.ready')];
  const create = index => new Promise((resolve, reject) => {
    const [command, args] = startArgs(f, 'concurrent', [ready[index], ready[1 - index]]);
    const child = spawn(command, args, { shell: false, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('concurrent creator timed out')); }, 12_000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('close', code => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
    child.stdin.end(JSON.stringify({ ...request(f, [row(String(index))]), repoId: `repo-${index}` }));
  });
  const results = await Promise.all([create(0), create(1)]);
  for (const result of results) {
    assert.equal(result.code, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).status, 'ok', result.stdout);
  }
  assert.equal(call(f, 'status', { repoId: 'repo-0' }).count, 1);
  assert.equal(call(f, 'status', { repoId: 'repo-1' }).count, 1);
  assert.equal(fs.statSync(f.database).nlink, 1);
  assert.equal(fs.readdirSync(f.root).some(name => name.startsWith('.memory.sqlite.init-')), false);
});

for (const [mode, expected, content] of [
  ['foreign-empty', 'MEMORY_SCHEMA_UNSUPPORTED', ''],
  ['foreign-content', 'MEMORY_STORE_CORRUPT', 'foreign data must survive'],
]) {
  test(`a ${mode} file racing publication is never overwritten or silently adopted`, t => {
    const f = fixture(t);
    const result = fault(f, mode);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).error_code, expected);
    assert.equal(fs.readFileSync(f.database, 'utf8'), content);
    assert.equal(call(f, 'sync').error_code, expected);
    assert.equal(fs.readFileSync(f.database, 'utf8'), content);
    assert.deepEqual(fs.readdirSync(f.root), ['memory.sqlite']);
  });
}
