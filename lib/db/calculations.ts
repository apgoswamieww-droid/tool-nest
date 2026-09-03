// ──────────────────────────────────────────────────────
// ToolNest — Saved Calculations Database Service
// ──────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface SaveCalculationInput {
  toolSlug: string;
  title?: string;
  toolVersion?: string;
  input: Record<string, unknown>;
  result: Record<string, unknown>;
}

export interface CalculationFilters {
  toolSlug?: string;
  page?: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

/**
 * Get all saved calculations for a user with pagination.
 */
export async function getUserCalculations(
  userId: string,
  filters: CalculationFilters = {}
) {
  const { toolSlug, page = 1, pageSize = DEFAULT_PAGE_SIZE } = filters;
  const skip = (page - 1) * pageSize;

  const where = {
    userId,
    ...(toolSlug ? { toolSlug } : {}),
  };

  const [calculations, total] = await Promise.all([
    prisma.savedCalculation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      select: {
        id: true,
        toolSlug: true,
        title: true,
        toolVersion: true,
        input: true,
        result: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.savedCalculation.count({ where }),
  ]);

  return {
    calculations,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

/**
 * Get a single saved calculation by ID.
 * Verifies ownership.
 */
export async function getCalculation(id: string, userId: string) {
  return prisma.savedCalculation.findFirst({
    where: {
      id,
      userId,
    },
    select: {
      id: true,
      toolSlug: true,
      title: true,
      toolVersion: true,
      input: true,
      result: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Save a new calculation.
 */
export async function saveCalculation(
  userId: string,
  data: SaveCalculationInput
) {
  return prisma.savedCalculation.create({
    data: {
      userId,
      toolSlug: data.toolSlug,
      title: data.title,
      toolVersion: data.toolVersion,
      input: data.input as Prisma.InputJsonValue,
      result: data.result as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      toolSlug: true,
      title: true,
      toolVersion: true,
      input: true,
      result: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Update a saved calculation.
 * Verifies ownership.
 */
export async function updateCalculation(
  id: string,
  userId: string,
  data: { title?: string; input?: Record<string, unknown>; result?: Record<string, unknown> }
) {
  return prisma.savedCalculation.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.input !== undefined && { input: data.input as Prisma.InputJsonValue }),
      ...(data.result !== undefined && { result: data.result as Prisma.InputJsonValue }),
    },
  });
}

/**
 * Delete a saved calculation.
 * Verifies ownership.
 */
export async function deleteCalculation(id: string, userId: string) {
  return prisma.savedCalculation.deleteMany({
    where: {
      id,
      userId,
    },
  });
}
