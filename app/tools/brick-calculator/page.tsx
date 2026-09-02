"use client";

import * as React from "react";
import { BrickWall, AlertTriangle } from "lucide-react";
import { getTool } from "@/lib/registry";
import { calculateBricks, validateBrickInput, COMMON_BRICK_SIZES, COMMON_WALL_THICKNESSES } from "@/lib/tools/brick-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const tool = getTool("brick-calculator")!;

const FAQ = [
  { question: "How many bricks do I need for a wall?", answer: "Enter your wall dimensions (length, height, thickness) and brick size. The calculator accounts for mortar joints and adds a wastage factor (default 5%) for breakage." },
  { question: "What is the standard brick size?", answer: "The standard brick size is 9\" × 4.5\" × 3\". Other common sizes include Modular (7.5\" × 3.5\" × 2.25\") and Queen (9.5\" × 3\" × 2.75\")." },
  { question: "How much mortar do I need?", answer: "The calculator estimates mortar volume based on the gap between bricks (default 0.5\" joint thickness). For a 100 sq ft wall, you typically need about 0.15-0.2 cubic meters of mortar." },
  { question: "Why add wastage?", answer: "Bricks break during transport and handling. A 5% wastage factor is standard practice. For complex patterns or experienced handlers, 3% may suffice; for beginners, 10% is safer." },
];

export default function BrickCalculatorPage() {
  const [input, setInput] = React.useState({
    wallLength: 20,
    wallHeight: 10,
    wallThickness: 9,
    brickLength: 9,
    brickWidth: 4.5,
    brickHeight: 3,
    mortarThickness: 0.5,
    wastagePercent: 5,
  });

  const result = React.useMemo(() => {
    if (validateBrickInput(input)) return null;
    return calculateBricks(input);
  }, [input]);

  const update = (field: string, value: number) => setInput(prev => ({ ...prev, [field]: value }));

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Wall & Brick Details" icon={<BrickWall className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Wall Length (ft)</Label><Input type="number" min={0.1} step={0.1} value={input.wallLength} onChange={(e) => update("wallLength", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Wall Height (ft)</Label><Input type="number" min={0.1} step={0.1} value={input.wallHeight} onChange={(e) => update("wallHeight", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Wall Thickness</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_WALL_THICKNESSES.map(t => (
                  <Button key={t.value} variant={input.wallThickness === t.value ? "default" : "outline"} size="sm" className="text-xs" onClick={() => update("wallThickness", t.value)}>{t.label}</Button>
                ))}
              </div>
            </div>
            <div><Label>Brick Size</Label>
              <div className="space-y-1.5 mt-1.5">
                {Object.entries(COMMON_BRICK_SIZES).map(([key, s]) => (
                  <Button key={key} variant={input.brickLength === s.brickLength ? "default" : "outline"} size="sm" className="text-xs w-full justify-start" onClick={() => { update("brickLength", s.brickLength); update("brickWidth", s.brickWidth); update("brickHeight", s.brickHeight); }}>{s.label}</Button>
                ))}
              </div>
            </div>
            <div><Label>Mortar Joint (in)</Label><Input type="number" min={0} max={2} step={0.1} value={input.mortarThickness} onChange={(e) => update("mortarThickness", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Wastage (%)</Label><Input type="number" min={0} max={50} value={input.wastagePercent} onChange={(e) => update("wastagePercent", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Bricks Required</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">{result.bricksWithWastage.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-2">{result.bricksNeeded} bricks + {input.wastagePercent}% wastage</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.wallVolumeCubicFeet}</p><p className="text-xs text-muted-foreground">Wall Volume (ft³)</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.mortarCubicFeet}</p><p className="text-xs text-muted-foreground">Mortar (ft³)</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.mortarCubicMeters}</p><p className="text-xs text-muted-foreground">Mortar (m³)</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.coursesHigh}</p><p className="text-xs text-muted-foreground">Courses High</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Wall Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Wall Area</span><span className="font-medium">{(input.wallLength * input.wallHeight).toFixed(1)} ft²</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Bricks/Course</span><span className="font-medium">{result.bricksPerCourse}</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Total Bricks</span><span className="font-medium">{result.bricksNeeded}</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">With Wastage</span><span className="font-medium">{result.bricksWithWastage}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Wall Volume</strong> = Length × Height × Thickness = {input.wallLength} × {input.wallHeight} × {(input.wallThickness / 12).toFixed(2)} ft = {result.wallVolumeCubicFeet} ft³</p>
                  <p><strong>Bricks Needed</strong> = Wall Volume ÷ (Brick Volume + Mortar) = {result.bricksNeeded}</p>
                  <p><strong>With Wastage</strong> = {result.bricksNeeded} × (1 + {input.wastagePercent}%) = {result.bricksWithWastage}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
