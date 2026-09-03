import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import WheelSpinnerClient from "./WheelSpinnerClient";

const tool = getTool("wheel-spinner")!;

export const metadata = getToolPageMetadata(tool);

export default function WheelSpinnerPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <WheelSpinnerClient />
    </ToolPageWrapper>
  );
}
