"use client";

// ──────────────────────────────────────────────────────
// ToolNest — AdSlot (R2 house ads)
//
// One component for every placement. Behavior:
//   - Renders NOTHING when ads are disabled (flag `ads.enabled`,
//     default false — the kill switch) or the network isn't the house
//     adapter.
//   - Reserves its full slot height the moment ads are enabled, so
//     content never shifts (no CLS).
//   - A tool's own page never advertises that tool back to the visitor
//     (decided in lib/monetization/ads.ts by slug).
//   - Fires `ad_shown` the first time it scrolls into view and
//     `ad_clicked` on activation. Both respect the analytics opt-out /
//     DNT/GPC machinery automatically.
//
// House ads are first-party links — no third-party scripts, no cookies.
// ──────────────────────────────────────────────────────

import * as React from "react";
import Link from "next/link";
import { Braces, Compass, KeyRound, Merge, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  AD_PLACEMENTS,
  decideAdSlot,
  type AdPlacementId,
  type HouseCreative,
} from "@/lib/monetization/ads";
import { analytics } from "@/lib/analytics";
import { useMonetization } from "./MonetizationProvider";
import { useToolSlug } from "@/components/tool/AnalyticsProvider";
import { cn } from "@/lib/utils";

const CREATIVE_ICONS: Record<HouseCreative["icon"], LucideIcon> = {
  braces: Braces,
  key: KeyRound,
  merge: Merge,
  compass: Compass,
};

interface AdSlotProps {
  placement: AdPlacementId;
  className?: string;
}

export function AdSlot({ placement, className }: AdSlotProps) {
  const { adsEnabled, adsNetwork } = useMonetization();
  const toolSlug = useToolSlug();
  const viewRef = React.useRef<HTMLDivElement | null>(null);
  const shownRef = React.useRef(false);

  // Resolve which creative shows. Deterministic — identical HTML on the
  // server and client, so hydration never mismatches.
  const decision = React.useMemo(
    () =>
      decideAdSlot(
        placement,
        { toolSlug: toolSlug || undefined },
        { adsEnabled, network: adsNetwork }
      ),
    [placement, toolSlug, adsEnabled, adsNetwork]
  );

  // ad_shown fires once when the slot first becomes visible.
  React.useEffect(() => {
    const node = viewRef.current;
    if (!node || shownRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !shownRef.current) {
          shownRef.current = true;
          analytics.adShown(placement);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [placement]);

  if (!decision) return null;

  const { creative } = decision;
  const Icon = CREATIVE_ICONS[creative.icon];
  const heightPx = AD_PLACEMENTS[placement].heightPx;

  return (
    <div
      ref={viewRef}
      data-ad-slot={placement}
      className={cn("relative my-6", className)}
      style={{ height: heightPx }}
    >
      <Link
        href={creative.href}
        onClick={() => analytics.adClicked(placement)}
        className="group flex h-full w-full items-center gap-3 rounded-lg border border-dashed border-muted-foreground/25 bg-muted/25 px-4 py-2.5 transition-colors hover:border-primary/40 hover:bg-muted/40"
        aria-label={`${creative.title} — ${creative.body}`}
      >
        {/* Icon */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>

        {/* Copy */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{creative.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {creative.body}
          </p>
        </div>

        {/* CTA */}
        <span className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline underline-offset-4">
          {creative.ctaLabel}
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>

        {/* Disclosure — sits in the reserved top margin, never on content */}
        <span className="pointer-events-none absolute right-2 top-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">
          Ad
        </span>
      </Link>
    </div>
  );
}
