import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import CropYieldCalculatorClient from "./CropYieldCalculatorClient";

const tool = getTool("crop-yield-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function CropYieldCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <CropYieldCalculatorClient />
    </ToolPageWrapper>
  );
}
