import { fail, canonical } from "./source-evidence.mjs";

export const textLimits = Object.freeze({ title: 160, problem: 800, cause: 800, resolution: 1200, outcome: 400 });
export const INDEX_TEXT_BYTES = 32768;
export const QUERY_CHARACTERS = 400;
export const NOTE_CANONICAL_BYTES = 18000;
export const NOTE_READ_BYTES = 20000;
export const MAX_RETENTION_MS = 90 * 86400000;
const invalidText = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\u200b-\u200f\u202a-\u202e\u2066-\u2069\ud800-\udfff]/u;

// Filter only after SQLite has produced its actual keyword tokens. A second
// word regex would disagree on combining marks and single-letter script tokens.
export const queryStopwords = Object.freeze(("a an the and or but if then else as at by for from in into of on onto out over to under up with without "
  + "about after before between during through this that these those it its is are was were be been being am do does did done "
  + "have has had can could may might must shall should will would not no so than too very there here how what when where which who why "
  + "i me my we us our you your they them their he him his she her all any each some such more most other same "
  + "please help need needs want wants use uses used using make makes making build builds building create creates creating "
  + "implement implements implementing add adds adding change changes changing update updates updating fix fixes fixing "
  + "improve improves improving investigate investigating task tasks work working new existing").split(/\s+/));

function assertNoSecrets(value) {
  if (/-----BEGIN [A-Z ]*PRIVATE KEY-----|\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[A-Z0-9]{16}|sk-(?:proj-|svcacct-|ant-)?[A-Za-z0-9_-]{20,}|sk_(?:live|test)_[A-Za-z0-9]{16,}|AIza[A-Za-z0-9_-]{30,}|xox[baprs]-[A-Za-z0-9-]{20,})\b/.test(value)
    || /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/.test(value)
    || /\b(?:[A-Za-z0-9_]*(?:password|passwd|secret|token)|api[_-]?key)\s*[:=]\s*["']?[^\s"'`]{4,}/i.test(value)) fail("MEMORY_SECRET_REJECTED");
}

function text(value, maximum) {
  if (typeof value !== "string" || !value.trim() || value.length > maximum || invalidText.test(value)) fail();
  assertNoSecrets(value);
  return value.trim().replaceAll("\r\n", "\n");
}

export function memoryFields(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.schema_version !== 1) fail();
  const result = { schema_version: 1 };
  for (const [key, maximum] of Object.entries(textLimits)) result[key] = text(value[key], maximum);
  if (!Array.isArray(value.tags) || value.tags.length > 8) fail();
  // Array.from visits holes too; map could publish a sparse array as JSON nulls
  // that the canonical reader would reject on the very next synchronization.
  result.tags = Array.from(value.tags, (tag) => text(tag, 40));
  if (result.tags.length > 8 || new Set(result.tags).size !== result.tags.length) fail();
  return result;
}

function normalizedSearchText(value) {
  if (typeof value !== "string" || invalidText.test(value)) fail();
  const normalized = value.normalize("NFKC").toLowerCase();
  if (Buffer.byteLength(normalized, "utf8") > INDEX_TEXT_BYTES) fail("MEMORY_LIMIT_EXCEEDED");
  return normalized;
}

// Call only with canonical field content. Both publication and historical-note
// validation use this exact derived representation and byte budget.
export function indexText(content) {
  if (!content || !Array.isArray(content.tags)) fail();
  const values = [...Object.keys(textLimits).map((key) => content[key]), ...content.tags];
  if (values.some((value) => typeof value !== "string")) fail();
  return normalizedSearchText(values.join("\n"));
}

export function queryText(query) {
  if (typeof query !== "string" || !query.trim() || query.length > QUERY_CHARACTERS) fail();
  return normalizedSearchText(query.trim());
}

export function utcDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) fail();
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) fail();
  const normalized = new Date(timestamp).toISOString();
  const expected = value.length === 20 ? `${value.slice(0, -1)}.000Z` : value;
  // Date.parse may repair a nonexistent day or 24:00 into another date.
  // Canonicalization may add milliseconds, but must not change the time supplied.
  if (normalized !== expected) fail();
  return normalized;
}

export function assertNoteSize(note) {
  if (Buffer.byteLength(canonical(note), "utf8") > NOTE_CANONICAL_BYTES
    || Buffer.byteLength(`${JSON.stringify(note, null, 2)}\n`, "utf8") > NOTE_READ_BYTES) fail("MEMORY_LIMIT_EXCEEDED");
}
