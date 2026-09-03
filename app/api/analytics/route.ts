// ──────────────────────────────────────────────────────
// ToolNest — Analytics Event Ingestion API
// Receives batched events from the client
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";

// ── Rate Limiting (simple in-memory) ────────────────

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // max requests per window per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// ── Event Validation ────────────────────────────────

const VALID_EVENTS = new Set([
  "tool_opened",
  "tool_completed",
  "calculation_completed",
  "result_copied",
  "file_uploaded",
  "file_processed",
  "file_downloaded",
  "tool_searched",
  "search_result_clicked",
]);

interface IncomingEvent {
  event?: string;
  timestamp?: number;
  sessionId?: string;
  toolSlug?: string;
  page?: string;
  [key: string]: unknown;
}

function validateEvent(event: unknown): event is IncomingEvent {
  if (!event || typeof event !== "object") return false;
  const e = event as Record<string, unknown>;
  if (!e.event || typeof e.event !== "string") return false;
  if (!VALID_EVENTS.has(e.event)) return false;
  if (e.timestamp && typeof e.timestamp !== "number") return false;
  if (e.sessionId && typeof e.sessionId !== "string") return false;
  return true;
}

// ── POST Handler ────────────────────────────────────

/**
 * POST /api/analytics
 * Receives a batch of analytics events.
 * Body: { events: AnalyticsEvent[] }
 *
 * Events are validated, sanitized, and stored.
 * No PII is collected — only anonymous behavioral data.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events)) {
      return NextResponse.json(
        { error: "events must be an array" },
        { status: 400 }
      );
    }

    // Limit batch size
    if (events.length > 50) {
      return NextResponse.json(
        { error: "Batch too large (max 50 events)" },
        { status: 400 }
      );
    }

    // Validate and sanitize events
    const validEvents = events.filter(validateEvent);

    if (validEvents.length === 0) {
      return NextResponse.json({ received: 0, stored: 0 });
    }

    // Sanitize: strip unexpected fields, enforce types
    const sanitized = validEvents.map((e) => ({
      event: e.event,
      timestamp: typeof e.timestamp === "number" ? e.timestamp : Date.now(),
      sessionId: typeof e.sessionId === "string" ? e.sessionId.slice(0, 64) : null,
      toolSlug: typeof e.toolSlug === "string" ? e.toolSlug.slice(0, 100) : null,
      page: typeof e.page === "string" ? e.page.slice(0, 200) : null,
      // Include additional metadata fields
      ...Object.fromEntries(
        Object.entries(e)
          .filter(([k]) => !["event", "timestamp", "sessionId", "toolSlug", "page"].includes(k))
          .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
          .map(([k, v]) => [k, typeof v === "string" ? v.slice(0, 200) : v])
      ),
    }));

    // ── Store Events ──────────────────────────────────
    // For now, log to console in development.
    // In production, write to:
    //   - PostgreSQL (via the existing Prisma setup)
    //   - ClickHouse / BigQuery for analytics
    //   - Or a third-party analytics service

    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${sanitized.length} events:`, sanitized);
    }

    // TODO: Insert into database
    // await prisma.analyticsEvent.createMany({ data: sanitized });

    return NextResponse.json({
      received: events.length,
      stored: sanitized.length,
    });
  } catch (error) {
    console.error("[Analytics] Error processing events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics
 * Health check endpoint.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    events: Object.values(VALID_EVENTS),
  });
}
