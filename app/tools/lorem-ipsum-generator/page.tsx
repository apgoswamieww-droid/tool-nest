import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import LoremIpsumGeneratorClient from "./LoremIpsumGeneratorClient";

const tool = getTool("lorem-ipsum-generator")!;

export const metadata = getToolPageMetadata(tool);

export default function LoremIpsumGeneratorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <LoremIpsumGeneratorClient />
    </ToolPageWrapper>
  );
}
