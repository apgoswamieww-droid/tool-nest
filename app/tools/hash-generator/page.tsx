import { getTool } from "@/lib/registry";
import { getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import { PremiumToolPage } from "@/components/tool/PremiumToolPage";
import HashGeneratorClient from "./HashGeneratorClient";

const tool = getTool("hash-generator")!;

export const metadata = getToolPageMetadata(tool);

/**
 * Premium tool (R1). Entitled users get the full generator; everyone
 * else sees the locked PremiumGate — same URL, SEO and analytics intact.
 * Dev preview: PREMIUM_DEV_TIER=premium npm run dev
 */
export default function HashGeneratorPage() {
  return (
    <PremiumToolPage tool={tool}>
      <HashGeneratorClient />
    </PremiumToolPage>
  );
}
