"use client";

import * as React from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { getTool } from "@/lib/registry";
import { calculateForexMargin, validateForexInput, COMMON_LEVERAGES, COMMON_LOT_SIZES } from "@/lib/tools/forex-margin";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tool = getTool("forex-margin-calculator")!;

const FAQ = [
  { question: "What is margin in forex?", answer: "Margin is the amount of money required to open and maintain a position. It's a percentage of the total position size determined by your leverage ratio." },
  { question: "How does leverage affect margin?", answer: "Higher leverage means less margin required. With 1:100 leverage, you need 1% of the position value as margin. With 1:500, you only need 0.2%." },
  { question: "What is a pip?", answer: "A pip is the smallest standard price movement in a currency pair. For most pairs, it's 0.0001 (the 4th decimal). For JPY pairs, it's 0.01 (the 2nd decimal)." },
  { question: "What is margin level?", answer: "Margin level = (Equity ÷ Used Margin) × 100. Brokers typically require a minimum of 100-150%. Below this level, you may receive a margin call or have positions closed automatically." },
];

export default function ForexMarginPage() {
  const [input, setInput] = React.useState({
    accountBalance: 10000,
    leverage: 100,
    pair: "EUR/USD",
    lotSize: 1.0,
    entryPrice: 1.0850,
    exitPrice: 1.0900,
  });

  const result = React.useMemo(() => {
    if (validateForexInput(input)) return null;
    return calculateForexMargin(input);
  }, [input]);

  const update = (field: string, value: string | number) => setInput(prev => ({ ...prev, [field]: value }));

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Trade Parameters" icon={<TrendingUp className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div><Label>Account Balance ($)</Label><Input type="number" min={0} value={input.accountBalance} onChange={(e) => update("accountBalance", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Currency Pair</Label><Input value={input.pair} onChange={(e) => update("pair", e.target.value)} placeholder="EUR/USD" className="mt-1.5" /></div>
            <div><Label>Leverage</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_LEVERAGES.map(l => (
                  <Button key={l} variant={input.leverage === l ? "default" : "outline"} size="sm" className="text-xs" onClick={() => update("leverage", l)}>1:{l}</Button>
                ))}
              </div>
            </div>
            <div><Label>Lot Size</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {COMMON_LOT_SIZES.map(l => (
                  <Button key={l.value} variant={input.lotSize === l.value ? "default" : "outline"} size="sm" className="text-xs" onClick={() => update("lotSize", l.value)}>{l.label}</Button>
                ))}
              </div>
            </div>
            <div><Label>Entry Price</Label><Input type="number" step={0.0001} min={0} value={input.entryPrice} onChange={(e) => update("entryPrice", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Exit Price <span className="text-muted-foreground text-xs">(optional)</span></Label><Input type="number" step={0.0001} min={0} value={input.exitPrice || ""} onChange={(e) => update("exitPrice", parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2"><CardTitle className="text-lg">Margin Required</CardTitle></CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">${result.marginRequired.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground mt-2">{input.lotSize} lot(s) of {input.pair} at 1:{input.leverage} leverage</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.pipValue}</p><p className="text-xs text-muted-foreground">Pip Value</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.pipDifference}</p><p className="text-xs text-muted-foreground">Pip Difference</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.marginLevel.toFixed(0)}%</p><p className="text-xs text-muted-foreground">Margin Level</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className={`text-xl font-bold ${result.profitLoss >= 0 ? "text-green-500" : "text-destructive"}`}>${result.profitLoss.toLocaleString()}</p><p className="text-xs text-muted-foreground">Profit/Loss</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Trade Details</CardTitle></CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Position Size</span><span className="font-medium">{result.positionSize.toLocaleString()} units</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Free Margin</span><span className="font-medium">${result.freeMargin.toLocaleString()}</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Risk</span><span className="font-medium">{result.riskPercentage}%</span></div>
                  <div className="flex justify-between p-2 rounded bg-muted/50"><span className="text-muted-foreground">Leverage</span><span className="font-medium">1:{input.leverage}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Margin</strong> = Position Size ÷ Leverage = {result.positionSize.toLocaleString()} ÷ {input.leverage} = ${result.marginRequired.toLocaleString()}</p>
                  <p><strong>Pip Value</strong> = {"1 pip per lot"} × Lot Size = ${result.pipValue}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
