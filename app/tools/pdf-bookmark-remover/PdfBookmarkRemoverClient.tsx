"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { BookmarkMinus, Download, Shield } from "lucide-react";
import { usePdfWorker } from "@/lib/pdf/use-pdf-worker";
import { validatePdfFile } from "@/lib/pdf/validators";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { PdfDropzone } from "@/components/ui/pdf-dropzone";
import { PdfProgress } from "@/components/ui/pdf-progress";
import { PdfFileInfo } from "@/components/ui/pdf-file-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PdfBookmarkRemoverClientProps {}

export default function PdfBookmarkRemoverClient(props: PdfBookmarkRemoverClientProps) {
  const tool = getTool("pdf-bookmark-remover")!;
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState<number>();
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
      const result = await process("remove-bookmarks", { fileBuffer: buffer, fileName: file.name });
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
            <Button onClick={handleProcess} disabled={state.status === "processing"} className="w-full"><BookmarkMinus className="h-4 w-4" /> Remove Bookmarks</Button>
          </div>
        )}

        <PdfProgress state={state} onCancel={cancel} />

        {resultUrl && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3"><CardTitle className="text-lg">Bookmarks Removed ✓</CardTitle></CardHeader>
            <CardContent><Button onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = file!.name.replace(/\.pdf$/i, "") + "-no-bookmarks.pdf"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button></CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
