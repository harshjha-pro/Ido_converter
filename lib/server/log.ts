/** Structured logs to stdout/stderr (visible in Hostinger's app logs). Never pass contact details, IPs or request bodies. */
type Level = "info" | "warn" | "error";
export function log(level: Level, event: string, fields: Record<string, string | number | boolean | undefined> = {}) {
  const line = JSON.stringify({ t: new Date().toISOString(), level, event, ...fields });
  if (level === "error") console.error(line); else if (level === "warn") console.warn(line); else console.log(line);
}
