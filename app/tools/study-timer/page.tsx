import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import StudyTimerClient from "./StudyTimerClient";

const tool = getTool("study-timer")!;

export const metadata = getToolPageMetadata(tool);

export default function StudyTimerPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <StudyTimerClient />
    </ToolPageWrapper>
  );
}
