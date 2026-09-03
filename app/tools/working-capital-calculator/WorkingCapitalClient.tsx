"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Building2, TrendingUp, AlertTriangle } from "lucide-react";
import { calculateWorkingCapital, validateWorkingCapitalInput } from "@/lib/tools/working-capital-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkingCapitalClientProps {}

export default function WorkingCapitalClient(props: WorkingCapitalClientProps) {
  const tool = getTool("working-capital-calculator")!;
  const [currentAssets, setCurrentAssets] = React.useState(250000);
  const [currentLiabilities, setCurrentLiabilities] = React.useState(150000);
  const [inventory, setInventory] = React.useState(50000);
  const [prepaidExpenses, setPrepaidExpenses] = React.useState(10000);

  const result = React.useMemo(() => {
    const err = validateWorkingCapitalInput({ currentAssets, currentLiabilities, inventory, prepaidExpenses });
    if (err) return null;
    return calculateWorkingCapital({ currentAssets, currentLiabilities, inventory, prepaidExpenses });
  }, [currentAssets, currentLiabilities, inventory, prepaidExpenses]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Financial Data" icon={<Building2 className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Current Assets ($)</Label><Input type="number" min={0} value={currentAssets} onChange={(e) => setCurrentAssets(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Current Liabilities ($)</Label><Input type="number" min={0} value={currentLiabilities} onChange={(e) => setCurrentLiabilities(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Inventory ($)</Label><Input type="number" min={0} value={inventory} onChange={(e) => setInventory(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Prepaid Expenses ($)</Label><Input type="number" min={0} value={prepaidExpenses} onChange={(e) => setPrepaidExpenses(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className={cn("border-2", result.isHealthy ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5")}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Net Working Capital</CardTitle>
                    <Badge variant={result.isHealthy ? "default" : "destructive"} className={cn(result.isHealthy && "bg-green-500")}>
                      {result.isHealthy ? "Healthy" : "At Risk"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={cn("text-5xl font-bold", result.netWorkingCapital >= 0 ? "text-primary" : "text-destructive")}>
                    ${result.netWorkingCapital.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{result.assessment}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Card><CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{result.currentRatio}</p><p className="text-xs text-muted-foreground">Current Ratio</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{result.quickRatio}</p><p className="text-xs text-muted-foreground">Quick Ratio</p>
                </CardContent></Card>
                <Card><CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{(result.workingCapitalRatio * 100).toFixed(1)}%</p><p className="text-xs text-muted-foreground">Working Capital %</p>
                </CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Recommendation</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{result.recommendation}</p></CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formulas</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Net Working Capital</strong> = Current Assets − Current Liabilities = ${currentAssets.toLocaleString()} − ${currentLiabilities.toLocaleString()} = ${result.netWorkingCapital.toLocaleString()}</p>
                  <p><strong>Current Ratio</strong> = Current Assets ÷ Current Liabilities = {result.currentRatio}</p>
                  <p><strong>Quick Ratio</strong> = (Current Assets − Inventory − Prepaids) ÷ Current Liabilities = {result.quickRatio}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
