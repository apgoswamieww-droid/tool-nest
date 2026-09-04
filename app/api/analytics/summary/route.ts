// ──────────────────────────────────────────────────────
// ToolNest — Analytics Summary API (dashboard-ready)
//
// GET /api/analytics/summary?days=7
//   Returns anonymous, aggregated counts only — never raw events.
//
// Access control: set ANALYTICS_DASHBOARD_TOKEN and pass it via the
// `Authorization: Bearer <token>` header or `?token=<token>` query.
//   - production: token required (401 when missing/mismatched)
//   - development without a token configured: open (convenience)
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/analytics/server";

const MAX_DAYS = 90;

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.ANALYTICS_DASHBOARD_TOKEN;
  if (!expected) {
    // No token configured: allow in development only.
    return process.env.NODE_ENV !== "production";
  }
  const header = request.headers.get("authorization");
  const query = new URL(request.url).searchParams.get("token");
  const provided =
    header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : query;
  return provided === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const daysParam = Number(
    new URL(request.url).searchParams.get("days") ?? "7"
  );
  const days = Number.isFinite(daysParam)
    ? Math.min(Math.max(1, Math.floor(daysParam)), MAX_DAYS)
    : 7;

  const summary = await getAnalyticsSummary(days);
  return NextResponse.json(summary);
}
