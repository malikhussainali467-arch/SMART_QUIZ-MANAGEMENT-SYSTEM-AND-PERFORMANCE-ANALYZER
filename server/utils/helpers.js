// Small helpers shared by many files.

/** Error that carries an HTTP status code (handled in middleware/errorHandler.js). */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Wraps an async route handler so thrown errors reach the error middleware. */
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Returns a new array in random order (Fisher-Yates). */
export function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Throws a 400 error if any listed field is missing/empty in `body`. */
export function requireFields(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) throw new HttpError(400, `Missing required field(s): ${missing.join(', ')}`);
}

/** Throws a 404 error when a document was not found. */
export function ensureFound(doc, label = 'Item') {
  if (!doc) throw new HttpError(404, `${label} not found`);
  return doc;
}

export const round = (value, digits = 1) => Number(value.toFixed(digits));
export const DAY_MS = 24 * 60 * 60 * 1000;

/** Copies only the listed keys from an object (protects against unexpected fields in request bodies). */
export function pick(source, keys) {
  return keys.reduce((result, key) => (source[key] !== undefined ? { ...result, [key]: source[key] } : result), {});
}
