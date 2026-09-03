"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Users, TrendingUp, AlertTriangle } from "lucide-react";
import { calculateClv, validateClvInput } from "@/lib/tools/clv-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClvCalculatorClientProps {}

export default function ClvCalculatorClient(props: ClvCalculatorClientProps) {
  const tool = getTool("clv-calculator")!;
  const [input, setInput] = React.useState({
    avgPurchaseValue: 50,
    purchaseFrequency: 6,
    customerLifespan: 3,
    acquisitionCost: 30,
    retentionRate: 80,
    discountRate: 10,
    grossMargin: 50,
  });

  const result = React.useMemo(() => {
    if (validateClvInput(input)) return null;
    return calculateClv(input);
  }, [input]);

  const update = (field: string, value: number) => setInput(prev => ({ ...prev, [field]: value }));

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Customer Data" icon={<Users className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Avg Purchase Value ($)</Label><Input type="number" min={0} value={input.avgPurchaseValue} onChange={(e) => update("avgPurchaseValue", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Purchases per Year</Label><Input type="number" min={0} value={input.purchaseFrequency} onChange={(e) => update("purchaseFrequency", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Customer Lifespan (years)</Label><Input type="number" min={1} value={input.customerLifespan} onChange={(e) => update("customerLifespan", parseFloat(e.target.value) || 1)} className="mt-1.5" /></div>
            <div><Label>Acquisition Cost ($)</Label><Input type="number" min={0} value={input.acquisitionCost} onChange={(e) => update("acquisitionCost", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Retention %</Label><Input type="number" min={0} max={100} value={input.retentionRate} onChange={(e) => update("retentionRate", parseFloat(e.target.value) || 0)} className="mt-1" /></div>
              <div><Label>Discount %</Label><Input type="number" min={0} max={100} value={input.discountRate} onChange={(e) => update("discountRate", parseFloat(e.target.value) || 0)} className="mt-1" /></div>
              <div><Label>Margin %</Label><Input type="number" min={0} max={100} value={input.grossMargin} onChange={(e) => update("grossMargin", parseFloat(e.target.value) || 0)} className="mt-1" /></div>
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Customer Lifetime Value</CardTitle>
                    <Badge variant={result.isHealthy ? "default" : "destructive"} className={cn(result.isHealthy && "bg-green-500")}>{result.assessment}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">${result.adjustedClv.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-2">Adjusted CLV (accounting for margin, retention, and discount rate)</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.basicClv.toLocaleString()}</p><p className="text-xs text-muted-foreground">Basic CLV</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.clvToCacRatio}x</p><p className="text-xs text-muted-foreground">CLV:CAC Ratio</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.paybackPeriod} mo</p><p className="text-xs text-muted-foreground">CAC Payback</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.monthlyRevenue.toLocaleString()}</p><p className="text-xs text-muted-foreground">Monthly Revenue</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formulas</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Basic CLV</strong> = APV × Frequency × Lifespan = ${input.avgPurchaseValue} × {input.purchaseFrequency} × {input.customerLifespan} = ${result.basicClv.toLocaleString()}</p>
                  <p><strong>Adjusted CLV</strong> = (Annual Rev × Margin × Retention) ÷ (1 + Discount − Retention) = ${result.adjustedClv.toLocaleString()}</p>
                  <p><strong>CLV:CAC</strong> = Adjusted CLV ÷ CAC = ${result.adjustedClv.toLocaleString()} ÷ ${input.acquisitionCost} = {result.clvToCacRatio}x</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
