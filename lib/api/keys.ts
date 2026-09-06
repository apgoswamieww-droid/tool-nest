// ──────────────────────────────────────────────────────
// ToolNest — API key lifecycle helpers (docs/api-platform.md §6)
//
// Keys are free (no paid tiers) — quotaPerDay is a fairness cap, not a
// billing mechanism. The raw key is generated once, shown once, and
// only its sha256 digest is stored.
// ──────────────────────────────────────────────────────

import { createHash, randomBytes } from "node:crypto";

export const KEY_PREFIX = "tn_live_";
/** Full key = prefix + 43 base64url chars (32 random bytes). */
const KEY_BYTES = 32;

export function issueApiKey(): string {
  return KEY_PREFIX + randomBytes(KEY_BYTES).toString("base64url");
}

export function hashApiKey(rawKey: string): string {
  return createHash("sha256").update(rawKey, "utf8").digest("hex");
}

/**
 * Compact display form for UI lists, e.g. "tn_live_a1b2…wxyz"
 * (fits the schema's VarChar(20)). Never reveals enough of the key to
 * reconstruct or use it.
 */
export function keyPrefixDisplay(fullKey: string): string {
  const head = fullKey.slice(0, KEY_PREFIX.length + 4);
  const tail = fullKey.slice(-4);
  return `${head}…${tail}`;
}
