// ──────────────────────────────────────────────────────
// ToolNest — Monetization config (pure data, no env)
//
// Tier/plan metadata and per-tier limits. Single source of truth for
// what each tier may do. Nothing here reads environment variables or
// imports framework code, so it is safe to import from server and
// client modules alike.
//
// Flag defaults live in ./flags.ts (FLAG_DEFAULTS) — see the roadmap
// in docs/monetization.md §6 for why they are separated.
// ──────────────────────────────────────────────────────

/** Entitlement tiers. Tool-level gating uses `ToolTier` (types/tool.ts); this is the account/plan tier. */
export type MonetizationTierId = "free" | "premium" | "business" | "api";

/** What a tier may do. Tool code should read these — never hardcode limits. */
export interface TierLimits {
  /** Largest single file a file tool accepts (MB). */
  maxFileMb: number;
  /** Max files per batch run (e.g. PDF merger). */
  batchSize: number;
  /** Saved results/history available (free tools compute without login). */
  savedHistory: boolean;
  /** Daily request quota on the public API (0 = not available). */
  apiQuotaPerDay: number;
}

interface TierMeta {
  label: string;
  /** Whether this tier is served ad-free. */
  adFree: boolean;
  limits: TierLimits;
}

export const MONETIZATION_TIERS: Record<MonetizationTierId, TierMeta> = {
  free: {
    label: "Free",
    adFree: false,
    limits: {
      maxFileMb: 50,
      batchSize: 10,
      savedHistory: false,
      apiQuotaPerDay: 0,
    },
  },
  premium: {
    label: "Premium",
    adFree: true,
    limits: {
      maxFileMb: 200,
      batchSize: 50,
      savedHistory: true,
      apiQuotaPerDay: 0,
    },
  },
  api: {
    label: "API",
    adFree: true,
    limits: {
      maxFileMb: 200,
      batchSize: 100,
      savedHistory: true,
      apiQuotaPerDay: 1_000,
    },
  },
  business: {
    label: "Business",
    adFree: true,
    limits: {
      maxFileMb: 500,
      batchSize: 500,
      savedHistory: true,
      apiQuotaPerDay: 10_000,
    },
  },
};

/**
 * The free tier's limits — the public contract of the product.
 * Today's tool behavior (e.g. 10-file PDF merges, 50 MB uploads) IS
 * these numbers; raising them for paid tiers must not require editing
 * tool code (see docs/monetization.md §4.2).
 */
export const FREE_TIER_LIMITS: TierLimits = MONETIZATION_TIERS.free.limits;
