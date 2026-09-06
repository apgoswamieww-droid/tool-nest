import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import CompoundInterestClient from "./CompoundInterestClient";

const tool = getTool("compound-interest")!;

export const metadata = getToolPageMetadata(tool);

export default function CompoundInterestPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <CompoundInterestClient />
    </ToolPageWrapper>
  );
}
