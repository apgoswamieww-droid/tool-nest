"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Wheat } from "lucide-react";
import {
  calculateCropYield,
  validateCropYieldInput,
  AREA_UNIT_LABELS,
  type AreaUnit,
} from "@/lib/tools/crop-yield-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DEFAULT_INPUT = {
  area: 2,
  areaUnit: "acre" as AreaUnit,
  plantsPerUnit: 10000,
  yieldPerPlantKg: 0.5,
  survivalRate: 95,
};

export default function CropYieldCalculatorClient() {
  const tool = getTool("crop-yield-calculator")!;
  const [input, setInput] = React.useState(DEFAULT_INPUT);

  const update = (field: string, value: number | string) =>
    setInput((prev) => ({ ...prev, [field]: value }));

  const apiInput = {
    area: input.area,
    areaUnit: input.areaUnit,
    plantsPerUnit: input.plantsPerUnit,
    yieldPerPlantKg: input.yieldPerPlantKg,
    survivalRate: input.survivalRate / 100,
  };

  const error = validateCropYieldInput(apiInput);
  const result = error ? null : calculateCropYield(apiInput);

  const unitLabel = AREA_UNIT_LABELS.find((u) => u.key === input.areaUnit)!.label;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel
          title="Field Details"
          icon={<Wheat className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="cy-area">Field Area</Label>
              <Input
                id="cy-area"
                type="number"
                min={0}
                step="any"
                value={input.area}
                onChange={(e) => update("area", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {AREA_UNIT_LABELS.map((u) => (
                  <Button
                    key={u.key}
                    variant={input.areaUnit === u.key ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => update("areaUnit", u.key)}
                  >
                    {u.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="cy-density">Plants per {unitLabel.replace("²", "²")}</Label>
              <Input
                id="cy-density"
                type="number"
                min={1}
                value={input.plantsPerUnit}
                onChange={(e) => update("plantsPerUnit", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="cy-perplant">Average yield per plant (kg)</Label>
              <Input
                id="cy-perplant"
                type="number"
                min={0}
                step="any"
                value={input.yieldPerPlantKg}
                onChange={(e) => update("yieldPerPlantKg", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="cy-survival">
                Plants that reach harvest: {input.survivalRate}%
              </Label>
              <input
                id="cy-survival"
                type="range"
                min={10}
                max={100}
                step={5}
                value={input.survivalRate}
                onChange={(e) => update("survivalRate", parseInt(e.target.value, 10))}
                className="w-full mt-2 accent-primary"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="pt-2">
              <ResetButton onClick={() => setInput(DEFAULT_INPUT)} />
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          <ToolResultPanel
            title="Estimated Production"
            icon={<Wheat className="h-5 w-5" />}
            isEmpty={!result}
            empty="Enter field details to estimate yield."
          >
            {result && (
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {result.totalYieldTonnes.toLocaleString()}{" "}
                  <span className="text-2xl">tonnes</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.totalYieldKg.toLocaleString()} kg from{" "}
                  {result.totalPlants.toLocaleString()} plants
                </p>
              </div>
            )}
          </ToolResultPanel>

          {result && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.yieldPerUnit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">kg per {unitLabel.replace(/[s²]/g, (m) => (m === "²" ? "²" : ""))}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.yieldPerAcre.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">kg per acre</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.yieldPerHectare.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">kg per hectare</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">How this is calculated</p>
                    <Badge variant="outline">
                      {input.areaUnit === "m2" ? "m² basis" : `${input.areaUnit} basis`}
                    </Badge>
                  </div>
                  <p>
                    <strong>Total plants</strong> = {input.area} {unitLabel} ×{" "}
                    {input.plantsPerUnit.toLocaleString()} plants/{unitLabel} ×{" "}
                    {input.survivalRate}% survival = {result.totalPlants.toLocaleString()}
                  </p>
                  <p>
                    <strong>Total yield</strong> = {result.totalPlants.toLocaleString()} plants ×{" "}
                    {input.yieldPerPlantKg} kg/plant = {result.totalYieldKg.toLocaleString()} kg
                  </p>
                  <p>
                    Field size: {result.areaM2.toLocaleString()} m²
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
