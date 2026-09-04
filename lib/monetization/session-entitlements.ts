// ──────────────────────────────────────────────────────
// ToolNest — Session entitlements (SERVER ONLY)
//
// Bridges the signed-in session to an Entitlements result. Kept out of
// ./entitlements.ts (which must stay free of server-only imports so the
// client <MonetizationProvider> can keep its safe-default fallback).
//
// Tier source of truth: `User.plan` (prisma). The future billing
// webhook updates that column; this resolver never invents state.
//
// Dev preview: `PREMIUM_DEV_TIER=premium npm run dev` grants a tier to
// everyone in non-production so the premium experience can be built and
// QA'd before checkout exists. It is ignored when NODE_ENV ===
// "production" and never affects stored data.
// ──────────────────────────────────────────────────────

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { MonetizationTierId } from "./config";
import {
  resolveMonetizationEntitlements,
  type MonetizationEntitlements,
} from "./entitlements";

const VALID_TIERS: readonly MonetizationTierId[] = [
  "free",
  "premium",
  "business",
  "api",
];

function toTier(value: unknown): MonetizationTierId {
  return typeof value === "string" && (VALID_TIERS as string[]).includes(value)
    ? (value as MonetizationTierId)
    : "free";
}

/** Entitlements for the current request: session plan → tier → limits. */
export async function resolveSessionEntitlements(): Promise<MonetizationEntitlements> {
  // Non-production override so the full premium tools can be previewed
  // before billing exists. Never active in production builds.
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.PREMIUM_DEV_TIER
  ) {
    return resolveMonetizationEntitlements(toTier(process.env.PREMIUM_DEV_TIER));
  }

  const session = await auth();
  if (!session?.user?.id) {
    return resolveMonetizationEntitlements("free");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    return resolveMonetizationEntitlements(toTier(user?.plan));
  } catch (error) {
    // DB down must never break tool pages — degrade to free.
    console.warn(
      "[Monetization] Plan lookup failed — treating as free. " +
        `Cause: ${error instanceof Error ? error.message : String(error)}`
    );
    return resolveMonetizationEntitlements("free");
  }
}

/** True when the current user may use premium tools (dev override included). */
export async function isPremiumSession(): Promise<boolean> {
  const entitlements = await resolveSessionEntitlements();
  return entitlements.tier !== "free";
}
