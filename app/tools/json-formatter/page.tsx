import { getTool } from "@/lib/registry";
import { getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import { PremiumToolPage } from "@/components/tool/PremiumToolPage";
import JsonFormatterClient from "./JsonFormatterClient";

const tool = getTool("json-formatter")!;

export const metadata = getToolPageMetadata(tool);

/**
 * Premium tool (R1). Entitled users get the full formatter; everyone
 * else sees the locked PremiumGate — same URL, SEO and analytics intact.
 * Dev preview: PREMIUM_DEV_TIER=premium npm run dev
 */
export default function JsonFormatterPage() {
  return (
    <PremiumToolPage tool={tool}>
      <JsonFormatterClient />
    </PremiumToolPage>
  );
}
