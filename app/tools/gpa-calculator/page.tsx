import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import GpaCalculatorClient from "./GpaCalculatorClient";

const tool = getTool("gpa-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function GpaCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <GpaCalculatorClient />
    </ToolPageWrapper>
  );
}
