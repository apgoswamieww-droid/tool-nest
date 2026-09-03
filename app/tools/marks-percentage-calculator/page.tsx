import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import MarksPercentageClient from "./MarksPercentageClient";

const tool = getTool("marks-percentage-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function MarksPercentagePage() {
  return (
    <ToolPageWrapper tool={tool}>
      <MarksPercentageClient />
    </ToolPageWrapper>
  );
}
