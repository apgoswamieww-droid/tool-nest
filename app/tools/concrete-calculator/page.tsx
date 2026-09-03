import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import ConcreteCalculatorClient from "./ConcreteCalculatorClient";

const tool = getTool("concrete-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function ConcreteCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <ConcreteCalculatorClient />
    </ToolPageWrapper>
  );
}
