// ──────────────────────────────────────────────────────
// ToolNest — Feature flags (monetization rollouts)
//
// Everything defaults to OFF or the least invasive value. Resolution
// order (highest first):
//   1. explicit overrides — request/user context (e.g. an entitlements
//      result forcing `ads.enabled = false` for a premium user)
//   2. environment      — TOOLNEST_FLAG_<UPPER_SNAKE> (ops kill switch,
//      no deploy needed when the server reads env at runtime)
//   3. safe default     — FLAG_DEFAULTS below
//
// A DB-backed override layer slots in between 1 and 2 later (R1+).
// Client code never evaluates flags directly — the server resolves a
// small typed bundle (resolveMonetizationClientBundle in
// ./entitlements.ts) and the <MonetizationProvider> exposes it. No
// flag value here is a secret; the bundle simply keeps the client
// surface small.
// ──────────────────────────────────────────────────────

export type FlagValue = boolean | number | string;

/**
 * All monetization flags and their safe defaults.
 * Convention: `<stream>.<name>`, snake_case value names.
 */
export const FLAG_DEFAULTS = {
  /** Master switch for ad slots (R2). Off until ad surfaces exist. */
  "ads.enabled": false,
  /** Ad provider id: "house" (self-promotion) or a network adapter id. */
  "ads.network": "house",
  /** Show the lock + "Premium" badge on premium tools (R1). */
  "premium.showBadges": true,
  /** Show contextual, dismissible upgrade prompts (R1). Off by default; staged rollout. */
  "premium.showUpsells": false,
  /** Expose the public API (R4). */
  "api.public": false,
  /** Enable business/team subscriptions (R4). */
  "business.teams": false,
} as const;

export type MonetizationFlagKey = keyof typeof FLAG_DEFAULTS;

/** Flags safe to hand to the browser (never api/business internals). */
export const CLIENT_SAFE_FLAGS: readonly MonetizationFlagKey[] = [
  "ads.enabled",
  "ads.network",
  "premium.showBadges",
  "premium.showUpsells",
];

export type ClientSafeFlagKey = (typeof CLIENT_SAFE_FLAGS)[number];

/** The typed subset of flags the client bundle may carry. */
export type ClientFlagBundle = { [K in ClientSafeFlagKey]: FlagValue };

function envVarName(key: MonetizationFlagKey): string {
  const snake = key
    .replace(/\./g, "_")
    .replace(/-/g, "_")
    // camelCase → snake_case so dotted keys map to TOOLNEST_FLAG_*_*_*
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toUpperCase();
  return `TOOLNEST_FLAG_${snake}`;
}

function parseEnvValue(raw: string): FlagValue {
  if (raw === "true") return true;
  if (raw === "false") return false;
  const trimmed = raw.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    const num = Number(trimmed);
    if (Number.isFinite(num)) return num;
  }
  return raw;
}

/**
 * Resolve one flag: explicit overrides → environment → default.
 * Overrides win so server logic can force behavior for a user/tier
 * (e.g. premium ⇒ ads off) regardless of ops env.
 */
export function resolveMonetizationFlag<K extends MonetizationFlagKey>(
  key: K,
  overrides?: Partial<Record<MonetizationFlagKey, FlagValue>>
): FlagValue {
  if (overrides && key in overrides && overrides[key] !== undefined) {
    return overrides[key] as FlagValue;
  }
  // Guarded so this module is safe to bundle client-side (env reads
  // return undefined there and the default wins).
  if (typeof process !== "undefined" && process.env) {
    const envRaw = process.env[envVarName(key)];
    if (envRaw !== undefined) return parseEnvValue(envRaw);
  }
  return FLAG_DEFAULTS[key];
}

/** Resolve every client-safe flag into a typed bundle. */
export function getClientFlagBundle(
  overrides?: Partial<Record<MonetizationFlagKey, FlagValue>>
): ClientFlagBundle {
  const out = {} as ClientFlagBundle;
  for (const key of CLIENT_SAFE_FLAGS) {
    out[key] = resolveMonetizationFlag(key, overrides);
  }
  return out;
}
