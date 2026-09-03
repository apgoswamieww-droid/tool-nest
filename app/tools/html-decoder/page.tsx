import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import HtmlDecoderClient from "./HtmlDecoderClient";

const tool = getTool("html-decoder")!;

export const metadata = getToolPageMetadata(tool);

export default function HtmlDecoderPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <HtmlDecoderClient />
    </ToolPageWrapper>
  );
}
