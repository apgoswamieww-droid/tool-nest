// ──────────────────────────────────────────────────────
// ToolNest — In-memory rate limiter (shared factory)
//
// Single-instance guard used by the auth flows (login, register,
// check-email). Suitable as-is for one server; move to a shared store
// (DB/Redis) before multi-instance deploys.
//
// A periodic sweep deletes expired entries so the map cannot grow
// without bound when attackers rotate keys (emails/IPs).
// ──────────────────────────────────────────────────────

export interface MemoryLimiterOptions {
  /** Requests allowed per window before throttling kicks in. */
  max: number;
  /** Sliding-reset window in milliseconds. */
  windowMs: number;
  /** How often expired entries are swept. Default 5 minutes. */
  sweepIntervalMs?: number;
}

export interface MemoryLimiter {
  /** Returns true when the key is throttled (over the limit). */
  check(key: string): boolean;
  /** Manual sweep — exposed for tests. */
  sweep(now: number): void;
  /** Current tracked key count — exposed for tests/monitoring. */
  size(): number;
}

export function createMemoryLimiter(options: MemoryLimiterOptions): MemoryLimiter {
  const { max, windowMs, sweepIntervalMs = 5 * 60_000 } = options;
  const attempts = new Map<string, { count: number; resetAt: number }>();

  function sweep(now: number): void {
    for (const [key, entry] of attempts) {
      if (now > entry.resetAt) attempts.delete(key);
    }
  }

  // Bound memory: expired entries are removed periodically. The timer is
  // unref'd so it never keeps a process alive on its own.
  const timer = setInterval(() => sweep(Date.now()), sweepIntervalMs);
  if (typeof timer === "object" && timer && typeof timer.unref === "function") {
    timer.unref();
  }

  return {
    check(key: string): boolean {
      const now = Date.now();
      const entry = attempts.get(key);
      if (!entry || now > entry.resetAt) {
        attempts.set(key, { count: 1, resetAt: now + windowMs });
        return false;
      }
      entry.count += 1;
      return entry.count > max;
    },
    sweep,
    size: () => attempts.size,
  };
}

/** Client IP from proxy headers, or "unknown". Shared by auth routes. */
export function clientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
