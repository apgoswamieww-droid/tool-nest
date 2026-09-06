import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import EmiCalculatorClient from "./EmiCalculatorClient";

const tool = getTool("emi-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function EmiCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <EmiCalculatorClient />
    </ToolPageWrapper>
  );
}
