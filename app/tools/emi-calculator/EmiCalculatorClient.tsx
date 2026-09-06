"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Landmark, Wallet } from "lucide-react";
import { calculateEmi, validateEmiInput } from "@/lib/tools/emi-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TENURE_PRESETS = [
  { label: "1 yr", months: 12 },
  { label: "3 yrs", months: 36 },
  { label: "5 yrs", months: 60 },
  { label: "10 yrs", months: 120 },
  { label: "15 yrs", months: 180 },
  { label: "20 yrs", months: 240 },
  { label: "30 yrs", months: 360 },
];

const DEFAULT_INPUT = {
  principal: 1000000,
  annualRate: 8.5,
  tenureMonths: 120,
  processingFee: 0,
};

export default function EmiCalculatorClient() {
  const tool = getTool("emi-calculator")!;
  const [input, setInput] = React.useState(DEFAULT_INPUT);

  const error = validateEmiInput(input);

  const result = React.useMemo(() => {
    if (validateEmiInput(input)) return null;
    return calculateEmi(input);
  }, [input]);

  const update = (field: string, value: number) =>
    setInput((prev) => ({ ...prev, [field]: value }));

  const handleReset = () => setInput(DEFAULT_INPUT);

  const scheduleCsv = React.useMemo(() => {
    if (!result) return "";
    const header = "Month,Payment,Principal,Interest,Balance";
    const rows = result.amortizationSchedule.map(
      (e) => `${e.month},${e.payment},${e.principalPaid},${e.interestPaid},${e.balance}`
    );
    return [header, ...rows].join("\n");
  }, [result]);

  // Principal vs interest share of every rupee paid.
  const principalPct =
    result && result.totalPayment > 0
      ? (input.principal / result.totalPayment) * 100
      : 0;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Loan Details"
          icon={<Landmark className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="emi-principal">Loan Amount</Label>
              <Input
                id="emi-principal"
                type="number"
                min={1}
                value={input.principal || ""}
                onChange={(e) => update("principal", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="emi-rate">Interest Rate (% per year)</Label>
              <Input
                id="emi-rate"
                type="number"
                step={0.05}
                min={0}
                value={input.annualRate}
                onChange={(e) => update("annualRate", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="emi-tenure">Loan Term (months)</Label>
              <Input
                id="emi-tenure"
                type="number"
                min={1}
                max={600}
                value={input.tenureMonths || ""}
                onChange={(e) => update("tenureMonths", parseInt(e.target.value, 10) || 0)}
                className="mt-1.5"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {TENURE_PRESETS.map((t) => (
                  <Button
                    key={t.months}
                    variant={input.tenureMonths === t.months ? "default" : "outline"}
                    size="sm"
                    className="text-xs"
                    onClick={() => update("tenureMonths", t.months)}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="emi-fee">Processing Fee (optional)</Label>
              <Input
                id="emi-fee"
                type="number"
                min={0}
                value={input.processingFee || ""}
                onChange={(e) => update("processingFee", parseFloat(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex items-center gap-2 pt-2">
              <ResetButton onClick={handleReset} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <ToolResultPanel
            title="Monthly EMI"
            icon={<Wallet className="h-5 w-5" />}
            isEmpty={!result}
            empty="Enter valid loan details to see the monthly EMI."
          >
            {result && (
              <div>
                <div className="text-5xl font-bold text-primary">
                  {result.emi.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {input.tenureMonths.toLocaleString()} monthly payments ·{" "}
                  {Math.round((input.tenureMonths / 12) * 10) / 10} years
                </p>
              </div>
            )}
          </ToolResultPanel>

          {result && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.totalPrincipal.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Principal</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold text-orange-500">
                      {result.totalInterest.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Interest</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.totalPayment.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Payment</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 text-center">
                    <p className="text-xl font-bold">{result.totalCost.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Cost (incl. fee)</p>
                  </CardContent>
                </Card>
              </div>

              {/* Principal vs interest split */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-primary inline-block" />
                      Principal {Math.round(principalPct)}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-orange-400 inline-block" />
                      Interest {Math.round(100 - principalPct)}%
                    </span>
                  </div>
                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div className="bg-primary" style={{ width: `${principalPct}%` }} />
                    <div className="bg-orange-400" style={{ width: `${100 - principalPct}%` }} />
                  </div>
                </CardContent>
              </Card>

              {/* Amortization preview */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Amortization Schedule (first 12 months)
                    </CardTitle>
                    <CopyButton text={scheduleCsv} label="Export CSV" size="sm" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="py-2 pr-3">Month</th>
                          <th className="py-2 pr-3">Payment</th>
                          <th className="py-2 pr-3">Principal</th>
                          <th className="py-2 pr-3">Interest</th>
                          <th className="py-2">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.amortizationSchedule.slice(0, 12).map((e) => (
                          <tr key={e.month} className="border-b last:border-0">
                            <td className="py-1.5 pr-3">{e.month}</td>
                            <td className="py-1.5 pr-3">{e.payment.toLocaleString()}</td>
                            <td className="py-1.5 pr-3 text-green-600">
                              {e.principalPaid.toLocaleString()}
                            </td>
                            <td className="py-1.5 pr-3 text-orange-500">
                              {e.interestPaid.toLocaleString()}
                            </td>
                            <td className="py-1.5">{e.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {result.amortizationSchedule.length > 12 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing 12 of {result.amortizationSchedule.length} months · Export CSV for
                      the full schedule
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Yearly breakdown */}
              {result.yearlyBreakdown.length > 1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Yearly Breakdown</CardTitle>
                      <Badge variant="outline">
                        {result.yearlyBreakdown.length}{" "}
                        {result.yearlyBreakdown.length === 1 ? "year" : "years"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-80 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-muted-foreground">
                            <th className="py-2 pr-3">Year</th>
                            <th className="py-2 pr-3">Principal Paid</th>
                            <th className="py-2 pr-3">Interest Paid</th>
                            <th className="py-2">Balance (end of year)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.yearlyBreakdown.map((y) => (
                            <tr key={y.year} className="border-b last:border-0">
                              <td className="py-1.5 pr-3">{y.year}</td>
                              <td className="py-1.5 pr-3 text-green-600">
                                {y.principalPaid.toLocaleString()}
                              </td>
                              <td className="py-1.5 pr-3 text-orange-500">
                                {y.interestPaid.toLocaleString()}
                              </td>
                              <td className="py-1.5">{y.balance.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Formula */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Formula</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p>
                    <strong>EMI</strong> = P × r × (1+r)ⁿ ÷ [(1+r)ⁿ − 1] where P=
                    {input.principal.toLocaleString()}, r={input.annualRate}/12/100, n=
                    {input.tenureMonths}
                  </p>
                  <p>
                    <strong>Total Interest</strong> = EMI × n − P ={" "}
                    {result.totalInterest.toLocaleString()}
                  </p>
                  {(input.processingFee ?? 0) > 0 && (
                    <p>
                      <strong>Total Cost</strong> = Total Payment + Fee ={" "}
                      {result.totalCost.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
