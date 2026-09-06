// ──────────────────────────────────────────────────────
// ToolNest — API v1 catalog (docs/api-platform.md §11.1)
//
// GET /api/v1 — lightweight, unauthenticated introspection: what the
// version exposes, how it authenticates, current rate limits, and the
// error-code table. No DB access.
// ──────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { CAPABILITY_LIST } from "@/lib/api/registry";
import { API_ERROR_TABLE } from "@/lib/api/errors";
import {
  DEFAULT_BURST_PER_MINUTE,
  DEFAULT_DAILY_QUOTA,
} from "@/lib/api/rate-limit";

export function GET() {
  return NextResponse.json({
    name: "ToolNest API",
    version: "v1",
    authentication: "Bearer tn_… — issue keys at POST /api/account/keys (session auth)",
    rateLimiting: {
      burstPerMinute: DEFAULT_BURST_PER_MINUTE,
      dailyQuotaDefault: DEFAULT_DAILY_QUOTA,
      store: "in-memory (single-instance guard; shared store before multi-instance deploys)",
    },
    storage: {
      keys: "postgres — sha256 digests only, raw keys never stored",
      usageLogs: "postgres with bounded in-memory fallback",
    },
    capabilities: CAPABILITY_LIST.map((cap) => ({
      operationId: cap.operationId,
      method: cap.method,
      path: cap.path,
      summary: cap.summary,
      toolSlug: cap.toolSlug,
      maxBodyBytes: cap.maxBodyBytes,
    })),
    errors: API_ERROR_TABLE,
    openapi: "/api/v1/openapi.json",
  });
}
