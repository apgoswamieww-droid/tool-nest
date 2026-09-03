import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PdfQrCodeClient from "./PdfQrCodeClient";

const tool = getTool("pdf-qr-code")!;

export const metadata = getToolPageMetadata(tool);

export default function PdfQrCodePage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PdfQrCodeClient />
    </ToolPageWrapper>
  );
}
