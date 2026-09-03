import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfMetadataRemoverClient from "./PdfMetadataRemoverClient";

const tool = getTool("pdf-metadata-remover")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfMetadataRemoverPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfMetadataRemoverClient />
    </ToolPageWrapper>
  );
}
