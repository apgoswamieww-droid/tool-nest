import type { Metadata } from "next";
import { AnalyticsDashboardClient } from "./AnalyticsDashboardClient";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
  robots: { index: false, follow: false },
};

/**
 * Internal analytics dashboard. Renders the aggregates exposed by
 * GET /api/analytics/summary (token-protected in production).
 * Deliberately not linked from the public navigation.
 */
export default function AnalyticsPage() {
  return <AnalyticsDashboardClient />;
}