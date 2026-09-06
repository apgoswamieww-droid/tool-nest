"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Droplets, Info } from "lucide-react";
import {
  calculateIrrigation,
  validateIrrigationInput,
  CROP_LABELS,
  STAGE_LABELS,
  type CropType,
  type GrowthStage,
} from "@/lib/tools/irrigation-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AreaUnit = "m2" | "hectare" | "acre";

const AREA_UNITS: { key: AreaUnit; label: string }[] = [
  { key: "m2", label: "m²" },
  { key: "hectare", label: "hectares" },
  { key: "acre", label: "acres" },
];

const EFFICIENCY_PRESETS = [
  { label: "Drip (~90%)", value: 0.9 },
  { label: "Sprinkler (~75%)", value: 0.75 },
  { label: "Flood (~50%)", value: 0.5 },
];

const DEFAULT_INPUT = {
  crop: "vegetables" as CropType,
  stage: "mid-season" as GrowthStage,
  fieldArea: 1,
  areaUnit: "hectare" as AreaUnit,
  et0MmPerDay: 5,
  efficiency: 0.85,
  flowLitersPerHour: 0,
};

export default function IrrigationCalculatorClient() {
  const tool = getTool("irrigation-calculator")!;
  const [input, setInput] = React.useState(DEFAULT_INPUT);

  const update = (field: string, value: number | string) =>
    setInput((prev) => ({ ...prev, [field]: value }));

  const apiInput = {
    ...input,
    flowLitersPerHour: input.flowLitersPerHour > 0 ? input.flowLitersPerHour : undefined,
  };

  const error = validateIrrigationInput(apiInput);
  const result = error ? null : calculateIrrigation(apiInput);

  const areaLabel = AREA_UNITS.find((u) => u.key === input.areaUnit)!.label;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel
          title="Crop & Field"
          icon={<Droplets className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="ir-crop">Crop type</Label>
              <select
                id="ir-crop"
                value={input.crop}
                onChange={(e) => update("crop", e.target.value)}
                className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {CROP_LABELS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Growth stage</Label>
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {STAGE_LABELS.map((s) => (
                  <Button
                    key={s.key}
                    variant={input.stage === s.key ? "default" : "outline"}
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => update("stage", s.key)}
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ir-area">Field area</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="ir-area"
                  type="number"
                  min={0}
                  step="any"
                  value={input.fieldArea}
                  onChange={(e) => update("fieldArea", parseFloat(e.target.value) || 0)}
                />
                <select
                  aria-label="Area unit"
                  value={input.areaUnit}
                  onChange={(e) => update("areaUnit", e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-transparent px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {AREA_UNITS.map((u) => (
                    <option key={u.key} value={u.key}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="ir-et0">Reference ET0 (mm/day)</Label>
              <Input
                id="ir-et0"
                type="number"
                min={0}
                step={0.1}
                value={input.et0MmPerDay}
                onChange={(e) => update("et0MmPerDay", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Hot summer ≈ 5–7, mild ≈ 3–5, cool/cloudy ≈ 1–3.
              </p>
            </div>

            <div>
              <Label>Irrigation method</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {EFFICIENCY_PRESETS.map((p) => (
                  <Button
                    key={p.label}
                    variant={input.efficiency === p.value ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => update("efficiency", p.value)}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ir-flow">System flow rate (L/hour, optional)</Label>
              <Input
                id="ir-flow"
                type="number"
                min={0}
                value={input.flowLitersPerHour || ""}
                onChange={(e) => update("flowLitersPerHour", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
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
            title="Water Requirement"
            icon={<Droplets className="h-5 w-5" />}
            isEmpty={!result}
            empty="Choose crop, stage, and area to estimate water needs."
          >
            {result && (
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {result.litersPerDay.toLocaleString()}{" "}
                  <span className="text-2xl">L/day</span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.cubicMetersPerDay.toLocaleString()} m³/day ·{" "}
                  {result.litersPerWeek.toLocaleString()} L/week (
                  {result.cubicMetersPerWeek.toLocaleString()} m³)
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <Badge variant="outline">Kc = {result.kc}</Badge>
                  <Badge variant="outline">ETc = {result.etcMmPerDay} mm/day</Badge>
                  <Badge variant="secondary">{result.mmPerWeek} mm/week</Badge>
                </div>
              </div>
            )}
          </ToolResultPanel>

          {result && (
            <>
              {result.hoursPerDayAtFlow !== undefined && (
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">
                      ≈ {result.hoursPerDayAtFlow} hours/day
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      to deliver one day&apos;s water at {input.flowLitersPerHour.toLocaleString()}{" "}
                      L/hour
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground space-y-1.5">
                  <p className="flex items-start gap-2">
                    <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                    <span>
                      Crop water need (ETc) = Kc × ET0 = {result.kc} × {input.et0MmPerDay} ={" "}
                      <strong>{result.etcMmPerDay} mm/day</strong> — that is{" "}
                      {result.etcMmPerDay} liters per m² of field per day.
                    </span>
                  </p>
                  <p>
                    Gross requirement divides by irrigation efficiency, so losses from
                    evaporation, runoff, and uneven application are included.
                  </p>
                  <p>
                    Estimates are for planning only — soil type, rain, and wind change real
                    needs. Adjust with local agronomy advice.
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
