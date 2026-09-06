import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import WordCounterClient from "./WordCounterClient";

const tool = getTool("word-counter")!;

export const metadata = getToolPageMetadata(tool);

export default function WordCounterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <WordCounterClient />
    </ToolPageWrapper>
  );
}
