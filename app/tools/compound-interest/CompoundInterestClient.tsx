"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { TrendingUp } from "lucide-react";
import {
  calculateCompoundInterest,
  validateCompoundInput,
  PERIODS_PER_YEAR,
  type CompoundingFrequency,
} from "@/lib/tools/compound-interest";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FREQUENCIES: { key: CompoundingFrequency; label: string }[] = [
  { key: "annually", label: "Annually" },
  { key: "semi-annually", label: "Semi-annually" },
  { key: "quarterly", label: "Quarterly" },
  { key: "monthly", label: "Monthly" },
  { key: "daily", label: "Daily" },
];

const DEFAULT_INPUT = {
  principal: 10000,
  annualRate: 7,
  years: 10,
  frequency: "monthly" as CompoundingFrequency,
  contributionPerPeriod: 100,
};

export default function CompoundInterestClient() {
  const tool = getTool("compound-interest")!;
  const [input, setInput] = React.useState(DEFAULT_INPUT);

  const error = validateCompoundInput(input);

  const result = React.useMemo(() => {
    if (validateCompoundInput(input)) return null;
    return calculateCompoundInterest(input);
  }, [input]);

  const update = (field: string, value: number | string) =>
    setInput((prev) => ({ ...prev, [field]: value }));

  const periodsPerYear = PERIODS_PER_YEAR[input.frequency];
  const contributionLabel = `per ${input.frequency === "semi-annually" ? "half-year" : input.frequency.replace("ly", "")}`;

  // Shares of the final amount.
  const investedPct =
    result && result.finalAmount > 0
      ? ((result.totalPrincipal + result.totalContributions) / result.finalAmount) * 100
      : 0;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel
          title="Investment Details"
          icon={<TrendingUp className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="ci-principal">Initial Principal</Label>
              <Input
                id="ci-principal"
                type="number"
                min={0}
                value={input.principal}
                onChange={(e) => update("principal", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="ci-rate">Annual Interest Rate (%)</Label>
              <Input
                id="ci-rate"
                type="number"
                step={0.1}
                min={0}
                value={input.annualRate}
                onChange={(e) => update("annualRate", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="ci-years">Time Period (years)</Label>
              <Input
                id="ci-years"
                type="number"
                min={1}
                max={100}
                value={input.years}
                onChange={(e) => update("years", parseInt(e.target.value, 10) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>Compounding Frequency</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {FREQUENCIES.map((f) => (
                  <Button
                    key={f.key}
                    variant={input.frequency === f.key ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => update("frequency", f.key)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="ci-contrib">
                Contribution ({contributionLabel}, optional)
              </Label>
              <Input
                id="ci-contrib"
                type="number"
                min={0}
                value={input.contributionPerPeriod}
                onChange={(e) => update("contributionPerPeriod", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Added at the end of every {input.frequency.replace("annually", "annual")} period.
              </p>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="pt-2">
              <ResetButton onClick={() => setInput(DEFAULT_INPUT)} />
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          <ToolResultPanel
            title="Future Value"
            icon={<TrendingUp className="h-5 w-5" />}
            isEmpty={!result}
            empty="Enter investment details to see compound growth."
          >
            {result && (
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">
                  {result.finalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {result.effectiveAnnualRate}% effective annual yield
                </p>
              </div>
            )}
          </ToolResultPanel>

          {result && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.totalPrincipal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Principal</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-blue-600">
                      {result.totalContributions.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Contributions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-green-600">
                      {result.totalInterest.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Interest Earned</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>You invest {Math.round(investedPct)}%</span>
                    <span className="text-green-600">Interest {Math.round(100 - investedPct)}%</span>
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
                          <th className="py-2 pr-3">Interest Earned</th>
                          <th className="py-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearlySchedule.map((y) => (
                          <tr key={y.year} className="border-b last:border-0">
                            <td className="py-1.5 pr-3">{y.year}</td>
                            <td className="py-1.5 pr-3">{y.invested.toLocaleString()}</td>
                            <td className="py-1.5 pr-3 text-green-600">
                              {y.interestEarned.toLocaleString()}
                            </td>
                            <td className="py-1.5 font-medium">{y.balance.toLocaleString()}</td>
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
