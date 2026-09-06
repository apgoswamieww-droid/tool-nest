"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Square } from "lucide-react";
import {
  calculateArea,
  validateAreaInput,
  SHAPE_LABELS,
  type AreaShape,
  type LinearUnit,
} from "@/lib/tools/area-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SHAPES: AreaShape[] = [
  "rectangle",
  "triangle",
  "circle",
  "trapezoid",
  "parallelogram",
];

const LINEAR_UNITS: { key: LinearUnit; label: string }[] = [
  { key: "mm", label: "mm" },
  { key: "cm", label: "cm" },
  { key: "m", label: "m" },
  { key: "km", label: "km" },
  { key: "in", label: "in" },
  { key: "ft", label: "ft" },
  { key: "yd", label: "yd" },
];

const DEFAULTS = {
  length: "10",
  width: "5",
  base: "6",
  height: "4",
  radius: "3",
  sideA: "3",
  sideB: "5",
};

export default function AreaCalculatorClient() {
  const tool = getTool("area-calculator")!;
  const [shape, setShape] = React.useState<AreaShape>("rectangle");
  const [unit, setUnit] = React.useState<LinearUnit>("m");
  const [dims, setDims] = React.useState(DEFAULTS);

  const num = (k: keyof typeof DEFAULTS) => parseFloat(dims[k]) || 0;

  const input = React.useMemo(
    () => ({
      shape,
      unit,
      length: num("length"),
      width: num("width"),
      base: num("base"),
      height: num("height"),
      radius: num("radius"),
      sideA: num("sideA"),
      sideB: num("sideB"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shape, unit, dims]
  );

  const error = validateAreaInput(input);
  const result = error ? null : calculateArea(input);

  const primary = result?.conversions.find((c) => c.unit === "m2");

  const setDim = (key: keyof typeof DEFAULTS) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setDims((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="Shape & Dimensions" icon={<Square className="h-5 w-5" />}>
          <div className="space-y-4">
            <div>
              <Label>Shape</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {SHAPES.map((s) => (
                  <Button
                    key={s}
                    variant={shape === s ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setShape(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Measurement Unit</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {LINEAR_UNITS.map((u) => (
                  <Button
                    key={u.key}
                    variant={unit === u.key ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => setUnit(u.key)}
                  >
                    {u.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shape === "rectangle" && (
                <>
                  <div>
                    <Label htmlFor="area-length">Length</Label>
                    <Input id="area-length" type="number" min={0} value={dims.length} onChange={setDim("length")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="area-width">Width</Label>
                    <Input id="area-width" type="number" min={0} value={dims.width} onChange={setDim("width")} className="mt-1.5" />
                  </div>
                </>
              )}
              {(shape === "triangle" || shape === "parallelogram") && (
                <>
                  <div>
                    <Label htmlFor="area-base">Base</Label>
                    <Input id="area-base" type="number" min={0} value={dims.base} onChange={setDim("base")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="area-height">Height</Label>
                    <Input id="area-height" type="number" min={0} value={dims.height} onChange={setDim("height")} className="mt-1.5" />
                  </div>
                </>
              )}
              {shape === "circle" && (
                <div>
                  <Label htmlFor="area-radius">Radius</Label>
                  <Input id="area-radius" type="number" min={0} value={dims.radius} onChange={setDim("radius")} className="mt-1.5" />
                </div>
              )}
              {shape === "trapezoid" && (
                <>
                  <div>
                    <Label htmlFor="area-sidea">Side a</Label>
                    <Input id="area-sidea" type="number" min={0} value={dims.sideA} onChange={setDim("sideA")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="area-sideb">Side b</Label>
                    <Input id="area-sideb" type="number" min={0} value={dims.sideB} onChange={setDim("sideB")} className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="area-trapecio-height">Height</Label>
                    <Input id="area-trapecio-height" type="number" min={0} value={dims.height} onChange={setDim("height")} className="mt-1.5" />
                  </div>
                </>
              )}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="pt-2">
              <ResetButton onClick={() => { setDims(DEFAULTS); setUnit("m"); setShape("rectangle"); }} />
            </div>
          </div>
        </ToolInputPanel>

        <ToolResultPanel
          title="Area Result"
          icon={<Square className="h-5 w-5" />}
          isEmpty={!result}
          empty="Choose a shape and enter its dimensions."
        >
          {result && primary && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">{SHAPE_LABELS[result.shape]}</p>
                <p className="text-5xl font-bold text-primary mt-1">
                  {primary.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
                <p className="text-sm text-muted-foreground mt-1">square meters</p>
              </div>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">Convert to other units</p>
                  <div className="grid grid-cols-3 gap-2">
                    {result.conversions.map((c) => (
                      <div key={c.unit} className="rounded-md bg-muted/50 p-2 text-center">
                        <p className="text-sm font-semibold truncate" title={String(c.value)}>
                          {c.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                        </p>
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center">{result.formula}</p>
            </div>
          )}
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
