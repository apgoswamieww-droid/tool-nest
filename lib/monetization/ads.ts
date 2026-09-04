// ──────────────────────────────────────────────────────
// ToolNest — House ads (R2, docs/monetization.md §4.1)
//
// Pure, side-effect-free module (server- and client-safe):
//   - AD_PLACEMENTS   — the slot inventory. Every slot declares a fixed
//     pixel height so the <AdSlot> reserves space and never shifts
//     layout (CLS ≈ 0).
//   - HOUSE_CREATIVES — first-party "campaigns": cross-promotions to
//     premium tools and popular free tools. No third-party scripts,
//     no cookies — consistent with the site's privacy stance.
//   - decideAdSlot()  — the single gate: flag (ads.enabled) + network
//     + entitlement (adFree) + context → creative or nothing.
//
// All decisions are deterministic (no randomness), so the server and
// client render identical HTML and hydration never mismatches.
// ──────────────────────────────────────────────────────

import type { ToolTier } from "@/types/tool";

export type AdPlacementId =
  | "tool-below"
  | "category-inline"
  | "home-below-featured"
  | "result-side";

export interface AdPlacementSpec {
  /** Where the slot sits and when it may render. */
  description: string;
  /**
   * Fixed height in px. The <AdSlot> always reserves this space while
   * ads are enabled, so content above/below never jumps.
   */
  heightPx: number;
}

export const AD_PLACEMENTS: Record<AdPlacementId, AdPlacementSpec> = {
  "tool-below": {
    description:
      "Leaderboard below the tool's result area, before related tools — the only slot on tool pages.",
    heightPx: 90,
  },
  "category-inline": {
    description: "Between the tool grid and the following sections on category pages.",
    heightPx: 90,
  },
  "home-below-featured": {
    description: "Between the featured grid and the popular sections on the homepage.",
    heightPx: 90,
  },
  "result-side": {
    description:
      "Wide-viewport slot tool clients render only after a result exists. Not mounted yet — mount when a tool ships an inline result ad.",
    heightPx: 90,
  },
};

export type HouseCreativeId =
  | "premium-json"
  | "premium-hash"
  | "pdf-merger"
  | "browse-tools";

/** Plain, serializable creative — icons are resolved in the component. */
export interface HouseCreative {
  id: HouseCreativeId;
  icon: "braces" | "key" | "merge" | "compass";
  /** Small tag shown when the creative pitches a premium tool. */
  badge?: "Premium";
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}

export const HOUSE_CREATIVES: HouseCreative[] = [
  {
    id: "premium-json",
    icon: "braces",
    badge: "Premium",
    title: "Format JSON like a pro",
    body: "Beautify, minify and validate JSON with precise line/column errors — built for daily work.",
    ctaLabel: "Try JSON Formatter",
    href: "/tools/json-formatter",
  },
  {
    id: "premium-hash",
    icon: "key",
    badge: "Premium",
    title: "Instant MD5 & SHA hashes",
    body: "SHA-1/256/384/512 and MD5 computed live as you type — entirely in your browser.",
    ctaLabel: "Open Hash Generator",
    href: "/tools/hash-generator",
  },
  {
    id: "pdf-merger",
    icon: "merge",
    title: "Merge PDFs — free",
    body: "Combine up to 10 PDFs in your browser. Private, instant, no upload.",
    ctaLabel: "Open PDF Merger",
    href: "/tools/pdf-merger",
  },
  {
    id: "browse-tools",
    icon: "compass",
    title: "50+ free tools",
    body: "Text, PDFs, calculators and developer utilities — fast, free and private.",
    ctaLabel: "Browse all tools",
    href: "/tools",
  },
];

/** Tool slugs that must never be advertised on their own page. */
const CREATIVE_TOOL_SLUG: Partial<Record<HouseCreativeId, string>> = {
  "premium-json": "json-formatter",
  "premium-hash": "hash-generator",
  "pdf-merger": "pdf-merger",
};

export interface AdContext {
  /** Active tool slug when the slot renders on a tool page. */
  toolSlug?: string;
  /** Tier of the active tool (free tools show ads; premium pages don't self-advertise). */
  toolTier?: ToolTier;
}

export interface AdSlotOptions {
  adsEnabled: boolean;
  adFree: boolean;
  network: string;
}

export interface AdSlotDecision {
  placement: AdPlacementId;
  provider: "house";
  creative: HouseCreative;
}

/** House campaigns per placement, in priority order. */
const PLACEMENT_CREATIVES: Record<AdPlacementId, HouseCreativeId[]> = {
  "tool-below": ["premium-json", "pdf-merger", "premium-hash", "browse-tools"],
  "category-inline": ["premium-json", "premium-hash", "browse-tools"],
  "home-below-featured": ["premium-json", "premium-hash", "browse-tools"],
  "result-side": ["pdf-merger", "browse-tools"],
};

/**
 * Decide what — if anything — renders in a slot.
 *
 * Kill switch: `ads.enabled` (default false) gates everything.
 * Entitlement: premium/business/api users (`adFree`) never see ads.
 * Network: only "house" ships in R2 — other providers plug in here.
 */
export function decideAdSlot(
  placement: AdPlacementId,
  context: AdContext,
  options: AdSlotOptions
): AdSlotDecision | null {
  if (!options.adsEnabled) return null;
  if (options.adFree) return null;
  if (options.network !== "house") return null; // no third-party adapters yet

  const ids = PLACEMENT_CREATIVES[placement];
  // Premium tool pages (locked or not) don't carry house ads pitching
  // other premium tools — point those visitors at free tools instead.
  const candidates =
    placement === "tool-below" && context.toolTier === "premium"
      ? ["pdf-merger", "browse-tools"]
      : ids;

  const creative = candidates
    .map((id) => HOUSE_CREATIVES.find((c) => c.id === id))
    .find(
      (c): c is HouseCreative =>
        !!c && CREATIVE_TOOL_SLUG[c.id] !== context.toolSlug
    );

  return creative
    ? { placement, provider: "house", creative }
    : null;
}
