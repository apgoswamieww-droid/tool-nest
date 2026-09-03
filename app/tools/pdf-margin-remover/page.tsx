import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfMarginRemoverClient from "./PdfMarginRemoverClient";

const tool = getTool("pdf-margin-remover")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfMarginRemoverPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfMarginRemoverClient />
    </ToolPageWrapper>
  );
}
