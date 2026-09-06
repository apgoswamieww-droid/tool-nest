// ──────────────────────────────────────────────────────
// ToolNest — Feature flags (ads rollout)
//
// Everything defaults to OFF or the least invasive value. Resolution
// order (highest first):
//   1. explicit overrides — request context (e.g. an entitlements
//      result forcing `ads.enabled = false` for a given surface)
//   2. environment      — TOOLNEST_FLAG_<UPPER_SNAKE> (ops kill switch,
//      no deploy needed when the server reads env at runtime)
//   3. safe default     — FLAG_DEFAULTS below
//
// A DB-backed override layer slots in between 1 and 2 later.
// Client code never evaluates flags directly — the server resolves a
// small typed bundle (resolveMonetizationClientBundle below) and the
// <MonetizationProvider> exposes it. No flag value here is a secret;
// the bundle simply keeps the client surface small.
// ──────────────────────────────────────────────────────

export type FlagValue = boolean | number | string;

/**
 * All flags and their safe defaults.
 * Convention: `<stream>.<name>`, snake_case value names.
 */
export const FLAG_DEFAULTS = {
  /** Master switch for ad slots (R2). Off until ad surfaces exist. */
  "ads.enabled": false,
  /** Ad provider id: "house" (self-promotion) or a network adapter id. */
  "ads.network": "house",
} as const;

export type MonetizationFlagKey = keyof typeof FLAG_DEFAULTS;

/** Flags safe to hand to the browser (currently: all of them). */
export const CLIENT_SAFE_FLAGS: readonly MonetizationFlagKey[] = [
  "ads.enabled",
  "ads.network",
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
 * Overrides win so server logic can force behavior for a surface/user
 * (e.g. ads off for opted-out contexts) regardless of ops env.
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

/**
 * The typed, serializable object the client <MonetizationProvider>
 * receives. Flat fields on purpose — components read
 * `useMonetization().adsEnabled` without knowing flag plumbing.
 */
export interface MonetizationClientBundle {
  /** Global ad rollout state (flag `ads.enabled`). Render slots only when true. */
  adsEnabled: boolean;
  /** Ad provider id — "house" until a network adapter is flagged on. */
  adsNetwork: string;
}

/**
 * Assemble the client bundle. Server-only by convention (call from the
 * root layout); the module is pure enough that the same call yields the
 * safe defaults if it ever runs client-side (no env there).
 */
export function resolveMonetizationClientBundle(): MonetizationClientBundle {
  const flags = getClientFlagBundle();
  return {
    adsEnabled: flags["ads.enabled"] === true,
    adsNetwork: String(flags["ads.network"]),
  };
}
