// ──────────────────────────────────────────────────────
// ToolNest — Entitlements (server-authoritative)
//
// resolveMonetizationEntitlements(user) turns "who is this user?" into
// "what may they do?" (tier, limits, ad-free). R0 resolves tiers from
// an explicit argument only — R1 replaces the free default with a real
// lookup (JWT session → billing state).
//
// resolveMonetizationClientBundle() is the *only* server → client
// bridge: the root layout calls it (server side) and passes the result
// to <MonetizationProvider>. It exposes no secrets and no raw flags —
// just the small, typed surface UI components read.
// ──────────────────────────────────────────────────────

import { MONETIZATION_TIERS, type MonetizationTierId, type TierLimits } from "./config";
import {
  getClientFlagBundle,
  resolveMonetizationFlag,
  type FlagValue,
  type MonetizationFlagKey,
} from "./flags";

export interface MonetizationEntitlements {
  tier: MonetizationTierId;
  /** True when this user must never see ads. */
  adFree: boolean;
  limits: TierLimits;
}

/**
 * Resolve what a tier may do.
 * R0: pure tier → limits mapping. R1: accept an authenticated user and
 * read the account's subscription before falling back to "free".
 */
export function resolveMonetizationEntitlements(
  tier: MonetizationTierId = "free"
): MonetizationEntitlements {
  const meta = MONETIZATION_TIERS[tier];
  return { tier, adFree: meta.adFree, limits: meta.limits };
}

export type FlagOverrides = Partial<Record<MonetizationFlagKey, FlagValue>>;

/**
 * The typed, serializable object the client <MonetizationProvider>
 * receives. Flat fields on purpose — components read
 * `useMonetization().adsEnabled` without knowing flag plumbing.
 */
export interface MonetizationClientBundle {
  tier: MonetizationTierId;
  /** Entitlement: premium/business/api users see no ads regardless of `adsEnabled`. */
  adFree: boolean;
  /** Global ad rollout state (flag `ads.enabled`). Render slots only when true. */
  adsEnabled: boolean;
  /** Ad provider id — "house" until a network adapter is flagged on. */
  adsNetwork: string;
  /** Show lock/Premium badges on premium tools. */
  showPremiumBadges: boolean;
  /** Allow contextual upgrade prompts (staged rollout, default off). */
  showUpsells: boolean;
}

/**
 * Assemble the client bundle. Server-only by convention (call from the
 * root layout); the module is pure enough that the same call yields the
 * safe defaults if it ever runs client-side (no env there).
 */
export function resolveMonetizationClientBundle(
  options: { tier?: MonetizationTierId; flagOverrides?: FlagOverrides } = {}
): MonetizationClientBundle {
  const entitlements = resolveMonetizationEntitlements(options.tier);
  const flags = getClientFlagBundle(options.flagOverrides);

  return {
    tier: entitlements.tier,
    adFree: entitlements.adFree,
    adsEnabled: flags["ads.enabled"] === true,
    adsNetwork: String(flags["ads.network"]),
    showPremiumBadges: flags["premium.showBadges"] !== false,
    showUpsells: flags["premium.showUpsells"] === true,
  };
}
