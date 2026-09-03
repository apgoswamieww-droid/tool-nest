import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import TextRepeaterClient from "./TextRepeaterClient";

const tool = getTool("text-repeater")!;

export const metadata = getToolPageMetadata(tool);

export default function TextRepeaterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <TextRepeaterClient />
    </ToolPageWrapper>
  );
}
