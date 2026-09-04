"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { FileSearch, Upload, AlertTriangle } from "lucide-react";
import { extractPdfInfo, validatePdfFile, PdfInfo } from "@/lib/tools/pdf-info";
import { analytics } from "@/lib/analytics";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PdfInfoViewerClientProps {}

export default function PdfInfoViewerClient(props: PdfInfoViewerClientProps) {
  const tool = getTool("pdf-info-viewer")!;
  const [file, setFile] = React.useState<File | null>(null);
  const [info, setInfo] = React.useState<PdfInfo | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFile = async (f: File) => {
    const err = validatePdfFile(f);
    if (err) { setError(err); return; }
    // Funnel: file_uploaded → file_processed (viewer has no download step).
    analytics.fileUploaded(tool.slug, f);
    const startedAt = Date.now();
    setError(null);
    setFile(f);
    setLoading(true);
    try {
      const result = await extractPdfInfo(f);
      setInfo(result);
      analytics.fileProcessed(tool.slug, Date.now() - startedAt);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to read PDF");
    }
    setLoading(false);
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="space-y-6">
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Drop a PDF file here or click to browse</p>
            <input type="file" accept=".pdf" className="hidden" id="pdf-upload" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <Button asChild><label htmlFor="pdf-upload" className="cursor-pointer"><FileSearch className="h-4 w-4" /> Select PDF</label></Button>
          </CardContent>
        </Card>

        {error && <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"><AlertTriangle className="h-4 w-4" />{error}</div>}

        {info && (
          <Card>
            <CardHeader><CardTitle className="text-lg">PDF Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  ["File Name", info.fileName],
                  ["File Size", info.fileSizeFormatted],
                  ["PDF Version", info.pdfVersion],
                  ["Pages", info.pageCount?.toString() || "Unknown"],
                  ["Title", info.title || "Not set"],
                  ["Author", info.author || "Not set"],
                  ["Creator", info.creator || "Not set"],
                  ["Producer", info.producer || "Not set"],
                  ["Created", info.creationDate || "Unknown"],
                  ["Modified", info.modDate || "Unknown"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">{label}</span><span className="font-medium truncate ml-2">{value}</span></div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Badge variant={info.isEncrypted ? "destructive" : "default"}>{info.isEncrypted ? "Encrypted" : "Not Encrypted"}</Badge>
                <Badge variant="outline">{info.format}</Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
