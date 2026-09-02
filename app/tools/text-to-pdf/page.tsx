"use client";

import * as React from "react";
import { FileOutput, Download } from "lucide-react";
import { getTool } from "@/lib/registry";
import { textToPdf, TextToPdfOptions } from "@/lib/tools/text-to-pdf";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tool = getTool("text-to-pdf")!;
const FAQ = [
  { question: "What format is the output?", answer: "The tool generates a standard PDF 1.4 file that can be opened by any PDF reader (Adobe Acrobat, browser, Preview, etc.)." },
  { question: "Is there a page limit?", answer: "No strict limit, but very large documents (100+ pages) may take a moment to generate. All processing happens in your browser." },
  { question: "Can I choose the font?", answer: "Yes. Choose from Courier (monospace), Helvetica (sans-serif), or Times (serif). You can also adjust font size and page layout." },
];

export default function TextToPdfPage() {
  const [content, setContent] = React.useState("Hello World!\n\nThis is a sample document created with ToolNest's Text to PDF Converter.\n\nYou can type or paste any text here and download it as a PDF file.");
  const [title, setTitle] = React.useState("document");
  const [options, setOptions] = React.useState<TextToPdfOptions>({
    content: "", fontSize: 12, fontFamily: "courier", pageSize: "a4", orientation: "portrait", margins: 72,
  });

  const handleDownload = () => {
    try {
      const result = textToPdf({ ...options, content, title });
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate PDF");
    }
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Text Content" icon={<FileOutput className="h-5 w-5" />} className="lg:col-span-2">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="content">Text Content</Label>
              <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={12} className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono" />
              <p className="text-xs text-muted-foreground mt-1">{content.length} characters</p>
            </div>
          </div>
        </ToolInputPanel>

        <ToolInputPanel title="PDF Options" icon={<Download className="h-5 w-5" />}>
          <div className="space-y-4">
            <div><Label>Font Size</Label><Input type="number" min={8} max={24} value={options.fontSize} onChange={(e) => setOptions(p => ({ ...p, fontSize: parseInt(e.target.value) || 12 }))} className="mt-1.5" /></div>
            <div><Label>Font Family</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {(["courier", "helvetica", "times"] as const).map(f => (
                  <Button key={f} variant={options.fontFamily === f ? "default" : "outline"} size="sm" className="text-xs capitalize" onClick={() => setOptions(p => ({ ...p, fontFamily: f }))}>{f}</Button>
                ))}
              </div>
            </div>
            <div><Label>Page Size</Label>
              <div className="flex gap-2 mt-1.5">
                {(["a4", "letter"] as const).map(s => (
                  <Button key={s} variant={options.pageSize === s ? "default" : "outline"} size="sm" className="text-xs uppercase" onClick={() => setOptions(p => ({ ...p, pageSize: s }))}>{s}</Button>
                ))}
              </div>
            </div>
            <div><Label>Orientation</Label>
              <div className="flex gap-2 mt-1.5">
                {(["portrait", "landscape"] as const).map(o => (
                  <Button key={o} variant={options.orientation === o ? "default" : "outline"} size="sm" className="text-xs capitalize" onClick={() => setOptions(p => ({ ...p, orientation: o }))}>{o}</Button>
                ))}
              </div>
            </div>
            <Button onClick={handleDownload} className="w-full mt-4" disabled={!content.trim()}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </ToolInputPanel>
      </div>
    </ToolPageLayout>
  );
}
