"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { PiggyBank } from "lucide-react";
import { calculateSip, validateSipInput } from "@/lib/tools/sip-calculator";
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
  monthlyInvestment: 5000,
  annualReturn: 12,
  years: 10,
};

const TENURE_PRESETS = [
  { label: "5 yrs", years: 5 },
  { label: "10 yrs", years: 10 },
  { label: "15 yrs", years: 15 },
  { label: "20 yrs", years: 20 },
];

export default function SipCalculatorClient() {
  const tool = getTool("sip-calculator")!;
  const [input, setInput] = React.useState(DEFAULT_INPUT);

  const error = validateSipInput(input);

  const result = React.useMemo(() => {
    if (validateSipInput(input)) return null;
    return calculateSip(input);
  }, [input]);

  const update = (field: string, value: number) =>
    setInput((prev) => ({ ...prev, [field]: value }));

  const investedPct =
    result && result.futureValue > 0
      ? (result.totalInvested / result.futureValue) * 100
      : 0;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel
          title="SIP Details"
          icon={<PiggyBank className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="sip-monthly">Monthly Investment</Label>
              <Input
                id="sip-monthly"
                type="number"
                min={1}
                value={input.monthlyInvestment}
                onChange={(e) => update("monthlyInvestment", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="sip-return">Expected Annual Return (%)</Label>
              <Input
                id="sip-return"
                type="number"
                step={0.5}
                min={0}
                max={60}
                value={input.annualReturn}
                onChange={(e) => update("annualReturn", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="sip-years">Investment Period (years)</Label>
              <Input
                id="sip-years"
                type="number"
                min={1}
                max={60}
                value={input.years}
                onChange={(e) => update("years", parseInt(e.target.value, 10) || 0)}
                className="mt-1.5"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TENURE_PRESETS.map((t) => (
                  <Button
                    key={t.years}
                    variant={input.years === t.years ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => update("years", t.years)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="pt-2">
              <ResetButton onClick={() => setInput(DEFAULT_INPUT)} />
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          <ToolResultPanel
            title="Estimated Future Value"
            icon={<PiggyBank className="h-5 w-5" />}
            isEmpty={!result}
            empty="Enter SIP details to see projected returns."
          >
            {result && (
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {result.futureValue.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.growthMultiple}× your invested amount
                </p>
              </div>
            )}
          </ToolResultPanel>

          {result && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.totalInvested.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Invested</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-green-600">
                      {result.estimatedReturns.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Estimated Returns</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Invested {Math.round(investedPct)}%</span>
                    <span className="text-green-600">
                      Returns {Math.round(100 - investedPct)}%
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div className="bg-primary" style={{ width: `${investedPct}%` }} />
                    <div className="bg-green-500" style={{ width: `${100 - investedPct}%` }} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium">Yearly Growth</p>
                    <Badge variant="outline">{result.yearlySchedule.length} years</Badge>
                  </div>
                  <div className="overflow-x-auto max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="py-2 pr-3">Year</th>
                          <th className="py-2 pr-3">Invested</th>
                          <th className="py-2 pr-3">Gain</th>
                          <th className="py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearlySchedule.map((y) => (
                          <tr key={y.year} className="border-b last:border-0">
                            <td className="py-1.5 pr-3">{y.year}</td>
                            <td className="py-1.5 pr-3">{y.invested.toLocaleString()}</td>
                            <td className="py-1.5 pr-3 text-green-600">
                              {y.gain.toLocaleString()}
                            </td>
                            <td className="py-1.5 font-medium">{y.value.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
