import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import RoasCalculatorClient from "./RoasCalculatorClient";

const tool = getTool("roas-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function RoasCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <RoasCalculatorClient />
    </ToolPageWrapper>
  );
}
