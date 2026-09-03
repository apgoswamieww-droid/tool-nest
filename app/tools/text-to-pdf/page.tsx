import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import TextToPdfClient from "./TextToPdfClient";

const tool = getTool("text-to-pdf")!;

export const metadata = getToolPageMetadata(tool);

export default function TextToPdfPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <TextToPdfClient />
    </ToolPageWrapper>
  );
}
