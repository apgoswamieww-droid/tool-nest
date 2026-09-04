// ──────────────────────────────────────────────────────
// ToolNest — Analytics Event Registry (single source of truth)
//
// This module is intentionally side-effect free and framework
// agnostic so it can be imported from:
//   - the client tracker  (lib/analytics/client.ts)
//   - the ingest API      (app/api/analytics/route.ts)
//   - dashboard tooling   (summary endpoints, docs, BI export)
//
// Naming convention:
//   - Event names  : snake_case verbs with a noun, e.g. `result_copied`
//   - Attributes   : lowerCamelCase, kebab-free, e.g. `fileExtension`
//   - Attributes are ALLOWLISTED per event. Anything the client
//     sends that is not listed here is dropped at the edge.
// ──────────────────────────────────────────────────────

/** Supported analytics event names (dictionary form). */
export const AnalyticsEvents = {
  /** A tool page was opened (page view of /tools/<slug>). */
  TOOL_OPENED: "tool_opened",
  /** A utility tool produced an output result (text/generator/formatter tools). */
  TOOL_COMPLETED: "tool_completed",
  /** A calculator produced a numeric result. */
  CALCULATION_COMPLETED: "calculation_completed",
  /** The user copied a result to the clipboard. */
  RESULT_COPIED: "result_copied",
  /** The user selected/uploaded a file for processing. */
  FILE_UPLOADED: "file_uploaded",
  /** A file finished processing successfully. */
  FILE_PROCESSED: "file_processed",
  /** The user downloaded a generated/processed file. */
  FILE_DOWNLOADED: "file_downloaded",
  /** The user performed a search. */
  TOOL_SEARCHED: "tool_searched",
  /** The user clicked a search suggestion/result. */
  SEARCH_RESULT_CLICKED: "search_result_clicked",
  // ── Monetization (see docs/monetization.md §3.4) ──
  /** An ad slot became visible. */
  AD_SHOWN: "ad_shown",
  /** An ad or affiliate link was clicked. */
  AD_CLICKED: "ad_clicked",
  /** A contextual upgrade prompt was shown. */
  UPSELL_VIEWED: "upsell_viewed",
  /** A contextual upgrade prompt was dismissed. */
  UPSELL_DISMISSED: "upsell_dismissed",
  /** The user reached the billing provider checkout. */
  CHECKOUT_STARTED: "checkout_started",
  /** A webhook-confirmed subscription/entitlement change. */
  SUBSCRIPTION_ACTIVATED: "subscription_activated",
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

/** Value types allowed as event attributes on the wire. */
export type AnalyticsAttributeValue = string | number | boolean;

/** Envelope limits applied server-side (privacy + sanity bounds). */
export const ANALYTICS_ENVELOPE = {
  /** Anonymous session id (random, non-PII, tab-scoped). */
  MAX_SESSION_ID_LENGTH: 64,
  /** Page is always the pathname only — never the full URL or query string. */
  MAX_PAGE_LENGTH: 200,
  /** Client timestamps further than 7 days from the server clock are replaced. */
  MAX_TIMESTAMP_SKEW_MS: 7 * 24 * 60 * 60 * 1000,
  /** Default cap for free-form string attributes. */
  DEFAULT_MAX_STRING_LENGTH: 200,
} as const;

export interface AttributeSpec {
  type: "string" | "number" | "boolean";
  /** Strings: max length (default 200). */
  maxLength?: number;
  /** Strings: only allow these exact values. */
  enum?: readonly string[];
  /** Numbers: inclusive bounds. */
  min?: number;
  max?: number;
}

export interface AnalyticsEventSpec {
  /** Human readable purpose of the event. */
  description: string;
  /**
   * Whitelist of attributes this event may carry.
   * `toolSlug` is present on tool-scoped events; global events
   * (search) intentionally omit it so they can fire anywhere.
   */
  attributes: Record<string, AttributeSpec>;
}

/**
 * Every event the product may emit, with its allowed attributes.
 * To add an event: add a name to `AnalyticsEvents`, add its spec here,
 * add a typed helper in lib/analytics/client.ts, and document it in
 * docs/analytics.md. The ingest API picks the change up automatically.
 */
export const ANALYTICS_EVENT_SPECS: Record<
  AnalyticsEventName,
  AnalyticsEventSpec
> = {
  tool_opened: {
    description: "A tool page was viewed.",
    attributes: { toolSlug: { type: "string", maxLength: 100 } },
  },
  tool_completed: {
    description: "A utility tool produced an output result.",
    attributes: { toolSlug: { type: "string", maxLength: 100 } },
  },
  calculation_completed: {
    description: "A calculator produced a numeric result.",
    attributes: { toolSlug: { type: "string", maxLength: 100 } },
  },
  result_copied: {
    description: "A result was copied to the clipboard.",
    attributes: {
      toolSlug: { type: "string", maxLength: 100 },
      // Approximate result size in characters — not the content itself.
      resultSize: { type: "number", min: 0, max: 100_000_000 },
    },
  },
  file_uploaded: {
    description: "The user selected a file for processing.",
    attributes: {
      toolSlug: { type: "string", maxLength: 100 },
      // Extension only — never the file name.
      fileExtension: { type: "string", maxLength: 16 },
      fileSize: { type: "number", min: 0, max: 100_000_000_000 },
    },
  },
  file_processed: {
    description: "A file finished processing successfully.",
    attributes: {
      toolSlug: { type: "string", maxLength: 100 },
      durationMs: { type: "number", min: 0, max: 86_400_000 },
    },
  },
  file_downloaded: {
    description: "A generated/processed file was downloaded.",
    attributes: {
      toolSlug: { type: "string", maxLength: 100 },
      fileExtension: { type: "string", maxLength: 16 },
    },
  },
  tool_searched: {
    description: "A search was submitted (no raw query text is collected).",
    attributes: {
      // Length of the query string — a proxy for specificity without PII.
      queryLength: { type: "number", min: 0, max: 500 },
      resultCount: { type: "number", min: 0, max: 500 },
    },
  },
  search_result_clicked: {
    description: "A search suggestion/result was clicked.",
    attributes: {
      resultType: {
        type: "string",
        enum: ["tool", "category", "query"] as const,
      },
      resultSlug: { type: "string", maxLength: 200 },
      resultPosition: { type: "number", min: -1, max: 100 },
    },
  },
  ad_shown: {
    description: "An ad slot became visible. Slot id only — never content.",
    attributes: { placementId: { type: "string", maxLength: 100 } },
  },
  ad_clicked: {
    description: "An ad or affiliate link was clicked.",
    attributes: { placementId: { type: "string", maxLength: 100 } },
  },
  upsell_viewed: {
    description: "A contextual, dismissible upgrade prompt was shown.",
    attributes: {
      surface: {
        type: "string",
        enum: ["result", "related", "limit"] as const,
      },
    },
  },
  upsell_dismissed: {
    description: "An upgrade prompt was dismissed without action.",
    attributes: {
      surface: {
        type: "string",
        enum: ["result", "related", "limit"] as const,
      },
    },
  },
  checkout_started: {
    description: "The user reached the billing provider checkout.",
    attributes: { plan: { type: "string", maxLength: 50 } },
  },
  subscription_activated: {
    description: "A confirmed entitlement change (webhook).",
    attributes: { plan: { type: "string", maxLength: 50 } },
  },
};

/** True when a raw event name matches the registry. */
export function isAnalyticsEventName(
  value: unknown
): value is AnalyticsEventName {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(ANALYTICS_EVENT_SPECS, value)
  );
}

// ── Wire format (post-sanitization) ──────────────────

/** A validated event as stored/ingested server-side. */
export interface SanitizedAnalyticsEvent {
  event: AnalyticsEventName;
  /** Unix epoch ms. Bounded to [now - skew, now + skew]. */
  timestamp: number;
  /** Anonymous, tab-scoped session id. Empty string when unavailable. */
  sessionId: string;
  /** Pathname only (e.g. "/tools/text-repeater"). Never includes query strings. */
  page: string;
  /** Convenience copy of attributes.toolSlug when present. */
  toolSlug?: string;
  /** Allowlisted attributes only — everything else has been dropped. */
  attributes: Record<string, AnalyticsAttributeValue>;
}

function coerceAttribute(
  value: unknown,
  spec: AttributeSpec
): AnalyticsAttributeValue | undefined {
  switch (spec.type) {
    case "string": {
      if (typeof value !== "string") return undefined;
      if (spec.enum && !spec.enum.includes(value)) return undefined;
      const max = spec.maxLength ?? ANALYTICS_ENVELOPE.DEFAULT_MAX_STRING_LENGTH;
      return value.length > max ? value.slice(0, max) : value;
    }
    case "number": {
      if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
      let v = value;
      if (spec.min !== undefined) v = Math.max(v, spec.min);
      if (spec.max !== undefined) v = Math.min(v, spec.max);
      return v;
    }
    case "boolean":
      return typeof value === "boolean" ? value : undefined;
  }
}

/**
 * Validate + sanitize one raw inbound event.
 *
 * Privacy contract: this drops every field that is not part of the
 * shared envelope or the event's declared attribute allowlist. The
 * server never trusts the client's shape — it only keeps what the
 * registry says the event may carry.
 *
 * @returns a canonical event, or null when the payload is unusable.
 */
export function sanitizeAnalyticsEvent(raw: unknown): SanitizedAnalyticsEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;

  if (!isAnalyticsEventName(r.event)) return null;

  const spec = ANALYTICS_EVENT_SPECS[r.event];

  // Envelope
  let timestamp =
    typeof r.timestamp === "number" && Number.isFinite(r.timestamp)
      ? r.timestamp
      : Date.now();
  const now = Date.now();
  if (Math.abs(now - timestamp) > ANALYTICS_ENVELOPE.MAX_TIMESTAMP_SKEW_MS) {
    timestamp = now;
  }

  const sessionId =
    typeof r.sessionId === "string"
      ? r.sessionId.slice(0, ANALYTICS_ENVELOPE.MAX_SESSION_ID_LENGTH)
      : "";
  const page =
    typeof r.page === "string"
      ? r.page.slice(0, ANALYTICS_ENVELOPE.MAX_PAGE_LENGTH)
      : "/";

  const out: SanitizedAnalyticsEvent = {
    event: r.event,
    timestamp,
    sessionId,
    page,
    attributes: {},
  };

  // Attributes — allowlist only.
  for (const [key, attrSpec] of Object.entries(spec.attributes)) {
    const value = r[key];
    if (value === undefined || value === null) continue;
    const coerced = coerceAttribute(value, attrSpec);
    if (coerced !== undefined) out.attributes[key] = coerced;
  }

  const toolSlug = out.attributes.toolSlug;
  if (typeof toolSlug === "string") {
    out.toolSlug = toolSlug;
    delete out.attributes.toolSlug;
  }

  return out;
}

// ── Funnel definitions (dashboard-ready) ─────────────

export interface AnalyticsFunnelStep {
  label: string;
  /**
   * One or more events that satisfy this step.
   * E.g. utilities emit `tool_completed`, calculators emit
   * `calculation_completed` — both advance the "result produced" step.
   */
  events: AnalyticsEventName[];
  description?: string;
}

export interface AnalyticsFunnel {
  id: string;
  name: string;
  description?: string;
  steps: AnalyticsFunnelStep[];
}

/** Canonical funnels the dashboard can render without extra config. */
export const ANALYTICS_FUNNELS: AnalyticsFunnel[] = [
  {
    id: "tool-usage",
    name: "Tool usage funnel",
    description:
      "From opening a tool to producing a result to an outcome (copy or download).",
    steps: [
      { label: "Tool opened", events: ["tool_opened"] },
      {
        label: "Result produced",
        events: ["tool_completed", "calculation_completed"],
        description:
          "`tool_completed` (utilities) or `calculation_completed` (calculators).",
      },
      {
        label: "Outcome",
        events: ["result_copied", "file_downloaded"],
        description: "The user did something useful with the result.",
      },
    ],
  },
  {
    id: "search",
    name: "Search funnel",
    description: "From typing a search to landing on a tool page.",
    steps: [
      { label: "Search", events: ["tool_searched"] },
      { label: "Result clicked", events: ["search_result_clicked"] },
      { label: "Tool opened", events: ["tool_opened"] },
    ],
  },
  {
    id: "file-processing",
    name: "File processing funnel",
    description: "Upload → processed → download for file-based tools (PDF etc.).",
    steps: [
      { label: "File uploaded", events: ["file_uploaded"] },
      { label: "File processed", events: ["file_processed"] },
      { label: "File downloaded", events: ["file_downloaded"] },
    ],
  },
  {
    id: "monetization",
    name: "Monetization funnel",
    description:
      "From a contextual upgrade prompt to a confirmed subscription.",
    steps: [
      { label: "Upsell viewed", events: ["upsell_viewed"] },
      { label: "Checkout started", events: ["checkout_started"] },
      { label: "Subscription activated", events: ["subscription_activated"] },
    ],
  },
];

/** All valid event names as an array (useful for docs/validation). */
export const ANALYTICS_EVENT_NAMES: AnalyticsEventName[] = Object.keys(
  ANALYTICS_EVENT_SPECS
) as AnalyticsEventName[];
