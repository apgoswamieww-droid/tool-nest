// ──────────────────────────────────────────────────────
// ToolNest — Privacy-Conscious Analytics (client)
//
// Batched, fire-and-forget event delivery designed to never
// block or slow down the UI:
//   - events are queued and flushed in small batches
//   - `sendBeacon` on page hide (survives unload), fetch fallback
//   - queue is bounded — an offline browser can never grow memory
//   - every event is opt-out-able and respects Do Not Track / GPC
//
// Nothing here stores personal information: no cookies, no email,
// no IPs, no input content — only anonymous behavioral signals
// defined in ./events.ts.
// ──────────────────────────────────────────────────────

import {
  ANALYTICS_EVENT_SPECS,
  AnalyticsEvents,
  type AnalyticsAttributeValue,
  type AnalyticsEventName,
} from "./events";

// Precompute the declared attribute keys per event. The server applies
// the same allowlist again, but the client shouldn't even collect extras.
const EVENT_SPEC_LOOKUP = Object.fromEntries(
  (Object.keys(ANALYTICS_EVENT_SPECS) as AnalyticsEventName[]).map(
    (name) => [
      name,
      { declaredKeys: Object.keys(ANALYTICS_EVENT_SPECS[name].attributes) },
    ]
  )
) as Record<AnalyticsEventName, { declaredKeys: string[] }>;

// ── Session management ───────────────────────────────

const SESSION_KEY = "tn_sid";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes of inactivity

/**
 * Get or create an anonymous session id.
 *
 * Stored in `sessionStorage` only (never a cookie): it is
 * tab-scoped, cleared when the tab closes, and contains a random
 * uuid — no personal information. Used solely to stitch together
 * multi-page funnels (e.g. search → tool page) within one session.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { id: string; lastActive: number };
      if (Date.now() - parsed.lastActive < SESSION_TTL_MS) {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ id: parsed.id, lastActive: Date.now() })
        );
        return parsed.id;
      }
    }
  } catch {
    // storage unavailable — fall through to a fresh id
  }

  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id, lastActive: Date.now() })
    );
  } catch {
    // storage full or unavailable
  }
  return id;
}

// ── Privacy controls ─────────────────────────────────

const OPT_OUT_KEY = "tn_analytics_opt_out";

/** Respect browser-level privacy signals. */
function hasBrowserOptOut(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    const gpc = (navigator as unknown as { globalPrivacyControl?: boolean })
      .globalPrivacyControl;
    if (gpc === true) return true;
  } catch {
    // ignore
  }
  return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes";
}

/** Site-level opt-out persisted in localStorage (not a cookie). */
export function isAnalyticsOptedOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Opt the current browser out of analytics (persisted, no cookie). */
export function setAnalyticsOptOut(optedOut: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (optedOut) localStorage.setItem(OPT_OUT_KEY, "1");
    else localStorage.removeItem(OPT_OUT_KEY);
  } catch {
    // storage unavailable
  }
}

function isTrackingDisabled(): boolean {
  return isAnalyticsOptedOut() || hasBrowserOptOut();
}

// ── Batch queue ──────────────────────────────────────

const FLUSH_INTERVAL_MS = 5_000; // flush at most every 5 s while queued
const MAX_BATCH_SIZE = 20; // events per request (server caps at 50)
const MAX_QUEUE_SIZE = 100; // bound memory when offline

interface QueuedEvent {
  event: AnalyticsEventName;
  timestamp: number;
  sessionId?: string;
  page?: string;
  [attribute: string]: unknown;
}

let eventQueue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let droppedForOverflow = 0;
let warnedAboutOverflow = false;

function scheduleFlush(): void {
  if (flushTimer) return;
  flushTimer = setInterval(() => {
    void flush();
    if (eventQueue.length === 0 && flushTimer) {
      clearInterval(flushTimer);
      flushTimer = null;
    }
  }, FLUSH_INTERVAL_MS);
}

function enqueue(event: QueuedEvent): void {
  eventQueue.push(event);

  // Bound memory: when offline for a long time, drop the oldest
  // events rather than growing the queue without limit.
  if (eventQueue.length > MAX_QUEUE_SIZE) {
    eventQueue.splice(0, eventQueue.length - MAX_QUEUE_SIZE);
    droppedForOverflow += 1;
    if (!warnedAboutOverflow) {
      warnedAboutOverflow = true;
      console.warn(
        "[Analytics] queue overflow — oldest events dropped. " +
          "Check connectivity to /api/analytics."
      );
    }
  }

  if (eventQueue.length >= MAX_BATCH_SIZE) {
    void flush();
  } else {
    scheduleFlush();
  }
}

/** Send one batch; returns true when the network accepted it. */
async function sendBatch(batch: QueuedEvent[]): Promise<boolean> {
  const payload = JSON.stringify({ events: batch });
  const endpoint = "/api/analytics";

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      if (navigator.sendBeacon(endpoint, blob)) return true;
    }
    if (typeof fetch !== "undefined") {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      });
      return res.ok;
    }
  } catch {
    // network error — handled by the caller
  }
  return false;
}

/** Flush pending events. Never throws, never blocks the UI. */
export async function flush(): Promise<void> {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
  const accepted = await sendBatch(batch);

  if (!accepted) {
    // Keep events for the next attempt (bounded by MAX_QUEUE_SIZE).
    eventQueue.unshift(...batch);
    if (eventQueue.length > MAX_QUEUE_SIZE) {
      eventQueue.splice(0, eventQueue.length - MAX_QUEUE_SIZE);
    }
  }
}

// Flush before the page goes away (tab switch, unload, mobile nav).
if (typeof window !== "undefined") {
  const flushOnHide = () => {
    if (document.visibilityState === "hidden") void flush();
  };
  window.addEventListener("visibilitychange", flushOnHide);
  window.addEventListener("pagehide", flushOnHide);
  window.addEventListener("beforeunload", flushOnHide);
}

// ── Tracking core ────────────────────────────────────

/** Options shared by every event. */
export interface TrackEventInput {
  event: AnalyticsEventName;
  /** Tool slug for tool-scoped events. */
  toolSlug?: string;
  /** Page pathname override (defaults to window.location.pathname). */
  page?: string;
  /** Unix ms override (used for tests). */
  timestamp?: number;
  /** Session override (used for tests). */
  sessionId?: string;
  /** Allowlisted attributes for this event (see ./events.ts). */
  [attribute: string]: unknown;
}

/**
 * Queue one event for delivery.
 * No-ops on the server and when the user has opted out.
 */
export function trackEvent(input: TrackEventInput): void {
  if (typeof window === "undefined") return;
  if (isTrackingDisabled()) return;

  const sessionId = input.sessionId ?? getSessionId();
  if (!sessionId) return;

  const event: QueuedEvent = {
    event: input.event,
    timestamp: input.timestamp ?? Date.now(),
    sessionId,
    page:
      input.page ??
      (window.location.pathname.length > 0
        ? window.location.pathname
        : "/"),
  };

  // Copy only declared attributes through; never trust arbitrary keys.
  const spec = EVENT_SPEC_LOOKUP[input.event];
  for (const key of spec.declaredKeys) {
    const value = input[key];
    if (value === undefined || value === null) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      event[key] = value;
    }
  }

  enqueue(event);
}

// ── Deduplication ────────────────────────────────────

// tool_opened fires from a mount effect; React StrictMode (dev) and
// hydration re-runs can double-fire it. Dedupe within a short window
// per (slug, page) without ever suppressing genuine revisits.
const TOOL_OPENED_DEDUPE_MS = 3_000;
const lastToolOpenedAt = new Map<string, number>();

// ── Public typed helpers ─────────────────────────────

/** Convenience, type-safe helpers — the primary tracking API. */
export const analytics = {
  /** A tool page was viewed. Deduplicated within a 3 s window. */
  toolOpened(toolSlug: string) {
    if (typeof window === "undefined") return;
    const key = `${toolSlug}:${window.location.pathname}`;
    const last = lastToolOpenedAt.get(key);
    const now = Date.now();
    if (last !== undefined && now - last < TOOL_OPENED_DEDUPE_MS) return;
    lastToolOpenedAt.set(key, now);
    trackEvent({ event: AnalyticsEvents.TOOL_OPENED, toolSlug });
  },

  /** A utility tool produced an output. */
  toolCompleted(toolSlug: string) {
    trackEvent({ event: AnalyticsEvents.TOOL_COMPLETED, toolSlug });
  },

  /** A calculator produced a result. */
  calculationCompleted(toolSlug: string) {
    trackEvent({ event: AnalyticsEvents.CALCULATION_COMPLETED, toolSlug });
  },

  /** A result was copied; `resultSize` = chars (never content). */
  resultCopied(toolSlug: string, resultSize?: number) {
    trackEvent({
      event: AnalyticsEvents.RESULT_COPIED,
      toolSlug,
      resultSize,
    });
  },

  /** A file was selected/uploaded. Only extension + size are collected. */
  fileUploaded(toolSlug: string, file?: File | { name?: string; size?: number }) {
    trackEvent({
      event: AnalyticsEvents.FILE_UPLOADED,
      toolSlug,
      fileExtension: file?.name
        ? file.name.split(".").pop()?.toLowerCase().slice(0, 16)
        : undefined,
      fileSize: typeof file?.size === "number" ? file.size : undefined,
    });
  },

  /** A file finished processing successfully. */
  fileProcessed(toolSlug: string, durationMs?: number) {
    trackEvent({
      event: AnalyticsEvents.FILE_PROCESSED,
      toolSlug,
      durationMs,
    });
  },

  /** A generated/processed file was downloaded. */
  fileDownloaded(toolSlug: string, fileExtension?: string) {
    trackEvent({
      event: AnalyticsEvents.FILE_DOWNLOADED,
      toolSlug,
      fileExtension: fileExtension ? fileExtension.toLowerCase().slice(0, 16) : undefined,
    });
  },

  /**
   * A search was submitted.
   * Only non-identifying signals are collected — never the raw query.
   */
  toolSearched(options: { queryLength: number; resultCount?: number }) {
    trackEvent({
      event: AnalyticsEvents.TOOL_SEARCHED,
      queryLength: Math.min(Math.max(0, options.queryLength), 500),
      resultCount: options.resultCount,
    });
  },

  /** A search suggestion/result was clicked. */
  searchResultClicked(
    resultType: "tool" | "category" | "query",
    resultSlug: string,
    resultPosition?: number
  ) {
    trackEvent({
      event: AnalyticsEvents.SEARCH_RESULT_CLICKED,
      resultType,
      // Never collect query strings — they may contain user-entered text.
      resultSlug: resultSlug.split("?")[0].slice(0, 200),
      resultPosition: resultPosition ?? -1,
    });
  },

  // ── Ads (registered specs in ./events.ts) ──

  /** An ad slot became visible. Slot id only — never ad content. */
  adShown(placementId: string) {
    trackEvent({
      event: AnalyticsEvents.AD_SHOWN,
      placementId: placementId.slice(0, 100),
    });
  },

  /** An ad or affiliate link was clicked. */
  adClicked(placementId: string) {
    trackEvent({
      event: AnalyticsEvents.AD_CLICKED,
      placementId: placementId.slice(0, 100),
    });
  },
};

/** Generic low-level tracker used by providers/reusable components. */
export function trackGenericEvent(
  event: AnalyticsEventName,
  attributes: Record<string, AnalyticsAttributeValue>,
  toolSlug?: string
): void {
  trackEvent({ event, toolSlug, ...attributes });
}

/**
 * Track a tool page view from a pathname (e.g. "/tools/text-repeater").
 * Used by <PageViewTracker /> for pages that render outside a provider.
 */
export function trackPageView(path?: string): void {
  if (typeof window === "undefined") return;
  const page = path ?? window.location.pathname;
  if (!page.startsWith("/tools/")) return;
  const toolSlug = page.slice("/tools/".length).split(/[/?#]/)[0];
  if (toolSlug) analytics.toolOpened(toolSlug);
}

/** Opt-out helper (re-exported for convenience). */
export { setAnalyticsOptOut as optOut };
