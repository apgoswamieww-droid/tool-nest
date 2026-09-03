import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import BatteryBackupCalculatorClient from "./BatteryBackupCalculatorClient";

const tool = getTool("battery-backup-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function BatteryBackupCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <BatteryBackupCalculatorClient />
    </ToolPageWrapper>
  );
}
