import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import IrrigationCalculatorClient from "./IrrigationCalculatorClient";

const tool = getTool("irrigation-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function IrrigationCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <IrrigationCalculatorClient />
    </ToolPageWrapper>
  );
}
