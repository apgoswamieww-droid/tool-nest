// ──────────────────────────────────────────────────────
// ToolNest — Analytics storage (server-only)
//
// Writes sanitized events and reads dashboard summaries.
// Storage is pluggable:
//   - "memory" (default when no DATABASE_URL / ANALYTICS_STORAGE)
//     — zero-config dev & demo store; not durable across restarts.
//   - "prisma" — persists to the `analytics_events` table in the
//     project's existing Postgres (Neon) setup. Use when the table
//     has been migrated; otherwise ingest falls back to memory
//     without crashing the request.
//
// Events arriving here have already been validated + sanitized by
// ./events.ts — only allowlisted attributes exist at this point.
// ──────────────────────────────────────────────────────

import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { AnalyticsEventName, SanitizedAnalyticsEvent } from "./events";

export type AnalyticsStorageMode = "memory" | "prisma";

/**
 * Resolve the storage mode:
 * explicit ANALYTICS_STORAGE env wins, otherwise Postgres when a
 * database is configured, otherwise in-memory.
 */
export function getAnalyticsStorageMode(): AnalyticsStorageMode {
  const mode = process.env.ANALYTICS_STORAGE;
  if (mode === "prisma" || mode === "memory") return mode;
  return process.env.DATABASE_URL ? "prisma" : "memory";
}

// ── In-memory store (dev/demo/fallback) ──────────────

interface MemoryRecord extends SanitizedAnalyticsEvent {
  receivedAt: number;
}

const MEMORY_MAX_EVENTS = 50_000;
const MEMORY_RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

const memoryRecords: MemoryRecord[] = [];

function pushToMemory(events: SanitizedAnalyticsEvent[]): void {
  const now = Date.now();
  for (const e of events) {
    memoryRecords.push({ ...e, receivedAt: now });
  }
  // Prune: drop events older than retention, then cap total size.
  const cutoff = now - MEMORY_RETENTION_MS;
  let pruneIndex = 0;
  while (
    pruneIndex < memoryRecords.length &&
    memoryRecords[pruneIndex].receivedAt < cutoff
  ) {
    pruneIndex++;
  }
  if (pruneIndex > 0) memoryRecords.splice(0, pruneIndex);
  if (memoryRecords.length > MEMORY_MAX_EVENTS) {
    memoryRecords.splice(0, memoryRecords.length - MEMORY_MAX_EVENTS);
  }
}

// ── Prisma store ─────────────────────────────────────

let prismaStoreFailed = false;
let warnedAboutFallback = false;

async function ingestViaPrisma(
  events: SanitizedAnalyticsEvent[]
): Promise<void> {
  await prisma.analyticsEvent.createMany({
    data: events.map((e) => ({
      event: e.event,
      toolSlug: e.toolSlug ?? null,
      page: e.page || null,
      sessionId: e.sessionId || null,
      occurredAt: new Date(e.timestamp),
      meta: e.attributes as Prisma.InputJsonValue,
    })),
  });
}

// ── Public ingest API ────────────────────────────────

export interface IngestResult {
  stored: number;
  mode: AnalyticsStorageMode;
}

/**
 * Persist a batch of sanitized events.
 * Never throws: a missing DB or un-migrated table degrades to the
 * in-memory store so analytics can never break the product.
 */
export async function ingestAnalyticsEvents(
  events: SanitizedAnalyticsEvent[]
): Promise<IngestResult> {
  if (events.length === 0) return { stored: 0, mode: getAnalyticsStorageMode() };

  if (getAnalyticsStorageMode() === "prisma" && !prismaStoreFailed) {
    try {
      await ingestViaPrisma(events);
      return { stored: events.length, mode: "prisma" };
    } catch (error) {
      prismaStoreFailed = true;
      if (!warnedAboutFallback) {
        warnedAboutFallback = true;
        console.warn(
          "[Analytics] Prisma store unavailable — falling back to in-memory. " +
            "Ensure the `analytics_events` table exists (prisma migrate dev). " +
            `Cause: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  pushToMemory(events);
  return { stored: events.length, mode: "memory" };
}

// ── Dashboard summary ────────────────────────────────

export interface AnalyticsSummary {
  generatedAt: number;
  mode: AnalyticsStorageMode;
  days: number;
  totalEvents: number;
  /** Counts grouped by event name (funnel steps). */
  byEvent: { event: AnalyticsEventName | string; count: number }[];
  /** Counts grouped by tool slug. */
  byTool: { tool: string; count: number }[];
  /** Counts by UTC day (dashboard-friendly series). */
  byDay: { day: string; count: number }[];
}

interface SummarySource {
  event: string;
  tool: string | null;
  occurredAt: Date;
}

function summarize(rows: SummarySource[], days: number): AnalyticsSummary {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = rows.filter((r) => r.occurredAt.getTime() >= cutoff);

  const byEvent = new Map<string, number>();
  const byTool = new Map<string, number>();
  const byDay = new Map<string, number>();

  for (const row of recent) {
    byEvent.set(row.event, (byEvent.get(row.event) ?? 0) + 1);
    const tool = row.tool ?? "(no tool)";
    byTool.set(tool, (byTool.get(tool) ?? 0) + 1);
    const day = row.occurredAt.toISOString().slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const sortDesc = (
    a: { count: number },
    b: { count: number }
  ) => b.count - a.count;

  return {
    generatedAt: Date.now(),
    mode: getAnalyticsStorageMode(),
    days,
    totalEvents: recent.length,
    byEvent: [...byEvent.entries()]
      .map(([event, count]) => ({ event, count }))
      .sort(sortDesc),
    byTool: [...byTool.entries()]
      .map(([tool, count]) => ({ tool, count }))
      .sort(sortDesc)
      .slice(0, 50),
    byDay: [...byDay.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day)),
  };
}

/**
 * Aggregate the last `days` of events for a dashboard.
 * Data is anonymous and aggregated only — never raw events or PII.
 */
export async function getAnalyticsSummary(days = 7): Promise<AnalyticsSummary> {
  const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  if (getAnalyticsStorageMode() === "prisma" && !prismaStoreFailed) {
    try {
      const rows = await prisma.analyticsEvent.findMany({
        where: { occurredAt: { gte: start } },
        select: { event: true, toolSlug: true, occurredAt: true },
      });
      return summarize(
        rows.map((r) => ({
          event: r.event,
          tool: r.toolSlug ?? null,
          occurredAt: r.occurredAt,
        })),
        days
      );
    } catch (error) {
      prismaStoreFailed = true;
      console.warn(
        "[Analytics] Prisma summary unavailable — using in-memory store. " +
          `Cause: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return summarize(
    memoryRecords.map((r) => ({
      event: r.event,
      tool: r.toolSlug ?? null,
      occurredAt: new Date(r.timestamp),
    })),
    days
  );
}
