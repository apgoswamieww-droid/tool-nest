// ──────────────────────────────────────────────────────
// ToolNest — Analytics Event Ingestion API
//
// POST /api/analytics
//   Receives batched events from the client tracker.
//   Body: { events: unknown[] }
//
// Privacy contract (enforced here, not just by the client):
//   - only event names in the shared registry are accepted
//   - each event may carry ONLY the attributes its spec allowlists
//     (lib/analytics/events.ts); everything else is dropped
//   - no IPs, headers, user agents, or personal data are stored
//
// GET /api/analytics
//   Introspection: storage mode, event catalog, funnel definitions —
//   handy for dashboards and developer tooling.
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENT_SPECS,
  ANALYTICS_FUNNELS,
  sanitizeAnalyticsEvent,
} from "@/lib/analytics/events";
import {
  getAnalyticsStorageMode,
  ingestAnalyticsEvents,
} from "@/lib/analytics/server";

const MAX_BATCH_SIZE = 50; // must stay >= client MAX_BATCH_SIZE (20)

// ── Basic abuse guard ────────────────────────────────
// In-memory per-instance limiter. Suitable as a coarse guard; for
// multi-instance deployments add a shared (e.g. Upstash/DB) limiter.
// The request IP is used only as a limiter key — never stored/logged.

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

/** POST /api/analytics — ingest a batch of sanitized events. */
export async function POST(request: NextRequest) {
  try {
    const limiterKey =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";
    if (!checkRateLimit(limiterKey)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    let body: { events?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const events = body?.events;
    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "events must be an array" },
        { status: 400 }
      );
    }
    if (events.length === 0) {
      return NextResponse.json({ received: 0, stored: 0, mode: getAnalyticsStorageMode() });
    }
    if (events.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Batch too large (max ${MAX_BATCH_SIZE} events)` },
        { status: 400 }
      );
    }

    // Allowlist validation: drops unknown event names and every
    // attribute not declared for the event. Nothing else is kept.
    const sanitized = events
      .map(sanitizeAnalyticsEvent)
      .filter((e): e is NonNullable<typeof e> => e !== null);

    const result = await ingestAnalyticsEvents(sanitized);

    return NextResponse.json({
      received: events.length,
      stored: result.stored,
      mode: result.mode,
    });
  } catch (error) {
    console.error("[Analytics] Error processing events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** GET /api/analytics — event catalog + funnel definitions for tooling. */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    storageMode: getAnalyticsStorageMode(),
    eventCatalog: ANALYTICS_EVENT_NAMES.map((name) => ({
      event: name,
      description: ANALYTICS_EVENT_SPECS[name].description,
      attributes: Object.keys(ANALYTICS_EVENT_SPECS[name].attributes),
    })),
    funnels: ANALYTICS_FUNNELS,
    docs: "docs/analytics.md (repo)",
  });
}
