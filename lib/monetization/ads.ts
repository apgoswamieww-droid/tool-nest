// ──────────────────────────────────────────────────────
// ToolNest — House ads (R2, docs/monetization.md §4.1)
//
// Pure, side-effect-free module (server- and client-safe):
//   - AD_PLACEMENTS   — the slot inventory. Every slot declares a fixed
//     pixel height so the <AdSlot> reserves space and never shifts
//     layout (CLS ≈ 0).
//   - HOUSE_CREATIVES — first-party "campaigns": cross-promotions
//     between ToolNest tools. No third-party scripts, no cookies —
//     consistent with the site's privacy stance.
//   - decideAdSlot()  — the single gate: flag (ads.enabled) + network
//     + context → creative or nothing.
//
// All decisions are deterministic (no randomness), so the server and
// client render identical HTML and hydration never mismatches.
// ──────────────────────────────────────────────────────

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

/**
 * Creative ids double as the promoted tool's slug where the creative
 * pitches a specific tool ("browse-tools" is generic), so a slot on a
 * tool's own page can exclude that tool's creative automatically.
 */
export type HouseCreativeId =
  | "json-formatter"
  | "hash-generator"
  | "pdf-merger"
  | "browse-tools";

/** Plain, serializable creative — icons are resolved in the component. */
export interface HouseCreative {
  id: HouseCreativeId;
  icon: "braces" | "key" | "merge" | "compass";
  title: string;
  body: string;
  ctaLabel: string;
  href: string;
}

export const HOUSE_CREATIVES: HouseCreative[] = [
  {
    id: "json-formatter",
    icon: "braces",
    title: "Format JSON like a pro",
    body: "Beautify, minify and validate JSON with precise line/column errors — built for daily work.",
    ctaLabel: "Try JSON Formatter",
    href: "/tools/json-formatter",
  },
  {
    id: "hash-generator",
    icon: "key",
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

export interface AdContext {
  /** Active tool slug when the slot renders on a tool page. */
  toolSlug?: string;
}

export interface AdSlotOptions {
  adsEnabled: boolean;
  network: string;
}

export interface AdSlotDecision {
  placement: AdPlacementId;
  provider: "house";
  creative: HouseCreative;
}

/** House campaigns per placement, in priority order. */
const PLACEMENT_CREATIVES: Record<AdPlacementId, HouseCreativeId[]> = {
  "tool-below": [
    "json-formatter",
    "pdf-merger",
    "hash-generator",
    "browse-tools",
  ],
  "category-inline": [
    "json-formatter",
    "hash-generator",
    "browse-tools",
  ],
  "home-below-featured": [
    "json-formatter",
    "hash-generator",
    "browse-tools",
  ],
  "result-side": ["pdf-merger", "browse-tools"],
};

/**
 * Decide what — if anything — renders in a slot.
 *
 * Kill switch: `ads.enabled` (default false) gates everything.
 * Network: only "house" ships in R2 — other providers plug in here.
 * Context: a tool's own page never advertises that tool back to the
 * visitor (exclusion by slug, so it also holds for free tools).
 */
export function decideAdSlot(
  placement: AdPlacementId,
  context: AdContext,
  options: AdSlotOptions
): AdSlotDecision | null {
  if (!options.adsEnabled) return null;
  if (options.network !== "house") return null; // no third-party adapters yet

  const creative = PLACEMENT_CREATIVES[placement]
    .map((id) => HOUSE_CREATIVES.find((c) => c.id === id))
    .find(
      (c): c is HouseCreative => !!c && c.id !== context.toolSlug
    );

  return creative
    ? { placement, provider: "house", creative }
    : null;
}
