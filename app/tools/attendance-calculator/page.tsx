import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import AttendanceCalculatorClient from "./AttendanceCalculatorClient";

const tool = getTool("attendance-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function AttendanceCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <AttendanceCalculatorClient />
    </ToolPageWrapper>
  );
}
