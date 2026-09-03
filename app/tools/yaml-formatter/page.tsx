import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import YamlFormatterClient from "./YamlFormatterClient";

const tool = getTool("yaml-formatter")!;

export const metadata = getToolPageMetadata(tool);

export default function YamlFormatterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <YamlFormatterClient />
    </ToolPageWrapper>
  );
}
