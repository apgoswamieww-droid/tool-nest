import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfTextExtractorClient from "./PdfTextExtractorClient";

const tool = getTool("pdf-text-extractor")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfTextExtractorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfTextExtractorClient />
    </ToolPageWrapper>
  );
}
