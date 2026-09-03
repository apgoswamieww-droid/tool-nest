import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import ForexMarginClient from "./ForexMarginClient";

const tool = getTool("forex-margin-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function ForexMarginPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <ForexMarginClient />
    </ToolPageWrapper>
  );
}
