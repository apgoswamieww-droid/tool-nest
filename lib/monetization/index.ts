// ──────────────────────────────────────────────────────
// ToolNest — Monetization public API
//
//   import { resolveMonetizationClientBundle, FLAG_DEFAULTS } from "@/lib/monetization";
//
// Layering (see docs/monetization.md §3):
//   config.ts       — tier metadata + per-tier limits (pure data)
//   flags.ts        — feature-flag defaults + evaluation (safe defaults)
//   entitlements.ts — tier resolution + the server → client bundle
//
// Ownership rule: lib/tools/**, lib/registry.ts and lib/analytics/**
// never import this module. Monetization reads the registry, not the
// other way around.
// ──────────────────────────────────────────────────────

export * from "./config";
export * from "./flags";
export * from "./entitlements";
