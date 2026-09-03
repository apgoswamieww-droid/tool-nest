"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Target, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { calculateRoas, validateRoasInput, ROAS_BENCHMARKS } from "@/lib/tools/roas-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RoasCalculatorClientProps {}

export default function RoasCalculatorClient(props: RoasCalculatorClientProps) {
  const tool = getTool("roas-calculator")!;
  const [adSpend, setAdSpend] = React.useState(1000);
  const [revenue, setRevenue] = React.useState(4500);
  const [totalCosts, setTotalCosts] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const result = React.useMemo(() => {
    const err = validateRoasInput({ adSpend, revenue, totalCosts });
    if (err) { setError(err); return null; }
    setError(null);
    return calculateRoas({ adSpend, revenue, totalCosts });
  }, [adSpend, revenue, totalCosts]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Campaign Data" icon={<Target className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <Label htmlFor="ad-spend">Ad Spend ($)</Label>
              <Input id="ad-spend" type="number" min={0} value={adSpend} onChange={(e) => setAdSpend(parseFloat(e.target.value) || 0)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="revenue">Revenue Generated ($)</Label>
              <Input id="revenue" type="number" min={0} value={revenue} onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="total-costs">Other Costs ($) <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="total-costs" type="number" min={0} value={totalCosts} onChange={(e) => setTotalCosts(parseFloat(e.target.value) || 0)} className="mt-1.5" />
            </div>
            <Button onClick={() => calculateRoas({ adSpend, revenue, totalCosts })} className="w-full">
              Calculate ROAS
            </Button>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {error ? (
            <Card className="border-destructive/30"><CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2"><AlertTriangle className="h-5 w-5" />{error}</CardContent></Card>
          ) : result && (
            <>
              <Card className={cn("border-2", result.rating === "excellent" ? "border-green-500/30 bg-green-500/5" : result.rating === "good" ? "border-green-500/20 bg-green-500/5" : result.rating === "break-even" ? "border-yellow-500/30 bg-yellow-500/5" : "border-red-500/30 bg-red-500/5")}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Return on Ad Spend</CardTitle>
                    <Badge variant={result.rating === "poor" ? "destructive" : "default"} className={cn(result.rating === "excellent" && "bg-green-500", result.rating === "good" && "bg-green-600")}>
                      {ROAS_BENCHMARKS[result.rating].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">{result.roas}x</div>
                  <p className="text-sm text-muted-foreground mt-2">For every $1 spent on ads, you earn ${result.roas} in revenue</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center">
                  <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">{result.roi}%</p>
                  <p className="text-xs text-muted-foreground">ROI</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <DollarSign className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">${result.profit.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Profit</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <Target className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">{result.breakevenRoas}x</p>
                  <p className="text-xs text-muted-foreground">Breakeven ROAS</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <DollarSign className="h-4 w-4 text-primary mx-auto mb-1" />
                  <p className="text-xl font-bold">${adSpend.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Ad Spend</p>
                </CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formula Used</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>ROAS</strong> = Revenue ÷ Ad Spend = ${revenue.toLocaleString()} ÷ ${adSpend.toLocaleString()} = {result.roas}x</p>
                  <p><strong>ROI</strong> = (Profit ÷ Total Cost) × 100 = ({result.profit.toLocaleString()} ÷ {(adSpend + totalCosts).toLocaleString()}) × 100 = {result.roi}%</p>
                  <p><strong>Breakeven ROAS</strong> = Total Cost ÷ Ad Spend = {(adSpend + totalCosts).toLocaleString()} ÷ ${adSpend.toLocaleString()} = {result.breakevenRoas}x</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
