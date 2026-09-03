import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import BrickCalculatorClient from "./BrickCalculatorClient";

const tool = getTool("brick-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function BrickCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <BrickCalculatorClient />
    </ToolPageWrapper>
  );
}
