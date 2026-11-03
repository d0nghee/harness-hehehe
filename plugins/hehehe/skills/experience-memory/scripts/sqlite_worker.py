"""One-request stdlib SQLite worker. No network, extension loading, or migrations."""

import json
import errno
import os
import sqlite3
import stat
import sys
import tempfile
from pathlib import Path

MAX_BYTES = 1024 * 1024
APP_ID = 0x48454D31
SCHEMA_VERSION = 1
TOKENIZER = 'unicode61'
SCHEMA = (
    "CREATE TABLE memory_records (repo_id TEXT NOT NULL, record_id TEXT NOT NULL, "
    "payload TEXT NOT NULL, PRIMARY KEY (repo_id, record_id)) WITHOUT ROWID",
    "CREATE VIRTUAL TABLE memory_fts USING fts5(repo_id UNINDEXED, record_id UNINDEXED, "
    f"body, tokenize='{TOKENIZER}')",
)


class StoreError(Exception):
    def __init__(self, code):
        self.code = code


def reject(code):
    raise StoreError(code)


def safe_path(database):
    path = Path(database)
    if not path.is_absolute() or len(str(path)) > 4096 or '\0' in str(path):
        reject('MEMORY_INVALID_INPUT')
    # Do not resolve: a junction/symlink in any existing component is forbidden.
    for current in (*reversed(path.parents), path):
        try:
            info = current.lstat()
        except FileNotFoundError:
            continue
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            reject('MEMORY_UNSAFE_PATH')
        if current != path and not stat.S_ISDIR(info.st_mode):
            reject('MEMORY_UNSAFE_PATH')
        if current == path and (not stat.S_ISREG(info.st_mode) or info.st_nlink != 1):
            reject('MEMORY_UNSAFE_PATH')
    for suffix in ('-journal', '-wal', '-shm'):
        try:
            info = Path(str(path) + suffix).lstat()
        except FileNotFoundError:
            continue
        if (not stat.S_ISREG(info.st_mode) or info.st_nlink != 1
                or getattr(info, 'st_file_attributes', 0) & 0x400):
            reject('MEMORY_UNSAFE_PATH')
    return path


def schema_identity(connection):
    return connection.execute(
        "SELECT type, name, tbl_name, sql FROM sqlite_schema ORDER BY type, name"
    ).fetchall()


def expected_schema():
    connection = sqlite3.connect(':memory:')
    try:
        for statement in SCHEMA:
            connection.execute(statement)
        return schema_identity(connection)
    except sqlite3.OperationalError:
        reject('MEMORY_RUNTIME_UNAVAILABLE')
    finally:
        connection.close()


def check_schema(connection, expected):
    if (connection.execute('PRAGMA application_id').fetchone()[0] != APP_ID
            or connection.execute('PRAGMA user_version').fetchone()[0] != SCHEMA_VERSION
            or schema_identity(connection) != expected):
        reject('MEMORY_SCHEMA_UNSUPPORTED')


def checked_records(records):
    if not isinstance(records, list) or len(records) > 512:
        reject('MEMORY_INVALID_INPUT')
    seen = set()
    rows = []
    for record in records:
        if not isinstance(record, dict) or set(record) != {'id', 'text', 'payload'}:
            reject('MEMORY_INVALID_INPUT')
        record_id, text = record['id'], record['text']
        if (not isinstance(record_id, str) or not record_id or len(record_id) > 200
                or '\0' in record_id or record_id in seen or not isinstance(text, str)
                or len(text.encode('utf-8')) > 32768 or '\0' in text):
            reject('MEMORY_INVALID_INPUT')
        payload = json.dumps(record['payload'], ensure_ascii=False, allow_nan=False,
                             separators=(',', ':'))
        if len(payload.encode('utf-8')) > 65536:
            reject('MEMORY_INVALID_INPUT')
        seen.add(record_id)
        rows.append((record_id, text, payload))
    return rows


def search_query(terms, ignored_terms=()):
    if isinstance(terms, list) and all(isinstance(term, str) for term in terms):
        source = ' '.join(terms)
    elif isinstance(terms, str):
        source = terms
    else:
        reject('MEMORY_INVALID_INPUT')
    if (not isinstance(ignored_terms, (list, tuple)) or len(ignored_terms) > 256
            or any(not isinstance(term, str) or not term or len(term) > 128
                   or '\0' in term for term in ignored_terms) or '\0' in source):
        reject('MEMORY_INVALID_INPUT')
    try:
        if len(source.encode('utf-8')) > 32768:
            reject('MEMORY_INVALID_INPUT')
        for term in ignored_terms:
            term.encode('utf-8')
    except UnicodeError:
        reject('MEMORY_INVALID_INPUT')
    # Ask the same tokenizer that owns the persisted index. Reimplementing its
    # word boundaries with language regexes loses combining marks and letters
    # that unicode61 legitimately emits as one-character tokens.
    connection = sqlite3.connect(':memory:')
    try:
        if hasattr(connection, 'enable_load_extension'):
            connection.enable_load_extension(False)
        connection.execute('PRAGMA trusted_schema=OFF')
        connection.execute(f"CREATE VIRTUAL TABLE query_tokens USING fts5(body, tokenize='{TOKENIZER}')")
        connection.execute("CREATE VIRTUAL TABLE query_terms USING fts5vocab(query_tokens, 'instance')")
        connection.execute('INSERT INTO query_tokens (body) VALUES (?)', (source,))
        ignored = set(ignored_terms)
        seen = set()
        tokens = []
        for (token,) in connection.execute('SELECT term FROM query_terms ORDER BY offset'):
            if token not in ignored and token not in seen:
                seen.add(token)
                tokens.append(token)
            if len(tokens) == 16:
                break
        return ' OR '.join('"' + token.replace('"', '""') + '"*' for token in tokens)
    finally:
        connection.close()


def response(count, exists, records=None):
    result = {'status': 'ok' if count else 'empty', 'count': count,
              'database_exists': exists, 'search_engine': 'sqlite-fts5'}
    if records is not None:
        result['records'] = records
    return result


def identity(path):
    info = path.stat()
    return info.st_dev, info.st_ino


def publish_no_replace(source, target):
    # Python's Windows rename never overwrites. POSIX rename does, so request
    # the native exclusive variant rather than a racy exists/replace fallback.
    if os.name == 'nt':
        os.rename(source, target)
        return
    import ctypes
    library = ctypes.CDLL(None, use_errno=True)
    if sys.platform.startswith('linux'):
        rename = getattr(library, 'renameat2', None)
        if rename is None:
            reject('MEMORY_STORE_ERROR')
        rename.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int,
                           ctypes.c_char_p, ctypes.c_uint]
        rename.restype = ctypes.c_int
        # Linux AT_FDCWD=-100; RENAME_NOREPLACE=1.
        result = rename(-100, os.fsencode(source), -100, os.fsencode(target), 1)
    elif sys.platform == 'darwin':
        rename = getattr(library, 'renamex_np', None)
        if rename is None:
            reject('MEMORY_STORE_ERROR')
        rename.argtypes = [ctypes.c_char_p, ctypes.c_char_p, ctypes.c_uint]
        rename.restype = ctypes.c_int
        # Darwin RENAME_EXCL=0x00000004.
        result = rename(os.fsencode(source), os.fsencode(target), 4)
    else:
        reject('MEMORY_STORE_ERROR')
    if result != 0:
        code = ctypes.get_errno()
        raise OSError(code, os.strerror(code))


def fsync_directory(directory):
    # Windows does not expose a directory fsync through os.open/os.fsync.
    if os.name == 'nt':
        return
    descriptor = os.open(directory, os.O_RDONLY | getattr(os, 'O_DIRECTORY', 0)
                         | getattr(os, 'O_NOFOLLOW', 0))
    try:
        try:
            os.fsync(descriptor)
        except OSError as error:
            if error.errno not in (errno.EINVAL, errno.ENOTSUP, errno.EBADF):
                raise
    finally:
        os.close(descriptor)


def initialize_database(path, expected):
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    safe_path(str(path))
    descriptor, name = tempfile.mkstemp(prefix='.' + path.name + '.init-',
                                        suffix='.tmp', dir=path.parent)
    os.close(descriptor)
    temporary = Path(name)
    original = identity(temporary)
    connection = None
    try:
        connection = sqlite3.connect(temporary.as_uri() + '?mode=rw', uri=True,
                                     timeout=0.5, isolation_level=None)
        if hasattr(connection, 'enable_load_extension'):
            connection.enable_load_extension(False)
        connection.execute('PRAGMA trusted_schema=OFF')
        connection.execute('BEGIN IMMEDIATE')
        for statement in SCHEMA:
            connection.execute(statement)
        connection.execute('PRAGMA application_id=' + str(APP_ID))
        connection.execute('PRAGMA user_version=' + str(SCHEMA_VERSION))
        check_schema(connection, expected)
        connection.commit()
        connection.close()
        connection = None
        safe_path(str(temporary))
        if identity(temporary) != original:
            reject('MEMORY_UNSAFE_PATH')
        descriptor = os.open(temporary, os.O_RDWR | getattr(os, 'O_NOFOLLOW', 0))
        try:
            if (os.fstat(descriptor).st_dev, os.fstat(descriptor).st_ino) != original:
                reject('MEMORY_UNSAFE_PATH')
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
        safe_path(str(path))
        try:
            publish_no_replace(temporary, path)
        except FileExistsError:
            # A racing creator won. The caller still validates its schema and
            # uses the existing transaction; no path is overwritten or adopted.
            return
        fsync_directory(path.parent)
    finally:
        if connection is not None:
            if connection.in_transaction:
                connection.rollback()
            connection.close()
        # Only remove this invocation's private file, never the canonical DB or
        # unknown remnants from an interrupted invocation. SQLite owns sidecars.
        try:
            if identity(temporary) == original:
                safe_path(str(temporary))
                temporary.unlink()
        except FileNotFoundError:
            pass


def operate(request):
    if sys.version_info < (3, 10):
        reject('MEMORY_RUNTIME_UNAVAILABLE')
    expected = expected_schema()
    operation = request.get('operation')
    if operation == 'probe':
        return {'status': 'ok', 'search_engine': 'sqlite-fts5',
                'runtime': 'python-sqlite3', 'schema_version': SCHEMA_VERSION}
    if operation not in ('status', 'search', 'sync'):
        reject('MEMORY_INVALID_INPUT')
    database, repo_id = request.get('database'), request.get('repoId')
    if (not isinstance(database, str) or not isinstance(repo_id, str) or not repo_id
            or len(repo_id) > 200 or '\0' in repo_id):
        reject('MEMORY_INVALID_INPUT')
    path = safe_path(database)
    limit = request.get('limit', 3)
    if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 50:
        reject('MEMORY_INVALID_INPUT')
    rows = checked_records(request.get('records')) if operation == 'sync' else None
    query = search_query(request.get('terms', []), request.get('ignored_terms', [])) if operation == 'search' else None
    exists = path.exists()
    if not exists and operation != 'sync':
        return response(0, False, [] if operation == 'search' else None)
    if not exists:
        initialize_database(path, expected)
    safe_path(database)
    original = identity(path)
    connection = sqlite3.connect(path.as_uri() + ('?mode=rw' if operation == 'sync' else '?mode=ro'),
                                 uri=True, timeout=0.5, isolation_level=None)
    try:
        safe_path(database)
        if identity(path) != original:
            reject('MEMORY_UNSAFE_PATH')
        if hasattr(connection, 'enable_load_extension'):
            connection.enable_load_extension(False)
        connection.execute('PRAGMA trusted_schema=OFF')
        connection.execute('PRAGMA busy_timeout=500')
        if operation == 'sync':
            connection.execute('BEGIN IMMEDIATE')
            check_schema(connection, expected)
            # WAL mode is never enabled by this implementation or accepted as its own store.
            if connection.execute('PRAGMA journal_mode').fetchone()[0].lower() != 'delete':
                reject('MEMORY_SCHEMA_UNSUPPORTED')
            connection.execute('DELETE FROM memory_fts WHERE repo_id = ?', (repo_id,))
            connection.execute('DELETE FROM memory_records WHERE repo_id = ?', (repo_id,))
            connection.executemany('INSERT INTO memory_records VALUES (?, ?, ?)',
                                   [(repo_id, record_id, payload) for record_id, _, payload in rows])
            connection.executemany('INSERT INTO memory_fts (repo_id, record_id, body) VALUES (?, ?, ?)',
                                   [(repo_id, record_id, text) for record_id, text, _ in rows])
            safe_path(database)
            if identity(path) != original:
                reject('MEMORY_UNSAFE_PATH')
            connection.commit()
            return {'status': 'ok', 'count': len(rows), 'database_exists': True,
                    'search_engine': 'sqlite-fts5'}
        connection.execute('PRAGMA query_only=ON')
        check_schema(connection, expected)
        if connection.execute('PRAGMA journal_mode').fetchone()[0].lower() != 'delete':
            reject('MEMORY_SCHEMA_UNSUPPORTED')
        if operation == 'status':
            return response(connection.execute('SELECT COUNT(*) FROM memory_records WHERE repo_id = ?',
                                                (repo_id,)).fetchone()[0], True)
        if not query:
            return response(0, True, [])
        matches = connection.execute(
            'SELECT substr(r.payload, 1, 65537) FROM memory_fts f JOIN memory_records r '
            'ON r.repo_id = f.repo_id AND r.record_id = f.record_id '
            'WHERE memory_fts MATCH ? AND f.repo_id = ? '
            'ORDER BY bm25(memory_fts), f.record_id LIMIT ?', (query, repo_id, limit)
        ).fetchall()
        payloads = []
        for row in matches:
            if not isinstance(row[0], str) or len(row[0].encode('utf-8')) > 65536:
                reject('MEMORY_STORE_CORRUPT')
            try:
                payloads.append(json.loads(row[0], parse_constant=lambda _: reject('MEMORY_STORE_CORRUPT')))
            except (ValueError, TypeError, RecursionError):
                reject('MEMORY_STORE_CORRUPT')
        return response(len(payloads), True, payloads)
    finally:
        if connection.in_transaction:
            connection.rollback()
        connection.close()


def main():
    try:
        data = sys.stdin.buffer.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            reject('MEMORY_INVALID_INPUT')
        request = json.loads(data.decode('utf-8'), parse_constant=lambda _: reject('MEMORY_INVALID_INPUT'))
        if not isinstance(request, dict):
            reject('MEMORY_INVALID_INPUT')
        result = operate(request)
    except StoreError as error:
        result = {'status': 'error', 'error_code': error.code}
    except sqlite3.DatabaseError as error:
        # Python 3.10 has no sqlite_errorcode attribute or SQLITE_* constants.
        code = getattr(error, 'sqlite_errorcode', 0) & 0xFF
        description = str(error).lower()
        if code in (5, 6) or 'database is locked' in description or 'database table is locked' in description:
            name = 'MEMORY_STORE_BUSY'
        elif code in (11, 26) or 'not a database' in description or 'malformed' in description:
            name = 'MEMORY_STORE_CORRUPT'
        else:
            name = 'MEMORY_STORE_ERROR'
        result = {'status': 'error', 'error_code': name}
    except (ValueError, TypeError, UnicodeError, RecursionError):
        result = {'status': 'error', 'error_code': 'MEMORY_INVALID_INPUT'}
    except Exception:
        result = {'status': 'error', 'error_code': 'MEMORY_STORE_ERROR'}
    encoded = json.dumps(result, ensure_ascii=False, allow_nan=False, separators=(',', ':')).encode('utf-8')
    if len(encoded) > MAX_BYTES:
        encoded = b'{"status":"error","error_code":"MEMORY_STORE_ERROR"}'
    sys.stdout.buffer.write(encoded)


if __name__ == '__main__':
    main()
