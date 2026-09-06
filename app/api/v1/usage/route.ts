// ──────────────────────────────────────────────────────
// ToolNest — Own usage summary (docs/api-platform.md §7.2)
//
// GET /api/v1/usage — a key owner's own consumption, authenticated by
// the same bearer key. Aggregates: total, per-route, per-status, and
// per-day counts for the last 30 days. Never exposes other keys'
// traffic or any request content.
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { ApiError, errorStatus } from "@/lib/api/errors";
import { makeRequestId, readRequestId } from "@/lib/api/request-id";
import { authenticateApiKey, type ApiKeyIdentity } from "@/lib/api/auth";
import { checkKeyRateLimits, errorBody, rateHeaders } from "@/lib/api/respond";
import { getKeyUsageSummary, logApiUsage } from "@/lib/api/usage";

// Reads the bearer key from the request — never prerender.
export const dynamic = "force-dynamic";

const USAGE_ROUTE = "/api/v1/usage";

export async function GET(request: NextRequest) {
  const requestId = readRequestId(request.headers) ?? makeRequestId();
  const startedAt = Date.now();

  let key: ApiKeyIdentity;
  try {
    key = await authenticateApiKey(request);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(errorBody(error.code, requestId), {
        status: errorStatus(error.code),
        headers: { "WWW-Authenticate": "Bearer" },
      });
    }
    throw error;
  }

  const rate = checkKeyRateLimits(key);
  const headerValues = rateHeaders(rate);
  if (!rate.allowed) {
    return NextResponse.json(errorBody("RATE_LIMITED", requestId), {
      status: 429,
      headers: {
        ...headerValues,
        "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
      },
    });
  }

  const respond = (
    status: number,
    body: unknown,
    headers: Record<string, string> = {}
  ) => {
    void logApiUsage({
      apiKeyId: key.id,
      requestId,
      route: USAGE_ROUTE,
      method: "GET",
      status,
      latencyMs: Date.now() - startedAt,
    });
    return NextResponse.json(body, { status, headers });
  };

  try {
    const summary = await getKeyUsageSummary(key.id);
    return respond(
      200,
      { data: summary, meta: { operationId: "usage.get" }, requestId },
      headerValues
    );
  } catch (error) {
    console.error(
      `[API] usage.get failed (requestId ${requestId}, key ${key.id}):`,
      error
    );
    return respond(500, errorBody("INTERNAL", requestId), headerValues);
  }
}
