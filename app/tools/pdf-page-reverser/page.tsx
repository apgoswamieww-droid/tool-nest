import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfPageReverserClient from "./PdfPageReverserClient";

const tool = getTool("pdf-page-reverser")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfPageReverserPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfPageReverserClient />
    </ToolPageWrapper>
  );
}
