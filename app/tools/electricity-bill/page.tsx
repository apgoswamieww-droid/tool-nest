import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import ElectricityBillClient from "./ElectricityBillClient";

const tool = getTool("electricity-bill")!;

export const metadata = getToolPageMetadata(tool);

export default function ElectricityBillPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <ElectricityBillClient />
    </ToolPageWrapper>
  );
}
