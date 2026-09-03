"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Barcode, Download, AlertTriangle } from "lucide-react";
import { generateBarcode, validateBarcodeInput, BARCODE_PRESETS } from "@/lib/tools/barcode-generator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BarcodeGeneratorClientProps {}

export default function BarcodeGeneratorClient(props: BarcodeGeneratorClientProps) {
  const tool = getTool("barcode-generator")!;
  const [data, setData] = React.useState("TOOLNEST-2024");
  const [width, setWidth] = React.useState(300);
  const [height, setHeight] = React.useState(80);
  const [showText, setShowText] = React.useState(true);
  const [barColor, setBarColor] = React.useState("#000000");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [error, setError] = React.useState<string | null>(null);

  const result = React.useMemo(() => {
    const err = validateBarcodeInput(data, "code128");
    if (err) { setError(err); return null; }
    setError(null);
    return generateBarcode({ data, format: "code128", width, height, showText, backgroundColor: bgColor, barColor });
  }, [data, width, height, showText, barColor, bgColor]);

  const handleDownload = () => {
    if (!result?.svg) return;
    const blob = new Blob([result.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${data.replace(/[^a-zA-Z0-9]/g, "_")}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Barcode Settings" icon={<Barcode className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Data to Encode</Label><Input value={data} onChange={(e) => setData(e.target.value)} placeholder="Enter text or numbers" className="mt-1.5 font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Width (px)</Label><Input type="number" min={100} max={800} value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 300)} className="mt-1.5" /></div>
              <div><Label>Height (px)</Label><Input type="number" min={30} max={300} value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 80)} className="mt-1.5" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bar Color</Label><div className="flex gap-2 mt-1.5"><input type="color" value={barColor} onChange={(e) => setBarColor(e.target.value)} className="h-9 w-9 rounded cursor-pointer border" /><Input value={barColor} onChange={(e) => setBarColor(e.target.value)} className="font-mono text-xs" /></div></div>
              <div><Label>Background</Label><div className="flex gap-2 mt-1.5"><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-9 w-9 rounded cursor-pointer border" /><Input value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="font-mono text-xs" /></div></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="show-text" checked={showText} onChange={(e) => setShowText(e.target.checked)} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="show-text" className="text-sm font-normal cursor-pointer">Show text below barcode</Label>
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {error ? (
            <Card className="border-destructive/30"><CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2"><AlertTriangle className="h-5 w-5" />{error}</CardContent></Card>
          ) : result && (
            <>
              <Card>
                <CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-lg">Generated Barcode</CardTitle><Badge variant="outline">Code128-B</Badge></div></CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="border rounded-lg p-6 bg-white" dangerouslySetInnerHTML={{ __html: result.svg }} />
                  <div className="flex gap-2">
                    <Button onClick={handleDownload} className="gap-2"><Download className="h-4 w-4" /> Download SVG</Button>
                    <Button variant="outline" onClick={() => { navigator.clipboard.writeText(result.svg); }} className="gap-2">Copy SVG Code</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Encoded Data</CardTitle></CardHeader>
                <CardContent className="text-sm">
                  <div className="flex items-center gap-2"><span className="text-muted-foreground">Content:</span><code className="font-mono bg-muted px-2 py-0.5 rounded">{data}</code></div>
                  <div className="flex items-center gap-2 mt-1"><span className="text-muted-foreground">Length:</span><span>{data.length} characters</span></div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
