import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import CgpaConverterClient from "./CgpaConverterClient";

const tool = getTool("cgpa-converter")!;

export const metadata = getToolPageMetadata(tool);

export default function CgpaConverterPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <CgpaConverterClient />
    </ToolPageWrapper>
  );
}
