"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Analytics Provider & Hook
//
// Mounted once per tool page (inside <ToolPageWrapper />) so every
// reusable tool component — CopyButton, result panels, dropzones,
// PDF workers — can emit events scoped to the current tool without
// threading `toolSlug` props through each page.
// ──────────────────────────────────────────────────────

import * as React from "react";
import {
  ANALYTICS_EVENT_SPECS,
  analytics,
  trackEvent,
} from "@/lib/analytics";
import type {
  AnalyticsAttributeValue,
  AnalyticsEventName,
} from "@/lib/analytics";

// ── Context ─────────────────────────────────────────

interface AnalyticsContextValue {
  /** The tool slug for this context scope. */
  toolSlug: string;
  /**
   * Track a registry event scoped to this tool.
   * Only allowlisted attributes (lib/analytics/events.ts) are sent.
   */
  track: (
    event: AnalyticsEventName,
    extra?: Record<string, AnalyticsAttributeValue>
  ) => void;
}

const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(
  null
);

/** Extract the tool slug from a pathname like "/tools/text-repeater". */
export function slugFromPathname(path: string): string {
  if (!path.startsWith("/tools/")) return "";
  return path.slice("/tools/".length).split(/[/?#]/)[0];
}

/**
 * Resolve the active tool slug:
 * explicit override prop → AnalyticsProvider context → pathname.
 * Returns "" when no tool context exists (e.g. marketing pages).
 */
export function useToolSlug(override?: string): string {
  const ctx = React.useContext(AnalyticsContext);
  if (override) return override;
  if (ctx) return ctx.toolSlug;
  if (typeof window === "undefined") return "";
  return slugFromPathname(window.location.pathname);
}

/** Parse a file extension from a `download` filename (never the full name). */
function extensionOf(download: string): string | undefined {
  const ext = download.split(".").pop();
  return ext && ext !== download ? ext.toLowerCase().slice(0, 16) : undefined;
}

// ── Provider ────────────────────────────────────────

interface AnalyticsProviderProps {
  toolSlug: string;
  children: React.ReactNode;
}

/**
 * Wraps a tool page to provide scoped analytics tracking.
 * Automatically tracks `tool_opened` on mount and detects
 * `file_downloaded` for any `<a download>` activation inside the page.
 *
 * @example
 * ```tsx
 * <AnalyticsProvider toolSlug="brick-calculator">
 *   <BrickCalculatorClient />
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({
  toolSlug,
  children,
}: AnalyticsProviderProps) {
  // Track tool_opened on mount (deduped client-side for StrictMode).
  React.useEffect(() => {
    analytics.toolOpened(toolSlug);
  }, [toolSlug]);

  // Delegated file_downloaded detection.
  // Catches both real clicks and programmatic `anchor.click()` downloads
  // (PDF tools create temporary <a download> elements) without needing
  // per-page instrumentation. New file tools inherit tracking for free.
  React.useEffect(() => {
    const handleClick = (event: Event) => {
      const target = event.target as Element | null;
      if (!target || typeof target.closest !== "function") return;
      const anchor = target.closest("a[download]") as HTMLAnchorElement | null;
      if (!anchor) return;
      analytics.fileDownloaded(toolSlug, extensionOf(anchor.download));
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [toolSlug]);

  const track = React.useCallback(
    (event: AnalyticsEventName, extra?: Record<string, AnalyticsAttributeValue>) => {
      const spec = ANALYTICS_EVENT_SPECS[event];
      if (!spec) return;

      const payload: Record<string, AnalyticsAttributeValue> = {};
      for (const key of Object.keys(spec.attributes)) {
        if (key === "toolSlug") continue; // always injected below
        const value = extra?.[key];
        if (value === undefined || value === null) continue;
        payload[key] = value;
      }
      trackEvent({ event, toolSlug, ...payload });
    },
    [toolSlug]
  );

  const value = React.useMemo(
    () => ({ toolSlug, track }),
    [toolSlug, track]
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────

/**
 * Hook to access the analytics context.
 * Safe to use outside a provider (returns a no-op context) — reusable
 * components can therefore always call it.
 *
 * @example
 * ```tsx
 * const { track } = useAnalytics();
 * track("file_downloaded", { fileExtension: "pdf" });
 * ```
 */
export function useAnalytics() {
  const ctx = React.useContext(AnalyticsContext);
  if (!ctx) {
    return { toolSlug: "", track: () => {} };
  }
  return ctx;
}

// ── Page View Tracker ───────────────────────────────

/**
 * Mount in a page to auto-track a tool page view when no
 * AnalyticsProvider is present. Providers already track `tool_opened`,
 * so this is mainly for non-tool layouts.
 */
export function PageViewTracker() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const slug = slugFromPathname(window.location.pathname);
    if (slug) analytics.toolOpened(slug);
  }, []);
  return null;
}

// ── Export standalone helpers (backwards compatible) ─

export { analytics };
