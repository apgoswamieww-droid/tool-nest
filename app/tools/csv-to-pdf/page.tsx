"use client";

import * as React from "react";
import { FileOutput, Download, FileText } from "lucide-react";
import { getTool } from "@/lib/registry";
import { usePdfWorker } from "@/lib/pdf/use-pdf-worker";
import { validateCsvFile, formatFileSize } from "@/lib/pdf/validators";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { PdfDropzone } from "@/components/ui/pdf-dropzone";
import { PdfProgress } from "@/components/ui/pdf-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tool = getTool("csv-to-pdf")!;
const FAQ = [
  { question: "What CSV formats are supported?", answer: "Standard CSV, TSV (tab-separated), and any delimiter-separated values." },
  { question: "Is my data uploaded?", answer: "No. The CSV is read in your browser and converted to PDF using Web Workers. Nothing leaves your device." },
  { question: "Can I customize the PDF layout?", answer: "Yes. Choose font family, page size, orientation, margins, and an optional title." },
];

interface CsvOptions {
  fontSize: number;
  fontFamily: string;
  pageSize: string;
  orientation: string;
  margins: number;
  title: string;
  delimiter: string;
}

export default function CsvToPdfPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [csvContent, setCsvContent] = React.useState("");
  const [options, setOptions] = React.useState<CsvOptions>({
    fontSize: 10,
    fontFamily: "courier",
    pageSize: "a4",
    orientation: "landscape",
    margins: 36,
    title: "",
    delimiter: ",",
  });

  const { process, state, cancel } = usePdfWorker();
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  const handleFile = async (f: File) => {
    const err = validateCsvFile(f);
    if (!err.valid) return;
    setFile(f);
    setResultUrl(null);
    const text = await f.text();
    setCsvContent(text);
  };

  const handleProcess = async () => {
    if (!csvContent) return;
    setResultUrl(null);
    try {
      const result = await process("csv-to-pdf", { csvContent, options });
      if (result.data) {
        const blob = new Blob([result.data], { type: result.mimeType });
        setResultUrl(URL.createObjectURL(blob));
      }
    } catch (e) { console.error(e); }
  };

  const handleDownload = () => {
    if (!resultUrl || !file) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = options.title ? `${options.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.pdf` : `${file.name.replace(/\.[^.]+$/, "")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  React.useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="CSV Input" icon={<FileOutput className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            {!file ? (
              <PdfDropzone onFile={handleFile} accept=".csv,.tsv,.txt" label="Drop a CSV file here" description="or click to browse (CSV, TSV, TXT)" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-2 rounded bg-muted/50 text-sm">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="truncate flex-1">{file.name}</span>
                  <span className="text-muted-foreground text-xs">{formatFileSize(file.size)}</span>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setCsvContent(""); setResultUrl(null); }}>✕</Button>
                </div>
                <div><Label>Title (optional)</Label><Input value={options.title} onChange={(e) => setOptions(p => ({ ...p, title: e.target.value }))} placeholder="Document title" className="mt-1.5" /></div>
                <div><Label>Delimiter</Label><Input value={options.delimiter} onChange={(e) => setOptions(p => ({ ...p, delimiter: e.target.value || "," }))} className="mt-1.5 font-mono" /></div>
                <div><Label>Font Size</Label><Input type="number" min={6} max={24} value={options.fontSize} onChange={(e) => setOptions(p => ({ ...p, fontSize: parseInt(e.target.value) || 10 }))} className="mt-1.5" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Font</Label><div className="flex gap-1 mt-1.5">{(["courier", "helvetica", "times"] as const).map(f => <Button key={f} variant={options.fontFamily === f ? "default" : "outline"} size="sm" className="text-xs capitalize flex-1" onClick={() => setOptions(p => ({ ...p, fontFamily: f }))}>{f}</Button>)}</div></div>
                  <div><Label>Orientation</Label><div className="flex gap-1 mt-1.5">{(["portrait", "landscape"] as const).map(o => <Button key={o} variant={options.orientation === o ? "default" : "outline"} size="sm" className="text-xs capitalize flex-1" onClick={() => setOptions(p => ({ ...p, orientation: o }))}>{o}</Button>)}</div></div>
                </div>
                <Button onClick={handleProcess} disabled={state.status === "processing"} className="w-full"><FileOutput className="h-4 w-4" /> Convert to PDF</Button>
              </div>
            )}
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          <PdfProgress state={state} onCancel={cancel} fileName={file?.name} />

          {resultUrl && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardHeader className="pb-3"><CardTitle className="text-lg">PDF Ready</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Your CSV has been converted to a PDF document.</p>
                <Button onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button>
              </CardContent>
            </Card>
          )}

          {!file && !resultUrl && (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <FileOutput className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Upload a CSV file to convert it to PDF</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
