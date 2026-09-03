// ──────────────────────────────────────────────────────
// ToolNest — Tool Usage History Database Service
// ──────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface RecordUsageInput {
  toolSlug: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface UsageHistoryFilters {
  toolSlug?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Record a tool usage event.
 */
export async function recordUsage(userId: string, data: RecordUsageInput) {
  return prisma.toolUsageHistory.create({
    data: {
      userId,
      toolSlug: data.toolSlug,
      action: data.action,
      metadata: (data.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}

/**
 * Get recent tool usage history for a user with pagination.
 */
export async function getUserUsageHistory(
  userId: string,
  filters: UsageHistoryFilters = {}
) {
  const { toolSlug, page = 1, pageSize = DEFAULT_PAGE_SIZE } = filters;
  const skip = (page - 1) * pageSize;

  const where = {
    userId,
    ...(toolSlug ? { toolSlug } : {}),
  };

  const [history, total] = await Promise.all([
    prisma.toolUsageHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        toolSlug: true,
        action: true,
        metadata: true,
        createdAt: true,
      },
    }),
    prisma.toolUsageHistory.count({ where }),
  ]);

  return {
    history,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get recently used tools (unique tool slugs, most recent first).
 */
export async function getRecentlyUsedTools(userId: string, limit = 10) {
  const recent = await prisma.toolUsageHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    distinct: ["toolSlug"],
    take: limit,
    select: {
      toolSlug: true,
      createdAt: true,
    },
  });

  return recent;
}

/**
 * Delete all usage history for a user.
 */
export async function clearUsageHistory(userId: string) {
  return prisma.toolUsageHistory.deleteMany({
    where: { userId },
  });
}
