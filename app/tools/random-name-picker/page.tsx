import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import RandomNamePickerClient from "./RandomNamePickerClient";

const tool = getTool("random-name-picker")!;

export const metadata = getToolPageMetadata(tool);

export default function RandomNamePickerPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <RandomNamePickerClient />
    </ToolPageWrapper>
  );
}
