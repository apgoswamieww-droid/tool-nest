"use client";

import * as React from "react";
import { Flame, TrendingUp, Clock, Target } from "lucide-react";
import { getTool } from "@/lib/registry";
import { calculateFire, validateFireInput, FireInput, FIRE_PRESETS } from "@/lib/tools/fire-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tool = getTool("fire-calculator")!;

const FAQ_ITEMS = [
  {
    question: "What is FIRE?",
    answer:
      "FIRE stands for Financial Independence, Retire Early. It's a movement where people save and invest aggressively to achieve financial freedom much earlier than the traditional retirement age.",
  },
  {
    question: "What is the 4% rule?",
    answer:
      "The 4% rule suggests you can safely withdraw 4% of your investment portfolio each year in retirement without running out of money over a 30-year period. Your FIRE number is 25 times your annual expenses.",
  },
  {
    question: "What is Coast FIRE?",
    answer:
      "Coast FIRE is the point where your current savings, if left to grow with compound interest until traditional retirement age, will be enough for retirement. You only need to cover current expenses.",
  },
  {
    question: "What is Barista FIRE?",
    answer:
      "Barista FIRE means you have enough savings to cover part of your expenses through investment income, but you still work a part-time job (like at a coffee shop) to cover the rest and maintain benefits.",
  },
  {
    question: "How much do I need to save for FIRE?",
    answer:
      "It depends on your annual expenses and savings rate. Higher savings rates (50%+) dramatically reduce the years needed. The FIRE calculator shows your exact timeline based on your inputs.",
  },
];

export default function FireCalculatorPage() {
  const [input, setInput] = React.useState<FireInput>({
    currentAge: 30,
    retirementAge: 50,
    currentSavings: 100000,
    annualExpenses: 40000,
    annualIncome: 80000,
    expectedReturnRate: 7,
    inflationRate: 3,
    safeWithdrawalRate: 4,
  });

  const [error, setError] = React.useState<string | null>(null);

  const result = React.useMemo(() => {
    const validationError = validateFireInput(input);
    if (validationError) {
      setError(validationError);
      return null;
    }
    setError(null);
    return calculateFire(input);
  }, [input]);

  const applyPreset = (preset: keyof typeof FIRE_PRESETS) => {
    setInput((prev) => ({
      ...prev,
      ...FIRE_PRESETS[preset],
    }));
  };

  const updateField = (field: keyof FireInput, value: number) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ_ITEMS}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Your Financial Details"
          icon={<Flame className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="current-age">Current Age</Label>
                <Input
                  id="current-age"
                  type="number"
                  min={1}
                  max={120}
                  value={input.currentAge}
                  onChange={(e) => updateField("currentAge", parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="retirement-age">Retirement Age</Label>
                <Input
                  id="retirement-age"
                  type="number"
                  min={1}
                  max={120}
                  value={input.retirementAge}
                  onChange={(e) => updateField("retirementAge", parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="current-savings">Current Savings ($)</Label>
              <Input
                id="current-savings"
                type="number"
                min={0}
                value={input.currentSavings}
                onChange={(e) => updateField("currentSavings", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="annual-income">Annual Income ($)</Label>
              <Input
                id="annual-income"
                type="number"
                min={0}
                value={input.annualIncome}
                onChange={(e) => updateField("annualIncome", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="annual-expenses">Annual Expenses ($)</Label>
              <Input
                id="annual-expenses"
                type="number"
                min={0}
                value={input.annualExpenses}
                onChange={(e) => updateField("annualExpenses", parseInt(e.target.value) || 0)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="return-rate">Return Rate (%)</Label>
                <Input
                  id="return-rate"
                  type="number"
                  step={0.5}
                  min={0}
                  max={50}
                  value={input.expectedReturnRate}
                  onChange={(e) => updateField("expectedReturnRate", parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="inflation">Inflation (%)</Label>
                <Input
                  id="inflation"
                  type="number"
                  step={0.5}
                  min={0}
                  max={20}
                  value={input.inflationRate}
                  onChange={(e) => updateField("inflationRate", parseFloat(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="swr">Safe Withdrawal Rate (%)</Label>
              <Input
                id="swr"
                type="number"
                step={0.5}
                min={1}
                max={10}
                value={input.safeWithdrawalRate}
                onChange={(e) => updateField("safeWithdrawalRate", parseFloat(e.target.value) || 4)}
                className="mt-1"
              />
            </div>

            {/* Presets */}
            <div>
              <Label className="text-xs">Risk Presets</Label>
              <div className="flex gap-2 mt-1.5">
                {Object.keys(FIRE_PRESETS).map((key) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(key as keyof typeof FIRE_PRESETS)}
                    className="text-xs capitalize"
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ToolInputPanel>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {error ? (
            <Card className="border-destructive/30">
              <CardContent className="p-6 text-center text-destructive">
                {error}
              </CardContent>
            </Card>
          ) : result && (
            <>
              {/* Main FIRE Number */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your FIRE Number</CardTitle>
                    {result.isAlreadyFIRE && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        🎉 Already FIRE!
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">
                    ${result.fireNumber.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    You need ${result.fireNumber.toLocaleString()} invested to cover ${input.annualExpenses.toLocaleString()}/year expenses at a {input.safeWithdrawalRate}% withdrawal rate.
                  </p>
                </CardContent>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold">{result.yearsToFire}</p>
                    <p className="text-xs text-muted-foreground">Years to FIRE</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold">{result.ageAtFire}</p>
                    <p className="text-xs text-muted-foreground">Age at FIRE</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold">{result.currentSavingsRate}%</p>
                    <p className="text-xs text-muted-foreground">Savings Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Flame className="h-5 w-5 text-primary mx-auto mb-1" />
                    <p className="text-2xl font-bold">${result.monthlyPassiveIncome.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Monthly Passive</p>
                  </CardContent>
                </Card>
              </div>

              {/* FIRE Milestones */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">FIRE Milestones</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Coast FIRE</p>
                      <p className="text-xs text-muted-foreground">
                        Save this amount now and let it grow to FIRE by retirement age
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      ${result.coastFireNumber.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Barista FIRE</p>
                      <p className="text-xs text-muted-foreground">
                        Enough to cover half your expenses passively
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      ${result.baristaFireNumber.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">Monthly Savings Needed</p>
                      <p className="text-xs text-muted-foreground">
                        Amount to save each month to reach FIRE
                      </p>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      ${result.monthlySavings.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
