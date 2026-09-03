import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import FlooringCalculatorClient from "./FlooringCalculatorClient";

const tool = getTool("flooring-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function FlooringCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <FlooringCalculatorClient />
    </ToolPageWrapper>
  );
}
