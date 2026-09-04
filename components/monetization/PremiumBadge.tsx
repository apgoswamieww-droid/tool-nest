"use client";

import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  /** Compact variant for tool cards; default is the standard pill. */
  compact?: boolean;
  className?: string;
}

/**
 * "Premium" merchandising pill. Shown on premium tool cards and gate
 * surfaces so premium tools stay visible in listings (SEO + honest
 * merchandising) instead of being hidden or 404ing.
 */
export function PremiumBadge({ compact, className }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 font-semibold text-amber-600 dark:text-amber-400",
        compact ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-[11px]",
        className
      )}
    >
      <Crown className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />
      Premium
    </span>
  );
}
