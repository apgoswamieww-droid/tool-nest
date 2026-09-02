"use client";

import * as React from "react";
import { QrCode, Download, Shield } from "lucide-react";
import { getTool } from "@/lib/registry";
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

const tool = getTool("pdf-qr-code")!;
const FAQ = [
  { question: "What data can the QR code contain?", answer: "Any text data: URLs, email addresses, phone numbers, plain text, or vCard contact information. The QR code is generated client-side." },
  { question: "Where will the QR code appear?", answer: "Choose from 5 positions: top-left, top-right, bottom-left, bottom-right, or center. You can also specify which pages receive the QR code." },
  { question: "Will the QR code cover existing content?", answer: "The QR code is overlaid on top of the page content. Choose a corner position and appropriate size to minimize overlap with text or images." },
];

const POSITIONS = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
  { value: "center", label: "Center" },
] as const;

export default function PdfQrCodePage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState<number>();
  const [qrData, setQrData] = React.useState("https://toolnest.io");
  const [position, setPosition] = React.useState<string>("bottom-right");
  const [size, setSize] = React.useState(100);
  const [pageStart, setPageStart] = React.useState(1);
  const [pageEnd, setPageEnd] = React.useState(1);
  const [allPages, setAllPages] = React.useState(true);

  const { process, state, cancel } = usePdfWorker();
  const [resultUrl, setResultUrl] = React.useState<string | null>(null);

  const handleFile = async (f: File) => {
    const err = await validatePdfFile(f);
    if (!err.valid) return;
    setFile(f);
    setPageCount(err.pageCount);
    setPageEnd(err.pageCount || 1);
    setResultUrl(null);
  };

  const handleProcess = async () => {
    if (!file || !qrData.trim()) return;
    const buffer = await file.arrayBuffer();
    try {
      const result = await process("add-qr-code", {
        fileBuffer: buffer,
        fileName: file.name,
        qrData: qrData.trim(),
        position,
        size,
        pageRange: allPages ? undefined : { start: pageStart, end: pageEnd },
      });
      if (result.data) {
        const blob = new Blob([result.data], { type: result.mimeType });
        setResultUrl(URL.createObjectURL(blob));
      }
    } catch (e) { console.error(e); }
  };

  React.useEffect(() => () => { if (resultUrl) URL.revokeObjectURL(resultUrl); }, [resultUrl]);

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-green-500/20 bg-green-500/5"><CardContent className="p-4 flex items-center gap-3 text-sm"><Shield className="h-5 w-5 text-green-500 shrink-0" /><p className="text-muted-foreground"><strong className="text-foreground">100% Private:</strong> QR code generated and embedded in-browser. No uploads.</p></CardContent></Card>

        {!file ? <PdfDropzone onFile={handleFile} /> : (
          <div className="space-y-4">
            <PdfFileInfo file={file} pageCount={pageCount} onRemove={() => { setFile(null); setResultUrl(null); }} />

            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">QR Code Settings</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>QR Code Data (URL, text, etc.)</Label><Input value={qrData} onChange={(e) => setQrData(e.target.value)} placeholder="https://example.com" className="mt-1.5" /></div>

                <div><Label>Position</Label><div className="flex flex-wrap gap-1.5 mt-1.5">{POSITIONS.map(p => <Button key={p.value} variant={position === p.value ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setPosition(p.value)}>{p.label}</Button>)}</div></div>

                <div><Label>Size (points)</Label><Input type="number" min={40} max={300} value={size} onChange={(e) => setSize(parseInt(e.target.value) || 100)} className="mt-1.5" /><p className="text-xs text-muted-foreground mt-1">Default: 100pt ≈ 1.4 inches. 72pt = 1 inch.</p></div>

                <div>
                  <Label>Pages</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <input type="checkbox" id="all-pages" checked={allPages} onChange={(e) => setAllPages(e.target.checked)} className="h-4 w-4 rounded border-input" />
                    <Label htmlFor="all-pages" className="text-sm font-normal cursor-pointer">All pages</Label>
                  </div>
                  {!allPages && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">From</span>
                      <Input type="number" min={1} max={pageCount || 1} value={pageStart} onChange={(e) => setPageStart(parseInt(e.target.value) || 1)} className="w-20" />
                      <span className="text-sm text-muted-foreground">to</span>
                      <Input type="number" min={1} max={pageCount || 1} value={pageEnd} onChange={(e) => setPageEnd(parseInt(e.target.value) || 1)} className="w-20" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleProcess} disabled={state.status === "processing" || !qrData.trim()} className="w-full"><QrCode className="h-4 w-4" /> Add QR Code to PDF</Button>
          </div>
        )}

        <PdfProgress state={state} onCancel={cancel} />

        {resultUrl && (
          <Card className="border-green-500/30 bg-green-500/5">
            <CardHeader className="pb-3"><CardTitle className="text-lg">QR Code Added ✓</CardTitle></CardHeader>
            <CardContent><Button onClick={() => { const a = document.createElement("a"); a.href = resultUrl; a.download = file!.name.replace(/\.pdf$/i, "") + "-qr.pdf"; document.body.appendChild(a); a.click(); document.body.removeChild(a); }} className="gap-2"><Download className="h-4 w-4" /> Download PDF</Button></CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
