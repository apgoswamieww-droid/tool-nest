// ──────────────────────────────────────────────────────
// ToolNest — Ads/monetization public API
//
//   import { resolveMonetizationClientBundle, FLAG_DEFAULTS } from "@/lib/monetization";
//
// Layering:
//   flags.ts — feature-flag defaults + evaluation (safe defaults) and
//              the slim server → client ad-config bundle
//   ads.ts   — house-ad placements, creatives, and decideAdSlot
//
// Ownership rule: lib/tools/**, lib/registry.ts and lib/analytics/**
// never import this module. Ads read the registry, not the other way
// around. Tier/plan/entitlement machinery was removed in the free
// pivot — this module is ads-only today.
// ──────────────────────────────────────────────────────

export * from "./flags";
