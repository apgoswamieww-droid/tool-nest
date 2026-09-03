"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Analytics Provider & Hook
// Provides tool-scoped analytics context for components
// ──────────────────────────────────────────────────────

import * as React from "react";
import { analytics, trackPageView } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics";

// ── Context ─────────────────────────────────────────

interface AnalyticsContextValue {
  /** The tool slug for this context scope */
  toolSlug: string;
  /** Track an event scoped to this tool */
  track: (
    event: AnalyticsEventName,
    extra?: Record<string, unknown>
  ) => void;
}

const AnalyticsContext = React.createContext<AnalyticsContextValue | null>(null);

// ── Provider ────────────────────────────────────────

interface AnalyticsProviderProps {
  toolSlug: string;
  children: React.ReactNode;
}

/**
 * Wraps a tool page to provide scoped analytics tracking.
 * Automatically tracks `tool_opened` on mount and `tool_completed` via `track()`.
 *
 * @example
 * ```tsx
 * <AnalyticsProvider toolSlug="brick-calculator">
 *   <BrickCalculatorClient />
 * </AnalyticsProvider>
 * ```
 */
export function AnalyticsProvider({ toolSlug, children }: AnalyticsProviderProps) {
  // Track tool_opened on mount
  React.useEffect(() => {
    analytics.toolOpened(toolSlug);
  }, [toolSlug]);

  const track = React.useCallback(
    (event: AnalyticsEventName, extra?: Record<string, unknown>) => {
      const fullData = { toolSlug, ...extra };

      switch (event) {
        case "tool_completed":
          analytics.toolCompleted(toolSlug, (extra as { action?: string })?.action ?? "action");
          break;
        case "calculation_completed":
          analytics.calculationCompleted(toolSlug);
          break;
        case "result_copied":
          analytics.resultCopied(toolSlug, (extra as { resultSize?: number })?.resultSize);
          break;
        case "file_uploaded":
          analytics.fileUploaded(toolSlug, (extra as { file?: File })?.file);
          break;
        case "file_processed":
          analytics.fileProcessed(toolSlug, (extra as { durationMs?: number })?.durationMs);
          break;
        case "file_downloaded":
          analytics.fileDownloaded(toolSlug, (extra as { fileExtension?: string })?.fileExtension);
          break;
        default:
          // For any future events, pass through with full data
          break;
      }
    },
    [toolSlug]
  );

  const value = React.useMemo(() => ({ toolSlug, track }), [toolSlug, track]);

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────

/**
 * Hook to access the analytics context.
 * Must be used within an `<AnalyticsProvider>`.
 *
 * @example
 * ```tsx
 * const { track } = useAnalytics();
 * // Track a calculation
 * track("calculation_completed");
 * // Track a file download
 * track("file_downloaded", { fileExtension: "pdf" });
 * ```
 */
export function useAnalytics() {
  const ctx = React.useContext(AnalyticsContext);
  if (!ctx) {
    // Return a no-op if used outside provider
    return {
      toolSlug: "",
      track: () => {},
    };
  }
  return ctx;
}

// ── Page View Tracker ───────────────────────────────

/**
 * Mount in a tool page to auto-track page views.
 * Uses the pathname to determine the tool slug.
 */
export function PageViewTracker() {
  React.useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  return null;
}

// ── Export standalone functions ──────────────────────

export { analytics };
