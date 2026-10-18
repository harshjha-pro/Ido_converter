/**
 * Browser-only storage for conveniences (saved settings, brand kit). Nothing here is sent to the server.
 * Every access is guarded: storage can be blocked (private mode, site-data settings) or full, and the
 * tools must keep working without it.
 */
export function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

/** Returns false when the browser refuses (blocked or out of space), so the UI can say so. */
export function writeJson(key: string, value: unknown): boolean {
  try { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function removeKey(key: string) {
  try { window.localStorage.removeItem(key); } catch { /* nothing to remove */ }
}

export interface SavedEntry<T> { name: string; value: T; savedAt: string }

export const MAX_SAVED = 20;

/** Parses a stored list of named settings, dropping anything malformed. Pure, so it is unit-tested. */
export function parseSaved<T>(raw: unknown, validate: (v: unknown) => T | null): SavedEntry<T>[] {
  if (!Array.isArray(raw)) return [];
  const out: SavedEntry<T>[] = [];
  for (const e of raw.slice(0, MAX_SAVED)) {
    if (!e || typeof e !== "object") continue;
    const { name, value, savedAt } = e as Record<string, unknown>;
    const v = validate(value);
    if (typeof name === "string" && name.trim() && v !== null) out.push({ name: name.trim().slice(0, 40), value: v, savedAt: typeof savedAt === "string" ? savedAt : "" });
  }
  return out;
}

/** Adds or replaces an entry by name (case-insensitive), newest first, capped at MAX_SAVED. */
export function upsertSaved<T>(list: SavedEntry<T>[], name: string, value: T, now = new Date()): SavedEntry<T>[] {
  const n = name.trim().slice(0, 40);
  const rest = list.filter(e => e.name.toLowerCase() !== n.toLowerCase());
  return [{ name: n, value, savedAt: now.toISOString() }, ...rest].slice(0, MAX_SAVED);
}

/** Shallow validator: keeps only the expected keys, each with the same type as in `shape`. */
export function sameShape<T extends object>(shape: T) {
  return (v: unknown): T | null => {
    if (!v || typeof v !== "object" || Array.isArray(v)) return null;
    const src = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, def] of Object.entries(shape)) {
      const x = src[k];
      if (Array.isArray(def)) { if (!Array.isArray(x) || !x.every(i => typeof i === "string")) return null; }
      else if (typeof x !== typeof def) return null;
      out[k] = x;
    }
    return out as T;
  };
}
