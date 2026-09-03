import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import PaintCostCalculatorClient from "./PaintCostCalculatorClient";

const tool = getTool("paint-cost-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function PaintCostCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <PaintCostCalculatorClient />
    </ToolPageWrapper>
  );
}
