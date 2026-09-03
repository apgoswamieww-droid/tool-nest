// ──────────────────────────────────────────────────────
// ToolNest — User Preferences Database Service
// ──────────────────────────────────────────────────────

import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface UpdatePreferencesInput {
  theme?: "light" | "dark" | "system";
  language?: string;
  defaults?: Record<string, unknown>;
}

/**
 * Get user preferences, creating defaults if they don't exist.
 */
export async function getUserPreferences(userId: string) {
  let preferences = await prisma.userPreference.findUnique({
    where: { userId },
    select: {
      id: true,
      theme: true,
      language: true,
      defaults: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!preferences) {
    preferences = await prisma.userPreference.create({
      data: { userId },
      select: {
        id: true,
        theme: true,
        language: true,
        defaults: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  return preferences;
}

/**
 * Update user preferences.
 */
export async function updateUserPreferences(
  userId: string,
  data: UpdatePreferencesInput
) {
  // Upsert: create if doesn't exist, update if it does
  return prisma.userPreference.upsert({
    where: { userId },
    create: {
      userId,
      theme: data.theme,
      language: data.language,
      defaults: (data.defaults ?? {}) as Prisma.InputJsonValue,
    },
    update: {
      ...(data.theme !== undefined && { theme: data.theme }),
      ...(data.language !== undefined && { language: data.language }),
      ...(data.defaults !== undefined && { defaults: data.defaults as Prisma.InputJsonValue }),
    },
    select: {
      id: true,
      theme: true,
      language: true,
      defaults: true,
      updatedAt: true,
    },
  });
}
