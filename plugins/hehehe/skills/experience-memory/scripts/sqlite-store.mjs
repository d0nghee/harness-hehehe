import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const WORKER = fileURLToPath(new URL('./sqlite_worker.py', import.meta.url));
const MAX_BYTES = 1024 * 1024;
const MESSAGES = Object.freeze({
  MEMORY_RUNTIME_UNAVAILABLE: 'Python 3.10 or later with SQLite FTS5 is required; no runtime was installed.',
  MEMORY_INVALID_INPUT: 'The memory store request is invalid or exceeds its size limit.',
  MEMORY_UNSAFE_PATH: 'The memory database path must use regular private files without links.',
  MEMORY_STORE_BUSY: 'The memory database is busy; retry after the other operation finishes.',
  MEMORY_STORE_CORRUPT: 'The memory database is corrupt or is not a SQLite database.',
  MEMORY_SCHEMA_UNSUPPORTED: 'The memory database schema is unsupported; no migration was attempted.',
  MEMORY_STORE_ERROR: 'The memory store operation failed.',
});

function failure(code) {
  return { status: 'error', error_code: code, message: MESSAGES[code] };
}

function assertSafePath(database) {
  const absolute = path.resolve(database);
  const parsed = path.parse(absolute);
  let current = parsed.root;
  for (const part of absolute.slice(parsed.root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    let info;
    try { info = fs.lstatSync(current); } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }
    if (info.isSymbolicLink() || (current !== absolute && !info.isDirectory())
      || (current === absolute && (!info.isFile() || info.nlink !== 1))) throw new Error('unsafe');
  }
  for (const suffix of ['-journal', '-wal', '-shm']) {
    try {
      const info = fs.lstatSync(absolute + suffix);
      if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1) throw new Error('unsafe');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

function runtimes() {
  const configured = process.env.HEHEHE_MEMORY_PYTHON;
  if (configured) return path.isAbsolute(configured) ? [[configured, []]] : [];
  return process.platform === 'win32'
    ? [['python', []], ['py', ['-3']]]
    : [['python3', []], ['python', []]];
}

/** Execute one bounded, dependency-free SQLite request in an isolated Python worker. */
export function invokeStore(input) {
  let payload;
  try {
    if (!input || typeof input !== 'object' || Array.isArray(input)
      || !['probe', 'status', 'search', 'sync'].includes(input.operation)) return failure('MEMORY_INVALID_INPUT');
    if (input.operation !== 'probe') {
      if (typeof input.database !== 'string' || !path.isAbsolute(input.database)
        || input.database.length > 4096 || input.database.includes('\0')) return failure('MEMORY_INVALID_INPUT');
      try { assertSafePath(input.database); } catch { return failure('MEMORY_UNSAFE_PATH'); }
    }
    payload = JSON.stringify(input);
    if (Buffer.byteLength(payload) > MAX_BYTES) return failure('MEMORY_INVALID_INPUT');
  } catch { return failure('MEMORY_INVALID_INPUT'); }

  for (const [command, prefix] of runtimes()) {
    let result;
    try {
      result = spawnSync(command, [...prefix, '-I', '-B', '-S', WORKER], {
        input: payload, encoding: 'utf8', shell: false, windowsHide: true,
        timeout: 10_000, maxBuffer: MAX_BYTES,
      });
    } catch { continue; }
    if (result.error || result.signal || result.status !== 0) continue;
    let output;
    try { output = JSON.parse(result.stdout); } catch { continue; }
    if (output?.status === 'error') {
      const code = Object.hasOwn(MESSAGES, output.error_code) ? output.error_code : 'MEMORY_STORE_ERROR';
      if (code === 'MEMORY_RUNTIME_UNAVAILABLE') continue;
      return failure(code);
    }
    if (!output || !['ok', 'empty'].includes(output.status) || output.search_engine !== 'sqlite-fts5') continue;
    return output;
  }
  return failure('MEMORY_RUNTIME_UNAVAILABLE');
}
