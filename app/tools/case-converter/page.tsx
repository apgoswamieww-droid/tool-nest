import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import CaseConverterClient from "./CaseConverterClient";

const tool = getTool("case-converter")!;

export const metadata = getToolPageMetadata(tool);

export default function CaseConverterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <CaseConverterClient />
    </ToolPageWrapper>
  );
}
