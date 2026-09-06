// ──────────────────────────────────────────────────────
// ToolNest — Shared v1 response helpers
//
// Error bodies and rate-limit headers are produced here and used by
// createApiRoute (lib/api/route.ts) AND by the non-capability v1
// routes (e.g. GET /api/v1/usage), so the platform contract stays
// structural even off the main factory path.
// ──────────────────────────────────────────────────────

import type { ApiKeyIdentity } from "./auth";
import {
  burstLimiter,
  dailyLimiter,
  DEFAULT_BURST_PER_MINUTE,
  type RateLimitResult,
} from "./rate-limit";
import { errorMessage, type ApiErrorCode, type ApiErrorDetail } from "./errors";

export interface RateState {
  allowed: boolean;
  /** Epoch ms until the binding limit resets (0 when allowed). */
  retryAfterMs: number;
  burst: RateLimitResult;
  daily: RateLimitResult;
}

/** Count one request against the burst + daily windows for a key. */
export function checkKeyRateLimits(
  key: Pick<ApiKeyIdentity, "id" | "quotaPerDay">,
  now: number = Date.now()
): RateState {
  const burst = burstLimiter.check(`burst:${key.id}`, DEFAULT_BURST_PER_MINUTE, now);
  const daily = dailyLimiter.check(`daily:${key.id}`, key.quotaPerDay, now);
  const allowed = burst.allowed && daily.allowed;

  let retryAfterMs = 0;
  if (!allowed) {
    const reset = Math.min(
      burst.allowed ? Number.POSITIVE_INFINITY : burst.resetAt,
      daily.allowed ? Number.POSITIVE_INFINITY : daily.resetAt
    );
    retryAfterMs = Math.max(1, reset - now);
  }
  return { allowed, retryAfterMs, burst, daily };
}

/** Rate-limit headers on every post-auth response (docs §7.1). */
export function rateHeaders(state: RateState): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(state.daily.limit),
    "X-RateLimit-Remaining": String(state.daily.remaining),
    "X-RateLimit-Reset": String(Math.ceil(state.daily.resetAt / 1000)),
    "X-RateLimit-Burst-Limit": String(state.burst.limit),
    "X-RateLimit-Burst-Remaining": String(state.burst.remaining),
    "X-RateLimit-Burst-Reset": String(Math.ceil(state.burst.resetAt / 1000)),
  };
}

/** The platform error envelope: { error: { code, message, details? }, requestId }. */
export function errorBody(
  code: ApiErrorCode,
  requestId: string,
  details?: ApiErrorDetail[]
) {
  return {
    error: {
      code,
      message: errorMessage(code),
      ...(details && details.length > 0 ? { details } : {}),
    },
    requestId,
  };
}


