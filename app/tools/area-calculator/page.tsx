import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import AreaCalculatorClient from "./AreaCalculatorClient";

const tool = getTool("area-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function AreaCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <AreaCalculatorClient />
    </ToolPageWrapper>
  );
}
