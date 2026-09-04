// ──────────────────────────────────────────────────────
// ToolNest — Analytics public API
//
// Barrel that preserves the original `@/lib/analytics` import path:
//
//   import { analytics, AnalyticsEvents, type AnalyticsEventName }
//     from "@/lib/analytics";
//
// Layering:
//   events.ts — shared registry (names, attribute allowlists, funnels)
//   client.ts — browser tracker (session, batching, opt-out)
//   server.ts — storage + dashboard summaries (route handlers only)
// ──────────────────────────────────────────────────────

export * from "./events";
export * from "./client";
