"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Monetization Provider
//
// Mounted once in the root layout (app/layout.tsx) with a bundle that
// the SERVER resolved (resolveMonetizationClientBundle in
// lib/monetization). Components read the flat bundle via
// useMonetization():
//
//   const { adsEnabled, adFree, tier } = useMonetization();
//
// No raw flags and no secrets reach the client — only the typed fields
// below. Safe default (no provider, e.g. isolated renders): free tier,
// ads off — same as the server defaults.
// ──────────────────────────────────────────────────────

import * as React from "react";
import { resolveMonetizationClientBundle } from "@/lib/monetization";
import type { MonetizationClientBundle } from "@/lib/monetization";

const MonetizationContext =
  React.createContext<MonetizationClientBundle | null>(null);

// Used only when no provider is mounted. Pure module, no env access:
// yields the safe defaults on the client (ads off, free tier).
const DEFAULT_BUNDLE: MonetizationClientBundle =
  resolveMonetizationClientBundle();

interface MonetizationProviderProps {
  bundle: MonetizationClientBundle;
  children: React.ReactNode;
}

export function MonetizationProvider({
  bundle,
  children,
}: MonetizationProviderProps) {
  const value = React.useMemo(() => bundle, [bundle]);
  return (
    <MonetizationContext.Provider value={value}>
      {children}
    </MonetizationContext.Provider>
  );
}

/**
 * Read the resolved monetization state. Always returns a valid bundle —
 * safe to call anywhere, even outside the provider.
 */
export function useMonetization(): MonetizationClientBundle {
  const ctx = React.useContext(MonetizationContext);
  return ctx ?? DEFAULT_BUNDLE;
}
