import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import ClvCalculatorClient from "./ClvCalculatorClient";

const tool = getTool("clv-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function ClvCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <ClvCalculatorClient />
    </ToolPageWrapper>
  );
}
