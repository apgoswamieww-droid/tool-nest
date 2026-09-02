"use client";

import * as React from "react";
import { FileOutput, Upload, AlertTriangle } from "lucide-react";
import { getTool } from "@/lib/registry";
import { extractPdfText, validatePdfForExtraction, ExtractionResult } from "@/lib/tools/pdf-text-extract";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { CopyButton } from "@/components/tool/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tool = getTool("pdf-text-extractor")!;
const FAQ = [
  { question: "How does text extraction work?", answer: "The tool parses the PDF binary structure and extracts text streams (BT/ET operators) from the content. It handles both simple text strings and array-encoded text." },
  { question: "Will this work with scanned PDFs?", answer: "Scanned/image-based PDFs don't contain extractable text streams. The tool will indicate when no text content is found — you'd need OCR software for scanned documents." },
  { question: "Is my file kept private?", answer: "Absolutely. The file is processed entirely in your browser. No data is uploaded to any server." },
];

export default function PdfTextExtractorPage() {
  const [result, setResult] = React.useState<ExtractionResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleFile = async (f: File) => {
    const err = validatePdfForExtraction(f);
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    try {
      const r = await extractPdfText(f);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract text");
    }
    setLoading(false);
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="space-y-6">
        <Card className="border-2 border-dashed">
          <CardContent className="p-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">Select a PDF to extract its text content</p>
            <input type="file" accept=".pdf" className="hidden" id="pdf-text-upload" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <Button asChild><label htmlFor="pdf-text-upload" className="cursor-pointer"><FileOutput className="h-4 w-4" /> Select PDF</label></Button>
          </CardContent>
        </Card>

        {error && <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm"><AlertTriangle className="h-4 w-4" />{error}</div>}

        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Extracted Text</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{result.wordCount} words</Badge>
                  <Badge variant="outline">{result.charCount} chars</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <pre className="max-h-96 overflow-auto rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap">{result.text}</pre>
              <CopyButton text={result.text} label="Copy extracted text" />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolPageLayout>
  );
}
