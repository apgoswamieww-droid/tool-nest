"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { SquareStack } from "lucide-react";
import { calculateConcrete, validateConcreteInput, CONCRETE_SHAPES } from "@/lib/tools/concrete-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConcreteCalculatorClientProps {}

export default function ConcreteCalculatorClient(props: ConcreteCalculatorClientProps) {
  const tool = getTool("concrete-calculator")!;
  const [input, setInput] = React.useState({
    shape: "slab" as const, length: 20, width: 10, depth: 0.5, wastagePercent: 5, bagSize: 0.6,
  });

  const result = React.useMemo(() => {
    if (validateConcreteInput(input)) return null;
    return calculateConcrete(input);
  }, [input]);

  const update = (field: string, value: string | number) => setInput(prev => ({ ...prev, [field]: value }));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Dimensions" icon={<SquareStack className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Shape</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {CONCRETE_SHAPES.map(s => (
                  <Button key={s.value} variant={input.shape === s.value ? "default" : "outline"} size="sm" className="text-xs" onClick={() => update("shape", s.value)}>{s.label}</Button>
                ))}
              </div>
            </div>
            <div><Label>Length (ft)</Label><Input type="number" min={0.1} step={0.1} value={input.length} onChange={(e) => update("length", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Width (ft)</Label><Input type="number" min={0.1} step={0.1} value={input.width} onChange={(e) => update("width", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Depth (ft)</Label><Input type="number" min={0.1} step={0.1} value={input.depth} onChange={(e) => update("depth", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Wastage (%)</Label><Input type="number" min={0} max={50} value={input.wastagePercent} onChange={(e) => update("wastagePercent", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Bag Size (cu ft)</Label><Input type="number" step={0.05} min={0.1} value={input.bagSize} onChange={(e) => update("bagSize", parseFloat(e.target.value) || 0.6)} className="mt-1.5" /></div>
          </div>
        </ToolInputPanel>

        {result && (
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Concrete Required</CardTitle></CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">{result.bagsWithWastage} bags</div>
                <p className="text-sm text-muted-foreground mt-2">{result.volumeCubicFeet} ft³ ({result.volumeCubicYards} yd³ / {result.volumeCubicMeters} m³)</p>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.volumeCubicFeet}</p><p className="text-xs text-muted-foreground">ft³</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.volumeCubicYards}</p><p className="text-xs text-muted-foreground">yd³</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.bagsNeeded}</p><p className="text-xs text-muted-foreground">Bags (exact)</p></CardContent></Card>
              <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">~${result.costEstimate}</p><p className="text-xs text-muted-foreground">Est. Cost</p></CardContent></Card>
            </div>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p><strong>Volume</strong> = L × W × D = {input.length} × {input.width} × {input.depth} = {result.volumeCubicFeet} ft³</p>
                <p><strong>Bags</strong> = Volume ÷ Bag Size = {result.volumeCubicFeet} ÷ {input.bagSize} = {result.bagsNeeded}</p>
                <p><strong>With Wastage</strong> = {result.bagsNeeded} × (1 + {input.wastagePercent}%) = {result.bagsWithWastage}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
