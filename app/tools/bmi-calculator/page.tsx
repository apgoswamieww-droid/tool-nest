import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import BmiCalculatorClient from "./BmiCalculatorClient";

const tool = getTool("bmi-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function BmiCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <BmiCalculatorClient />
    </ToolPageWrapper>
  );
}
