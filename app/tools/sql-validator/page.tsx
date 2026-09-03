import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import SqlValidatorClient from "./SqlValidatorClient";

const tool = getTool("sql-validator")!;

export const metadata = getToolPageMetadata(tool);

export default function SqlValidatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <SqlValidatorClient />
    </ToolPageWrapper>
  );
}
