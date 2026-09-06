import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import HashGeneratorClient from "./HashGeneratorClient";

const tool = getTool("hash-generator")!;

export const metadata = getToolPageMetadata(tool);

export default function HashGeneratorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <HashGeneratorClient />
    </ToolPageWrapper>
  );
}
