// ──────────────────────────────────────────────────────
// ToolNest — API usage metering (docs/api-platform.md §7.2)
//
// One row per authenticated call. Service telemetry only: key id,
// request id, route, method, status, latency. NEVER request bodies,
// query strings, raw keys, or IPs.
//
// Best-effort by design — a DB failure must not fail the request, so
// rows fall back to an in-memory buffer (bounded) until the store is
// reachable again.
// ──────────────────────────────────────────────────────

import prisma from "@/lib/prisma";

export interface UsageLogEntry {
  apiKeyId: string;
  requestId: string;
  route: string;
  method: string;
  status: number;
  latencyMs: number;
}

const MAX_BUFFERED = 2_000;
const buffered: UsageLogEntry[] = [];
let flushScheduled = false;

/**
 * Record one authenticated call. Never throws. Combines the insert
 * with a lastUsedAt touch on the key in one transaction.
 */
export async function logApiUsage(entry: UsageLogEntry): Promise<void> {
  try {
    await prisma.$transaction([
      prisma.apiUsageLog.create({ data: entry }),
      prisma.apiKey.update({
        where: { id: entry.apiKeyId },
        data: { lastUsedAt: new Date() },
      }),
    ]);
  } catch (error) {
    // Degrade to the in-memory buffer — the API response is already
    // shaped at this point and must not depend on the DB.
    buffered.push(entry);
    if (buffered.length > MAX_BUFFERED) buffered.shift();
    if (!flushScheduled) {
      flushScheduled = true;
      setTimeout(() => {
        flushScheduled = false;
        void flushBuffered();
      }, 5_000).unref?.();
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[API] Usage log insert failed — buffered in memory. " +
          `Cause: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}

async function flushBuffered(): Promise<void> {
  while (buffered.length > 0) {
    const batch = buffered.splice(0, 100);
    try {
      await prisma.apiUsageLog.createMany({ data: batch });
    } catch {
      buffered.unshift(...batch); // keep for the next attempt
      break;
    }
  }
}

export interface UsageSummary {
  total: number;
  /** Inclusive start date (UTC), ISO yyyy-mm-dd. */
  since: string;
  byRoute: { route: string; count: number }[];
  byStatus: { status: number; count: number }[];
  byDay: { day: string; count: number }[];
}

/**
 * Aggregate usage for one key over the last `days` (default 30, max 90).
 * Rows are limited in practice by the daily quota, so fetching and
 * counting in JS is bounded and keeps DB-specific date functions out.
 */
export async function getKeyUsageSummary(
  apiKeyId: string,
  days: number = 30
): Promise<UsageSummary> {
  const span = Math.min(Math.max(1, Math.floor(days)), 90);
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - (span - 1));
  const sinceIso = start.toISOString().slice(0, 10);

  const rows = await prisma.apiUsageLog.findMany({
    where: { apiKeyId, createdAt: { gte: start } },
    select: { route: true, status: true, createdAt: true },
  });

  const byRoute = new Map<string, number>();
  const byStatus = new Map<number, number>();
  const byDay = new Map<string, number>();

  for (const row of rows) {
    byRoute.set(row.route, (byRoute.get(row.route) ?? 0) + 1);
    byStatus.set(row.status, (byStatus.get(row.status) ?? 0) + 1);
    byDay.set(
      row.createdAt.toISOString().slice(0, 10),
      (byDay.get(row.createdAt.toISOString().slice(0, 10)) ?? 0) + 1
    );
  }

  return {
    total: rows.length,
    since: sinceIso,
    byRoute: [...byRoute.entries()]
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count),
    byStatus: [...byStatus.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    byDay: [...byDay.entries()]
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => (a.day < b.day ? -1 : 1)),
  };
}
