// ──────────────────────────────────────────────────────
// ToolNest — Favorite Tools Database Service
// ──────────────────────────────────────────────────────

import prisma from "@/lib/prisma";

/**
 * Get all favorite tool slugs for a user.
 */
export async function getUserFavorites(userId: string) {
  return prisma.favoriteTool.findMany({
    where: { userId },
    select: {
      id: true,
      toolSlug: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Check if a tool is favorited by a user.
 */
export async function isFavorited(userId: string, toolSlug: string) {
  const favorite = await prisma.favoriteTool.findUnique({
    where: {
      userId_toolSlug: { userId, toolSlug },
    },
    select: { id: true },
  });
  return favorite !== null;
}

/**
 * Add a tool to user's favorites.
 * Prevents duplicates via unique constraint.
 */
export async function addFavorite(userId: string, toolSlug: string) {
  return prisma.favoriteTool.create({
    data: {
      userId,
      toolSlug,
    },
  });
}

/**
 * Remove a tool from user's favorites.
 */
export async function removeFavorite(userId: string, toolSlug: string) {
  return prisma.favoriteTool.delete({
    where: {
      userId_toolSlug: { userId, toolSlug },
    },
  });
}

/**
 * Toggle a tool's favorite status.
 * Returns the new state (true = favorited, false = unfavorited).
 */
export async function toggleFavorite(userId: string, toolSlug: string) {
  const existing = await prisma.favoriteTool.findUnique({
    where: {
      userId_toolSlug: { userId, toolSlug },
    },
  });

  if (existing) {
    await prisma.favoriteTool.delete({
      where: { id: existing.id },
    });
    return false;
  }

  await prisma.favoriteTool.create({
    data: { userId, toolSlug },
  });
  return true;
}
