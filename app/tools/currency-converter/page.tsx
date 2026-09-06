import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import { fetchRates } from "@/lib/rates/fetch-rates";
import CurrencyConverterClient from "./CurrencyConverterClient";

const tool = getTool("currency-converter")!;

// Re-resolve rates hourly (ISR); the client fetch never blocks this page.
export const revalidate = 3600;

export const metadata = getToolPageMetadata(tool);

export default async function CurrencyConverterPage() {
  // Server-side fetch: visitors' IPs never reach the rates API, and any
  // failure falls back to the baked ECB snapshot inside fetchRates().
  const rateSet = await fetchRates();

  return (
    <ToolPageWrapper tool={tool}>
      <CurrencyConverterClient rateSet={rateSet} />
    </ToolPageWrapper>
  );
}
