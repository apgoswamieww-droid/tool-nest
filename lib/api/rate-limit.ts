// ──────────────────────────────────────────────────────
// ToolNest — API platform rate limiting (docs/api-platform.md §7.1)
//
// Two fixed-window limits per key:
//   - burst:  60 requests / minute (process-wide singleton)
//   - daily:  quotaPerDay per key, window aligned to UTC midnight
//
// v0 is in-memory — a single-instance guard with the same caveat as
// the analytics/register limiters. Swap the store (Upstash/Redis or a
// Postgres counter) behind the same interface before multi-instance
// deploys; handlers do not change.
//
// Fixed UTC-day windows fall out of floor-division by 86 400 000 ms
// (the epoch's day boundary IS UTC midnight), so no calendar logic is
// needed.
// ──────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed: boolean;
  /** The window cap this result was computed against. */
  limit: number;
  remaining: number;
  /** Epoch ms when the current window ends (Retry-After / Reset). */
  resetAt: number;
}

/** Fixed-window counter. One instance per window size. */
export class FixedWindowRateLimiter {
  private readonly windows = new Map<string, { count: number; resetAt: number }>();

  constructor(private readonly windowMs: number) {}

  /**
   * Record one request for `key` and report whether it is within
   * `limit`. A per-window key (`<windowStart>:<key>`) keeps the map
   * self-cleaning as windows roll over.
   */
  check(key: string, limit: number, now: number = Date.now()): RateLimitResult {
    if (limit < 1) {
      // A zero/negative limit means "deny everything" (defensive; the
      // schema default and validation keep quotaPerDay ≥ 1).
      return { allowed: false, limit: 0, remaining: 0, resetAt: now + this.windowMs };
    }
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
    const resetAt = windowStart + this.windowMs;
    const bucketKey = `${windowStart}:${key}`;

    const entry = this.windows.get(bucketKey);
    const used = entry && now < entry.resetAt ? entry.count : 0;
    const allowed = used < limit;
    const nextCount = used + 1;
    this.windows.set(bucketKey, { count: nextCount, resetAt });

    // Opportunistic prune so a long-lived process never grows unbounded.
    if (this.windows.size > 10_000) {
      for (const [k, e] of this.windows) {
        if (now >= e.resetAt) this.windows.delete(k);
      }
    }

    return {
      allowed,
      limit,
      remaining: Math.max(0, limit - nextCount),
      resetAt,
    };
  }
}

export const BURST_WINDOW_MS = 60_000;
export const DAILY_WINDOW_MS = 86_400_000;
export const DEFAULT_BURST_PER_MINUTE = 60;
export const DEFAULT_DAILY_QUOTA = 100; // must match schema default

/** Singleton process-wide burst limiter (60 req/min per key). */
export const burstLimiter = new FixedWindowRateLimiter(BURST_WINDOW_MS);
/** Singleton process-wide daily limiter (window = UTC day, limit per key). */
export const dailyLimiter = new FixedWindowRateLimiter(DAILY_WINDOW_MS);
