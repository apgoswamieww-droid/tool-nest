import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import RobotsTxtGeneratorClient from "./RobotsTxtGeneratorClient";

const tool = getTool("robots-txt-generator")!;

export const metadata = getToolPageMetadata(tool);

export default function RobotsTxtGeneratorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <RobotsTxtGeneratorClient />
    </ToolPageWrapper>
  );
}
