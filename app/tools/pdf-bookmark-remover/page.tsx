import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfBookmarkRemoverClient from "./PdfBookmarkRemoverClient";

const tool = getTool("pdf-bookmark-remover")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfBookmarkRemoverPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfBookmarkRemoverClient />
    </ToolPageWrapper>
  );
}
