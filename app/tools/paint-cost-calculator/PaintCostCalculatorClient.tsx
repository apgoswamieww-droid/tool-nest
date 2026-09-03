"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { PaintBucket, AlertTriangle } from "lucide-react";
import { calculatePaint, validatePaintInput } from "@/lib/tools/paint-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaintCostCalculatorClientProps {}

export default function PaintCostCalculatorClient(props: PaintCostCalculatorClientProps) {
  const tool = getTool("paint-cost-calculator")!;
  const [input, setInput] = React.useState({
    roomWidth: 12, roomLength: 14, roomHeight: 9,
    doors: 1, windows: 2,
    doorWidth: 3, doorHeight: 7, windowWidth: 3, windowHeight: 4,
    coats: 2, coveragePerGallon: 350, pricePerGallon: 40, ceilingPaint: false,
  });

  const result = React.useMemo(() => {
    if (validatePaintInput(input)) return null;
    return calculatePaint(input);
  }, [input]);

  const update = (field: string, value: number | boolean) => setInput(prev => ({ ...prev, [field]: value }));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Room Details" icon={<PaintBucket className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Width (ft)</Label><Input type="number" min={1} value={input.roomWidth} onChange={(e) => update("roomWidth", parseFloat(e.target.value) || 0)} className="mt-1" /></div>
              <div><Label>Length (ft)</Label><Input type="number" min={1} value={input.roomLength} onChange={(e) => update("roomLength", parseFloat(e.target.value) || 0)} className="mt-1" /></div>
              <div><Label>Height (ft)</Label><Input type="number" min={1} value={input.roomHeight} onChange={(e) => update("roomHeight", parseFloat(e.target.value) || 0)} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Doors</Label><Input type="number" min={0} value={input.doors} onChange={(e) => update("doors", parseInt(e.target.value) || 0)} className="mt-1.5" /></div>
              <div><Label>Windows</Label><Input type="number" min={0} value={input.windows} onChange={(e) => update("windows", parseInt(e.target.value) || 0)} className="mt-1.5" /></div>
            </div>
            <div><Label>Coats of Paint</Label><Input type="number" min={1} max={4} value={input.coats} onChange={(e) => update("coats", parseInt(e.target.value) || 1)} className="mt-1.5" /></div>
            <div><Label>Price per Gallon ($)</Label><Input type="number" min={0} step={0.5} value={input.pricePerGallon} onChange={(e) => update("pricePerGallon", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="ceiling" checked={input.ceilingPaint} onChange={(e) => update("ceilingPaint", e.target.checked)} className="h-4 w-4 rounded border-input" />
              <Label htmlFor="ceiling" className="text-sm font-normal cursor-pointer">Include ceiling</Label>
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Total Project Cost</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">${result.totalProjectCost.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-2">{result.gallonsWithCoats} gallon(s) for walls{result.ceilingGallons > 0 ? ` + ${result.ceilingGallons} for ceiling` : ""}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.paintableArea}</p><p className="text-xs text-muted-foreground">Paintable Area (ft²)</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.gallonsWithCoats}</p><p className="text-xs text-muted-foreground">Gallons Needed</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.totalCost}</p><p className="text-xs text-muted-foreground">Wall Paint Cost</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.costPerSqFt}</p><p className="text-xs text-muted-foreground">Cost per ft²</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Area Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Total Wall Area</span><span className="font-medium">{result.totalArea} ft²</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Door Deduction ({input.doors})</span><span className="font-medium">−{result.doorArea} ft²</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Window Deduction ({input.windows})</span><span className="font-medium">−{result.windowArea} ft²</span></div>
                  <div className="flex justify-between p-2 rounded bg-primary/10 font-medium"><span className="text-primary">Paintable Area</span><span className="text-primary">{result.paintableArea} ft²</span></div>
                  {result.ceilingArea > 0 && <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Ceiling Area</span><span className="font-medium">{result.ceilingArea} ft²</span></div>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Wall Area</strong> = Perimeter × Height = 2×({input.roomWidth}+{input.roomLength}) × {input.roomHeight} = {result.totalArea} ft²</p>
                  <p><strong>Paintable Area</strong> = Wall Area − Doors − Windows = {result.totalArea} − {result.doorArea} − {result.windowArea} = {result.paintableArea} ft²</p>
                  <p><strong>Gallons</strong> = Paintable Area ÷ Coverage × Coats = {result.paintableArea} ÷ {input.coveragePerGallon} × {input.coats} = {result.gallonsWithCoats}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
