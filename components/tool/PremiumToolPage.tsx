import type { ReactNode } from "react";
import type { Tool } from "@/types";
import { resolveSessionEntitlements } from "@/lib/monetization/session-entitlements";
import { ToolPageWrapper } from "./ToolPageWrapper";
import { PremiumGate } from "@/components/monetization/PremiumGate";

interface PremiumToolPageProps {
  tool: Tool;
  /** The full interactive experience — rendered only for entitled users. */
  children: ReactNode;
}

/**
 * Server wrapper for premium tool pages (R1, docs/monetization.md §4.2).
 *
 * Resolves the visitor's entitlements from their session and renders
 * either the real tool or the locked PremiumGate. SEO JSON-LD and the
 * AnalyticsProvider come from <ToolPageWrapper> in both branches, so
 * premium URLs stay crawlable and measurable.
 *
 * Dev preview before checkout exists:
 *   PREMIUM_DEV_TIER=premium npm run dev
 */
export async function PremiumToolPage({ tool, children }: PremiumToolPageProps) {
  const entitlements = await resolveSessionEntitlements();
  const entitled = entitlements.tier !== "free";

  return (
    <ToolPageWrapper tool={tool}>
      {entitled ? children : <PremiumGate toolSlug={tool.slug} />}
    </ToolPageWrapper>
  );
}
