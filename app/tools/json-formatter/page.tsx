import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import JsonFormatterClient from "./JsonFormatterClient";

const tool = getTool("json-formatter")!;

export const metadata = getToolPageMetadata(tool);

export default function JsonFormatterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <JsonFormatterClient />
    </ToolPageWrapper>
  );
}
