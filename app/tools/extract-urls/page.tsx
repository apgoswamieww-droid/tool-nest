import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import ExtractUrlsClient from "./ExtractUrlsClient";

const tool = getTool("extract-urls")!;

export const metadata = getToolPageMetadata(tool);

export default function ExtractUrlsPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <ExtractUrlsClient />
    </ToolPageWrapper>
  );
}
