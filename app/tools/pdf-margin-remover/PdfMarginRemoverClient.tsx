"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Scissors, Download, Shield } from "lucide-react";
import { usePdfWorker } from "@/lib/pdf/use-pdf-worker";
import { validatePdfFile } from "@/lib/pdf/validators";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { PdfDropzone } from "@/components/ui/pdf-dropzone";
import { PdfProgress } from "@/components/ui/pdf-progress";
import { PdfFileInfo } from "@/components/ui/pdf-file-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PdfMarginRemoverClientProps {}

export default function PdfMarginRemoverClient(props: PdfMarginRemoverClientProps) {
  const tool = getTool("pdf-margin-remover")!;
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState<number>();
  const [margins, setMargins] = React.useState({ top: 36, bottom: 36, left: 36, right: 36 });
  const { process, state, cancel } = usePdfWorker();
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  const handleFile = async (f: File) => {
    const err = await validatePdfFile(f);
    if (!err.valid) return;
    setFile(f);
    setPageCount(err.pageCount);
    setResultUrl(null);
  };

  const handleProcess = async () => {
    if (!file) return;
    const buffer = await file.arrayBuffer();
    try {
      const result = await process("remove-margins", { fileBuffer: buffer, fileName: file.name, ...margins });
      if (result.data) {
        const blob = new Blob([result.data], { type: result.mimeType });
        setResultUrl(URL.createObjectURL(blob));
      }
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-500/20 bg-green-500/5"><CardContent className="p-4 flex items-center gap-3 text-sm"><Shield className="h-5 w-5 text-green-500 shrink-0" /><p className="text-muted-foreground"><strong className="text-foreground">100% Private:</strong> Processed in-browser via Web Worker. No uploads.</p></CardContent></Card>

        {!file ? <PdfDropzone onFile={handleFile} /> : (
          <div className="space-y-4">
            <PdfFileInfo file={file} pageCount={pageCount} onRemove={() => { setFile(null); setResultUrl(null); }} />

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Margin Settings (points)</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {(["top", "bottom", "left", "right"] as const).map(side => (
                    <div key={side}><Label className="capitalize">{side}</Label><Input type="number" min={0} max={200} value={margins[side]} onChange={(e) => setMargins(p => ({ ...p, [side]: parseInt(e.target.value) || 0 }))} className="mt-1" /></div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">1 point = 1/72 inch. 36pt ≈ 0.5 inch, 72pt ≈ 1 inch.</p>
              </CardContent>
            </Card>

            <Button onClick={handleProcess} disabled={state.status === "processing"} className="w-full"><Scissors className="h-4 w-4" /> Trim Margins</Button>
          </div>
        )}

        <PdfProgress state={state} onCancel={cancel} />

        {resultUrl && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3"><CardTitle className="text-lg">Margins Trimmed ✓</CardTitle></CardHeader>
            <CardContent><Button onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = file!.name.replace(/\.pdf$/i, "") + "-trimmed.pdf"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button></CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
