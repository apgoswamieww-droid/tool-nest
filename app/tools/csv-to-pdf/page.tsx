import { getTool } from "@/lib/registry";
import { ToolPageWrapper, getToolPageMetadata } from "@/components/tool/ToolPageWrapper";
import CsvToPdfClient from "./CsvToPdfClient";

const tool = getTool("csv-to-pdf")!;

export const metadata = getToolPageMetadata(tool);

export default function CsvToPdfPage() {
  return (
    <ToolPageWrapper tool={tool}>
      <CsvToPdfClient />
    </ToolPageWrapper>
  );
}
