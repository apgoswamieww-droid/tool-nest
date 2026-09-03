import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import WorkingCapitalClient from "./WorkingCapitalClient";

const tool = getTool("working-capital-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function WorkingCapitalPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <WorkingCapitalClient />
    </ToolPageWrapper>
  );
}
