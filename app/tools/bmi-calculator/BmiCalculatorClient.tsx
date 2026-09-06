"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Scale, Info } from "lucide-react";
import {
  calculateBmi,
  validateBmiInput,
  lbToKg,
  ftInToCm,
} from "@/lib/tools/bmi-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type UnitSystem = "metric" | "imperial";

const CATEGORIES = [
  { label: "Underweight", max: 18.5, color: "bg-sky-400" },
  { label: "Normal", max: 25, color: "bg-green-500" },
  { label: "Overweight", max: 30, color: "bg-yellow-400" },
  { label: "Obese", max: Infinity, color: "bg-red-500" },
];

function categoryColor(bmi: number): string {
  if (bmi < 18.5) return "text-sky-500";
  if (bmi < 25) return "text-green-600";
  if (bmi < 30) return "text-yellow-500";
  return "text-red-500";
}

export default function BmiCalculatorClient() {
  const tool = getTool("bmi-calculator")!;
  const [system, setSystem] = React.useState<UnitSystem>("metric");
  const [weightKg, setWeightKg] = React.useState("70");
  const [heightCm, setHeightCm] = React.useState("175");
  const [weightLb, setWeightLb] = React.useState("154");
  const [feet, setFeet] = React.useState("5");
  const [inches, setInches] = React.useState("9");

  const input = React.useMemo(() => {
    if (system === "metric") {
      return { weightKg: parseFloat(weightKg) || 0, heightCm: parseFloat(heightCm) || 0 };
    }
    return {
      weightKg: lbToKg(parseFloat(weightLb) || 0),
      heightCm: ftInToCm(parseFloat(feet) || 0, parseFloat(inches) || 0),
    };
  }, [system, weightKg, heightCm, weightLb, feet, inches]);

  const error = validateBmiInput(input);
  const result = error ? null : calculateBmi(input);

  // Position on the 0–40 scale bar.
  const pos = result ? Math.min(40, Math.max(10, result.bmi)) : 0;
  const posPct = ((pos - 10) / 30) * 100;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="Your Body Measurements" icon={<Scale className="h-5 w-5" />}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={system === "metric" ? "default" : "outline"}
                size="sm"
                onClick={() => setSystem("metric")}
              >
                Metric (kg/cm)
              </Button>
              <Button
                variant={system === "imperial" ? "default" : "outline"}
                size="sm"
                onClick={() => setSystem("imperial")}
              >
                Imperial (lb/ft)
              </Button>
            </div>

            {system === "metric" ? (
              <>
                <div>
                  <Label htmlFor="bmi-weight">Weight (kg)</Label>
                  <Input
                    id="bmi-weight"
                    type="number"
                    min={1}
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="bmi-height">Height (cm)</Label>
                  <Input
                    id="bmi-height"
                    type="number"
                    min={1}
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="bmi-weight-lb">Weight (lb)</Label>
                  <Input
                    id="bmi-weight-lb"
                    type="number"
                    min={1}
                    value={weightLb}
                    onChange={(e) => setWeightLb(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <div className="flex gap-2 mt-1.5">
                    <div className="flex-1">
                      <Input
                        aria-label="Height feet"
                        type="number"
                        min={0}
                        value={feet}
                        onChange={(e) => setFeet(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">feet</p>
                    </div>
                    <div className="flex-1">
                      <Input
                        aria-label="Height inches"
                        type="number"
                        min={0}
                        max={11}
                        value={inches}
                        onChange={(e) => setInches(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">inches</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="pt-2">
              <ResetButton
                onClick={() => {
                  setSystem("metric");
                  setWeightKg("70");
                  setHeightCm("175");
                  setWeightLb("154");
                  setFeet("5");
                  setInches("9");
                }}
              />
            </div>
          </div>
        </ToolInputPanel>

        <ToolResultPanel
          title="Your BMI"
          icon={<Scale className="h-5 w-5" />}
          isEmpty={!result}
          empty="Enter your weight and height to calculate BMI."
        >
          {result && (
            <div className="space-y-5">
              <div className="text-center">
                <p className={`text-6xl font-bold ${categoryColor(result.bmi)}`}>
                  {result.bmi.toFixed(1)}
                </p>
                <Badge className="mt-2" variant="secondary">
                  {result.category}
                </Badge>
              </div>

              {/* Scale bar 10–40 */}
              <div>
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  <div className="bg-sky-400" style={{ width: "28.33%" }} />
                  <div className="bg-green-500" style={{ width: "21.67%" }} />
                  <div className="bg-yellow-400" style={{ width: "16.67%" }} />
                  <div className="bg-red-500" style={{ width: "33.33%" }} />
                </div>
                <div className="relative h-4">
                  <div
                    className="absolute -top-1 h-6 w-1 rounded bg-foreground"
                    style={{ left: `calc(${posPct}% - 2px)` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>40</span>
                </div>
              </div>

              <div className="rounded-md bg-muted/50 p-3 text-sm">
                <p className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <span>
                    Healthy weight for your height:{" "}
                    <strong>
                      {result.healthyWeightMinKg}–{result.healthyWeightMaxKg} kg
                    </strong>{" "}
                    (BMI 18.5–24.9).
                  </span>
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                BMI is a screening tool, not a diagnostic — it doesn&apos;t account for muscle
                mass or body composition.
              </p>
            </div>
          )}
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
