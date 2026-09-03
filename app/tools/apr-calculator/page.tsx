import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import AprCalculatorClient from "./AprCalculatorClient";

const tool = getTool("apr-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function AprCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <AprCalculatorClient />
    </ToolPageWrapper>
  );
}
