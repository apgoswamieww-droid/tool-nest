"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Merge, Upload, Download, AlertTriangle, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { mergePdfs, validatePdfFiles } from "@/lib/tools/pdf-merge";
import { analytics } from "@/lib/analytics";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PdfMergerClientProps {}

export default function PdfMergerClient(props: PdfMergerClientProps) {
  const tool = getTool("pdf-merger")!;
  const [files, setFiles] = React.useState<File[]>([]);
  const [result, setResult] = React.useState<{ success: boolean; fileName: string; pageCount: number; fileSizeFormatted: string } | null>(null);
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const resultUrlRef = React.useRef<string | null>(null);

  // Revoke the blob URL so the merged file can be GC'd once no longer needed.
  const resetResult = () => {
    setResult(null);
    setResultUrl(null);
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }
  };

  React.useEffect(() => {
    return () => {
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  const addFiles = (newFiles: FileList) => {
    const arr = Array.from(newFiles).filter(f => f.name.endsWith(".pdf"));
    // Funnel: one file_uploaded per file selected (max 10).
    for (const f of arr) analytics.fileUploaded(tool.slug, f);
    resetResult();
    setFiles(prev => [...prev, ...arr].slice(0, 10));
  };

  const removeFile = (i: number) => {
    resetResult();
    setFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const moveFile = (i: number, dir: -1 | 1) => {
    resetResult(); // order matters in a merge — invalidate the old output
    setFiles(prev => {
      const arr = [...prev];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };

  const handleMerge = async () => {
    const err = validatePdfFiles(files);
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    const startedAt = Date.now();
    const r = await mergePdfs(files);
    setLoading(false);
    if (r.success) {
      resetResult(); // drop any previous output
      const url = URL.createObjectURL(r.blob!);
      resultUrlRef.current = url;
      setResultUrl(url);
      setResult({ success: true, fileName: r.fileName, pageCount: r.pageCount, fileSizeFormatted: r.fileSizeFormatted });
      analytics.fileProcessed(tool.slug, Date.now() - startedAt);
    } else {
      setError(r.error || "Merge failed");
    }
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="space-y-6">
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Select PDF files to merge (max 10)</p>
            <input type="file" accept=".pdf" multiple className="hidden" id="pdf-merge-upload" onChange={(e) => e.target.files && addFiles(e.target.files)} />
            <Button asChild><label htmlFor="pdf-merge-upload" className="cursor-pointer"><Merge className="h-4 w-4" /> Select PDFs</label></Button>
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Files to Merge ({files.length})</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                  <span className="truncate flex-1">{i + 1}. {f.name}</span>
                  <span className="text-muted-foreground text-xs mx-2">{(f.size / 1024).toFixed(0)} KB</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveFile(i, -1)} disabled={i === 0}><ArrowUp className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}><ArrowDown className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))}
              <Button onClick={handleMerge} disabled={loading} className="w-full mt-3">
                <Merge className="h-4 w-4" /> {loading ? "Merging…" : "Merge PDFs"}
              </Button>
            </CardContent>
          </Card>
        )}

        {error && <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"><AlertTriangle className="h-4 w-4" />{error}</div>}

        {result && result.success && resultUrl && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold text-green-600">✓ Merge Complete</p>
              <p className="text-sm text-muted-foreground mt-1">{result.fileName} — {result.pageCount} pages — {result.fileSizeFormatted}</p>
              <Button asChild className="mt-4 gap-2">
                <a href={resultUrl} download={result.fileName}><Download className="h-4 w-4" /> Download PDF</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
