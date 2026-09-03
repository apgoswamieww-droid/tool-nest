import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfInfoViewerClient from "./PdfInfoViewerClient";

const tool = getTool("pdf-info-viewer")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfInfoViewerPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfInfoViewerClient />
    </ToolPageWrapper>
  );
}
