import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import SipCalculatorClient from "./SipCalculatorClient";

const tool = getTool("sip-calculator")!;

export const metadata = getToolPageMetadata(tool);

export default function SipCalculatorPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <SipCalculatorClient />
    </ToolPageWrapper>
  );
}
