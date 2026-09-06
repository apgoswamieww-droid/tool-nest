import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import TimeZoneConverterClient from "./TimeZoneConverterClient";

const tool = getTool("time-zone-converter")!;

export const metadata = getToolPageMetadata(tool);

export default function TimeZoneConverterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <TimeZoneConverterClient />
    </ToolPageWrapper>
  );
}
