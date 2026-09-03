import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import BarcodeGeneratorClient from "./BarcodeGeneratorClient";

const tool = getTool("barcode-generator")!;

export const metadata = getToolPageMetadata(tool);

export default function BarcodeGeneratorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <BarcodeGeneratorClient />
    </ToolPageWrapper>
  );
}
