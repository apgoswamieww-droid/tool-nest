// ──────────────────────────────────────────────────────
// ToolNest — Privacy-Conscious Analytics
// Client-side event tracking with batched delivery
// ──────────────────────────────────────────────────────

// ── Event Type Registry ─────────────────────────────

/**
 * All supported analytics event names.
 * Use this enum for type-safe event tracking.
 */
export const AnalyticsEvents = {
  /** User opened a tool page */
  TOOL_OPENED: "tool_opened",
  /** User completed a tool action (e.g. clicked "Calculate") */
  TOOL_COMPLETED: "tool_completed",
  /** A calculation was successfully performed */
  CALCULATION_COMPLETED: "calculation_completed",
  /** User copied a result to clipboard */
  RESULT_COPIED: "result_copied",
  /** User uploaded a file */
  FILE_UPLOADED: "file_uploaded",
  /** A file was successfully processed */
  FILE_PROCESSED: "file_processed",
  /** User downloaded a result file */
  FILE_DOWNLOADED: "file_downloaded",
  /** User performed a search */
  TOOL_SEARCHED: "tool_searched",
  /** User clicked a search result */
  SEARCH_RESULT_CLICKED: "search_result_clicked",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

// ── Event Payload Types ─────────────────────────────

/** Base event properties common to all events */
interface BaseEvent {
  event: AnalyticsEventName;
  timestamp: number;
  /** Tool slug — present on most events */
  toolSlug?: string;
  /** Page path where event occurred */
  page?: string;
  /** Session ID — auto-generated, anonymous */
  sessionId: string;
}

export interface ToolOpenedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.TOOL_OPENED;
  toolSlug: string;
  /** Traffic source if detectable */
  referrer?: string;
}

export interface ToolCompletedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.TOOL_COMPLETED;
  toolSlug: string;
  /** What action was completed (e.g. "calculate", "generate", "convert") */
  action: string;
}

export interface CalculationCompletedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.CALCULATION_COMPLETED;
  toolSlug: string;
}

export interface ResultCopiedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.RESULT_COPIED;
  toolSlug: string;
  /** Approximate result size in characters (not content) */
  resultSize?: number;
}

export interface FileUploadedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.FILE_UPLOADED;
  toolSlug: string;
  /** File extension (e.g. ".pdf", ".csv") — not the filename */
  fileExtension?: string;
  /** Approximate file size in bytes */
  fileSize?: number;
}

export interface FileProcessedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.FILE_PROCESSED;
  toolSlug: string;
  /** Processing duration in milliseconds */
  durationMs?: number;
}

export interface FileDownloadedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.FILE_DOWNLOADED;
  toolSlug: string;
  /** File extension of downloaded file */
  fileExtension?: string;
}

export interface ToolSearchedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.TOOL_SEARCHED;
  /** Number of results returned */
  resultCount?: number;
}

export interface SearchResultClickedEvent extends BaseEvent {
  event: typeof AnalyticsEvents.SEARCH_RESULT_CLICKED;
  /** What was clicked: "tool", "category", or "query" */
  resultType?: string;
  /** Slug of the clicked result */
  resultSlug?: string;
  /** Position of the result (0-indexed) */
  resultPosition?: number;
}

/**
 * Discriminated union of all analytics events.
 * Use this for type-safe event handling.
 */
export type AnalyticsEvent =
  | ToolOpenedEvent
  | ToolCompletedEvent
  | CalculationCompletedEvent
  | ResultCopiedEvent
  | FileUploadedEvent
  | FileProcessedEvent
  | FileDownloadedEvent
  | ToolSearchedEvent
  | SearchResultClickedEvent;

// ── Session Management ──────────────────────────────

const SESSION_KEY = "tn_sid";
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Get or create an anonymous session ID.
 * Stored in sessionStorage, expires after 30 minutes of inactivity.
 * No personal information is collected.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as { id: string; lastActive: number };
      if (Date.now() - parsed.lastActive < SESSION_TTL_MS) {
        // Refresh TTL
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({ id: parsed.id, lastActive: Date.now() })
        );
        return parsed.id;
      }
    }
  } catch {
    // Ignore parse errors
  }

  // Generate new session ID (anonymous, non-PII)
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id, lastActive: Date.now() })
    );
  } catch {
    // Storage full or unavailable
  }
  return id;
}

// ── Batch Queue ─────────────────────────────────────

const FLUSH_INTERVAL_MS = 5_000; // Flush every 5 seconds
const MAX_BATCH_SIZE = 20;
const STORAGE_KEY = "tn_ev";

let eventQueue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * Add an event to the queue.
 * Events are batched and sent periodically for performance.
 */
function enqueue(event: AnalyticsEvent): void {
  eventQueue.push(event);

  // Flush immediately if batch is full
  if (eventQueue.length >= MAX_BATCH_SIZE) {
    flush();
    return;
  }

  // Start flush timer if not running
  if (!flushTimer) {
    flushTimer = setInterval(flush, FLUSH_INTERVAL_MS);
  }
}

/**
 * Flush queued events to the analytics endpoint.
 * Uses sendBeacon for reliable delivery, falls back to fetch.
 */
function flush(): void {
  if (eventQueue.length === 0) return;

  const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
  const payload = JSON.stringify({ events: batch });

  // Try sendBeacon first (survives page unload)
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    const sent = navigator.sendBeacon("/api/analytics", blob);
    if (sent) return;
  }

  // Fallback: fetch (fire-and-forget)
  if (typeof fetch !== "undefined") {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently fail — analytics should never break the app
    });
  }

  // Stop timer if queue is empty
  if (eventQueue.length === 0 && flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("beforeunload", flush);
}

// ── Public Tracking API ─────────────────────────────

export interface TrackEventOptions {
  /** Override the auto-generated session ID */
  sessionId?: string;
  /** Override the timestamp */
  timestamp?: number;
}

/**
 * Track a single analytics event.
 *
 * @example
 * ```ts
 * trackEvent({
 *   event: AnalyticsEvents.TOOL_OPENED,
 *   toolSlug: "brick-calculator",
 * });
 * ```
 */
export function trackEvent<T extends AnalyticsEvent>(
  eventData: Omit<T, "timestamp" | "sessionId"> &
    Partial<Pick<T, "timestamp" | "sessionId">>
): void {
  if (typeof window === "undefined") return;

  const event: T = {
    ...eventData,
    timestamp: eventData.timestamp ?? Date.now(),
    sessionId: eventData.sessionId ?? getSessionId(),
    page: eventData.page ?? window.location.pathname,
  } as T;

  enqueue(event);
}

/**
 * Convenience helpers for each event type.
 * Use these for type-safe, minimal-boilerplate tracking.
 */
export const analytics = {
  /** Track when a user opens a tool page */
  toolOpened(toolSlug: string, referrer?: string) {
    trackEvent<ToolOpenedEvent>({
      event: AnalyticsEvents.TOOL_OPENED,
      toolSlug,
      referrer: referrer ?? (typeof document !== "undefined" ? document.referrer : undefined),
    });
  },

  /** Track when a user completes a tool action */
  toolCompleted(toolSlug: string, action: string) {
    trackEvent<ToolCompletedEvent>({
      event: AnalyticsEvents.TOOL_COMPLETED,
      toolSlug,
      action,
    });
  },

  /** Track when a calculation is performed */
  calculationCompleted(toolSlug: string) {
    trackEvent<CalculationCompletedEvent>({
      event: AnalyticsEvents.CALCULATION_COMPLETED,
      toolSlug,
    });
  },

  /** Track when a result is copied to clipboard */
  resultCopied(toolSlug: string, resultSize?: number) {
    trackEvent<ResultCopiedEvent>({
      event: AnalyticsEvents.RESULT_COPIED,
      toolSlug,
      resultSize,
    });
  },

  /** Track when a file is uploaded */
  fileUploaded(toolSlug: string, file?: File) {
    trackEvent<FileUploadedEvent>({
      event: AnalyticsEvents.FILE_UPLOADED,
      toolSlug,
      fileExtension: file?.name ? file.name.split(".").pop()?.toLowerCase() : undefined,
      fileSize: file?.size,
    });
  },

  /** Track when a file finishes processing */
  fileProcessed(toolSlug: string, durationMs?: number) {
    trackEvent<FileProcessedEvent>({
      event: AnalyticsEvents.FILE_PROCESSED,
      toolSlug,
      durationMs,
    });
  },

  /** Track when a result file is downloaded */
  fileDownloaded(toolSlug: string, fileExtension?: string) {
    trackEvent<FileDownloadedEvent>({
      event: AnalyticsEvents.FILE_DOWNLOADED,
      toolSlug,
      fileExtension,
    });
  },

  /** Track when a user performs a search */
  toolSearched(query: string, resultCount?: number) {
    trackEvent<ToolSearchedEvent>({
      event: AnalyticsEvents.TOOL_SEARCHED,
      resultCount,
    });
  },

  /** Track when a user clicks a search result */
  searchResultClicked(resultType: string, resultSlug: string, resultPosition?: number) {
    trackEvent<SearchResultClickedEvent>({
      event: AnalyticsEvents.SEARCH_RESULT_CLICKED,
      resultType,
      resultSlug,
      resultPosition,
    });
  },
};

// ── Page View Tracking ──────────────────────────────

/**
 * Track a page view.
 * Call this from useEffect in client components.
 */
export function trackPageView(path: string): void {
  if (typeof window === "undefined") return;

  // Only track tool pages
  if (!path.startsWith("/tools/")) return;

  const toolSlug = path.replace("/tools/", "").split("?")[0].split("#")[0];
  if (toolSlug) {
    analytics.toolOpened(toolSlug);
  }
}
