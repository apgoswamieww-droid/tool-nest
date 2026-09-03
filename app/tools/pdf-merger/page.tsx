import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfMergerClient from "./PdfMergerClient";

const tool = getTool("pdf-merger")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfMergerPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfMergerClient />
    </ToolPageWrapper>
  );
}
