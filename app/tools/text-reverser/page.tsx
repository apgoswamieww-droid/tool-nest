import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import TextReverserClient from "./TextReverserClient";

const tool = getTool("text-reverser")!;

export const metadata = getToolPageMetadata(tool);

export default function TextReverserPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <TextReverserClient />
    </ToolPageWrapper>
  );
}
