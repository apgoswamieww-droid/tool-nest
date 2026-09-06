import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import Base64EncoderClient from "./Base64EncoderClient";

const tool = getTool("base64-encoder")!;

export const metadata = getToolPageMetadata(tool);

export default function Base64EncoderPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <Base64EncoderClient />
    </ToolPageWrapper>
  );
}
