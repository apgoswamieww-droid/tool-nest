import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import FireCalculatorClient from "./FireCalculatorClient";

const tool = getTool("fire-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function FireCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <FireCalculatorClient />
    </ToolPageWrapper>
  );
}
