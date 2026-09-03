"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Lightbulb, Plus, Trash2, AlertTriangle } from "lucide-react";
import { calculateElectricity, validateElectricityInput, COMMON_APPLIANCES, ApplianceEntry } from "@/lib/tools/electricity-bill";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RATING_COLORS: Record<string, string> = {
  excellent: "bg-green-500",
  good: "bg-green-600",
  average: "bg-yellow-500",
  high: "bg-orange-500",
  "very-high": "bg-red-500",
};

interface ElectricityBillClientProps {}

export default function ElectricityBillClient(props: ElectricityBillClientProps) {
  const tool = getTool("electricity-bill")!;
  const [appliances, setAppliances] = React.useState<ApplianceEntry[]>(COMMON_APPLIANCES.slice(0, 4));
  const [ratePerKwh, setRatePerKwh] = React.useState(0.16);

  const [newName, setNewName] = React.useState("");
  const [newWattage, setNewWattage] = React.useState(100);
  const [newHours, setNewHours] = React.useState(8);
  const [newQty, setNewQty] = React.useState(1);

  const result = React.useMemo(() => {
    if (validateElectricityInput({ appliances, ratePerKwh, currency: "$" })) return null;
    return calculateElectricity({ appliances, ratePerKwh, currency: "$" });
  }, [appliances, ratePerKwh]);

  const addAppliance = () => {
    if (!newName.trim()) return;
    setAppliances(prev => [...prev, { name: newName.trim(), wattage: newWattage, hoursPerDay: newHours, quantity: newQty }]);
    setNewName(""); setNewWattage(100); setNewHours(8); setNewQty(1);
  };

  const removeAppliance = (i: number) => setAppliances(prev => prev.filter((_, idx) => idx !== i));

  const addPreset = (preset: ApplianceEntry) => setAppliances(prev => [...prev, { ...preset }]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ToolInputPanel title="Appliances & Rate" icon={<Lightbulb className="h-5 w-5" />} className="lg:col-span-1">
          <div className="space-y-4">
            <div>
              <Label>Electricity Rate ($/kWh)</Label>
              <Input type="number" step={0.01} min={0} value={ratePerKwh} onChange={(e) => setRatePerKwh(parseFloat(e.target.value) || 0)} className="mt-1.5" />
              <p className="text-xs text-muted-foreground mt-1">US average: $0.16/kWh</p>
            </div>

            <div>
              <Label>Your Appliances</Label>
              <div className="space-y-1.5 mt-1.5 max-h-48 overflow-auto">
                {appliances.map((a, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                    <span className="truncate flex-1">{a.name} ({a.wattage}W × {a.hoursPerDay}h × {a.quantity})</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" onClick={() => removeAppliance(i)}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Appliance name" onKeyDown={(e) => e.key === "Enter" && addAppliance()} className="text-xs" />
              <div className="grid grid-cols-3 gap-2">
                <div><Label className="text-xs">Watts</Label><Input type="number" min={1} value={newWattage} onChange={(e) => setNewWattage(parseInt(e.target.value) || 1)} className="text-xs mt-0.5" /></div>
                <div><Label className="text-xs">Hours/day</Label><Input type="number" min={0} max={24} value={newHours} onChange={(e) => setNewHours(parseInt(e.target.value) || 0)} className="text-xs mt-0.5" /></div>
                <div><Label className="text-xs">Qty</Label><Input type="number" min={1} value={newQty} onChange={(e) => setNewQty(parseInt(e.target.value) || 1)} className="text-xs mt-0.5" /></div>
              </div>
              <Button size="sm" onClick={addAppliance} className="w-full"><Plus className="h-3 w-3" /> Add</Button>
            </div>

            <div>
              <Label className="text-xs">Quick Add</Label>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_APPLIANCES.slice(0, 4).map((p, i) => (
                  <button key={i} className="text-xs text-primary hover:underline" onClick={() => addPreset(p)}>+{p.name}</button>
                ))}
              </div>
            </div>
          </div>
        </ToolInputPanel>

        <div className="lg:col-span-2 space-y-4">
          {result && (
            <>
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Estimated Monthly Bill</CardTitle>
                    <Badge variant="default" className={cn(RATING_COLORS[result.energyRating])}>{result.energyRating.replace("-", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">${result.monthlyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                  <p className="text-sm text-muted-foreground mt-2">{result.totalKwhPerMonth} kWh/month • ${result.yearlyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}/year</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">${result.dailyCost.toFixed(2)}</p><p className="text-xs text-muted-foreground">Daily Cost</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.totalKwhPerMonth}</p><p className="text-xs text-muted-foreground">kWh / Month</p></CardContent></Card>
                <Card><CardContent className="p-3 text-center"><p className="text-xl font-bold">{result.totalWatts}W</p><p className="text-xs text-muted-foreground">Total Wattage</p></CardContent></Card>
              </div>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Cost Breakdown by Appliance</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {result.applianceBreakdown.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-sm text-muted-foreground">${item.costPerMonth.toFixed(2)}/mo ({item.percentage}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary/60" style={{ width: `${item.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Daily kWh</strong> = Σ (Wattage × Hours × Quantity) ÷ 1000 = {result.totalKwhPerDay} kWh</p>
                  <p><strong>Monthly Cost</strong> = Daily kWh × 30 × Rate = {result.totalKwhPerDay} × 30 × ${ratePerKwh} = ${result.monthlyCost.toFixed(2)}</p>
                  <p><strong>Yearly Cost</strong> = Monthly × 12 = ${result.yearlyCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
