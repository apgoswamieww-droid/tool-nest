import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import RemoveEmojisClient from "./RemoveEmojisClient";

const tool = getTool("remove-emojis")!;

export const metadata = getToolPageMetadata(tool);

export default function RemoveEmojisPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <RemoveEmojisClient />
    </ToolPageWrapper>
  );
}
