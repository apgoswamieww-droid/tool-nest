"use client";

import * as React from "react";
import {
  BatteryCharging,
  Plus,
  Trash2,
  Zap,
  Clock,
  Battery,
} from "lucide-react";
import { getTool } from "@/lib/registry";
import {
  calculateBackupTime,
  validateBatteryConfig,
  COMMON_LOADS,
  BATTERY_PRESETS,
  BatteryConfig,
  LoadItem,
} from "@/lib/tools/battery-backup-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const tool = getTool("battery-backup-calculator")!;

const FAQ_ITEMS = [
  {
    question: "How do I calculate my UPS backup time?",
    answer:
      "Enter your battery specifications (voltage, Ah rating, count, and type) and add the appliances you want to run during a power cut. The tool calculates the estimated backup time based on total load and battery capacity.",
  },
  {
    question: "What's the difference between lead-acid and lithium batteries?",
    answer:
      "Lead-acid batteries are cheaper but heavier, have 50% depth of discharge, and 85% efficiency. Lithium batteries are lighter, have 80% depth of discharge, 95% efficiency, and last longer but cost more.",
  },
  {
    question: "What is 'Depth of Discharge' (DoD)?",
    answer:
      "DoD is the percentage of a battery's total capacity that can be safely used. Lead-acid batteries should only be discharged to 50%, while lithium batteries can safely go to 80%. Discharging beyond these limits reduces battery life.",
  },
  {
    question: "What size UPS do I need?",
    answer:
      "Calculate your total load in watts (add up wattages of all devices you want on backup), then multiply by the desired backup hours. Divide by the battery's usable capacity (Ah × V × DoD) to find the number of batteries needed.",
  },
];

export default function BatteryBackupCalculatorPage() {
  const [battery, setBattery] = React.useState<BatteryConfig>(BATTERY_PRESETS.medium);
  const [loads, setLoads] = React.useState<LoadItem[]>([
    { name: "LED Light", wattage: 10, quantity: 5 },
    { name: "Ceiling Fan", wattage: 75, quantity: 2 },
    { name: "Wi-Fi Router", wattage: 15, quantity: 1 },
    { name: "Television (LED)", wattage: 100, quantity: 1 },
  ]);
  const [newLoadName, setNewLoadName] = React.useState("");
  const [newLoadWattage, setNewLoadWattage] = React.useState(50);
  const [newLoadQuantity, setNewLoadQuantity] = React.useState(1);

  const result = React.useMemo(() => {
    return calculateBackupTime(battery, loads);
  }, [battery, loads]);

  const addLoad = () => {
    if (!newLoadName.trim()) return;
    setLoads((prev) => [
      ...prev,
      { name: newLoadName.trim(), wattage: newLoadWattage, quantity: newLoadQuantity },
    ]);
    setNewLoadName("");
    setNewLoadWattage(50);
    setNewLoadQuantity(1);
  };

  const removeLoad = (index: number) => {
    setLoads((prev) => prev.filter((_, i) => i !== index));
  };

  const addPresetLoad = (preset: LoadItem) => {
    setLoads((prev) => [...prev, { ...preset }]);
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ_ITEMS}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Battery Config */}
        <ToolInputPanel
          title="Battery Configuration"
          icon={<Battery className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            {/* Presets */}
            <div>
              <Label className="text-xs">Quick Presets</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {Object.entries(BATTERY_PRESETS).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className="text-xs capitalize"
                    onClick={() => setBattery(preset)}
                  >
                    {key}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Voltage (V)</Label>
                <Input
                  type="number"
                  min={1}
                  value={battery.batteryVoltage}
                  onChange={(e) =>
                    setBattery((prev) => ({
                      ...prev,
                      batteryVoltage: parseInt(e.target.value) || 12,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Capacity (Ah)</Label>
                <Input
                  type="number"
                  min={1}
                  value={battery.batteryAh}
                  onChange={(e) =>
                    setBattery((prev) => ({
                      ...prev,
                      batteryAh: parseInt(e.target.value) || 100,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Battery Count</Label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={battery.batteryCount}
                  onChange={(e) =>
                    setBattery((prev) => ({
                      ...prev,
                      batteryCount: parseInt(e.target.value) || 1,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Type</Label>
                <div className="flex gap-1.5 mt-1.5">
                  <Button
                    variant={battery.batteryType === "lead-acid" ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => setBattery((prev) => ({ ...prev, batteryType: "lead-acid" }))}
                  >
                    Lead-Acid
                  </Button>
                  <Button
                    variant={battery.batteryType === "lithium" ? "default" : "outline"}
                    size="sm"
                    className="text-xs flex-1"
                    onClick={() => setBattery((prev) => ({ ...prev, batteryType: "lithium" }))}
                  >
                    Lithium
                  </Button>
                </div>
              </div>
            </div>

            {/* Load items */}
            <div>
              <Label className="text-xs">Appliances / Load</Label>
              <div className="space-y-1.5 mt-1.5 max-h-40 overflow-auto">
                {loads.map((load, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm">
                    <span className="truncate flex-1">
                      {load.name} ({load.wattage}W × {load.quantity})
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => removeLoad(i)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Add new load */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <Input
                  value={newLoadName}
                  onChange={(e) => setNewLoadName(e.target.value)}
                  placeholder="Device"
                  className="col-span-3 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && addLoad()}
                />
                <Input
                  type="number"
                  min={1}
                  value={newLoadWattage}
                  onChange={(e) => setNewLoadWattage(parseInt(e.target.value) || 1)}
                  className="text-xs"
                  placeholder="Watts"
                />
                <Input
                  type="number"
                  min={1}
                  value={newLoadQuantity}
                  onChange={(e) => setNewLoadQuantity(parseInt(e.target.value) || 1)}
                  className="text-xs"
                  placeholder="Qty"
                />
                <Button size="sm" onClick={addLoad}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Quick add common loads */}
            <div>
              <Label className="text-xs">Quick Add</Label>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {COMMON_LOADS.slice(0, 4).map((preset) => (
                  <button
                    key={preset.name}
                    className="text-xs text-primary hover:underline"
                    onClick={() => addPresetLoad(preset)}
                  >
                    +{preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ToolInputPanel>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main result */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Estimated Backup Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary">
                {result.backupTimeFormatted}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                With {result.totalLoadWatts}W total load and {result.batteryCapacityWh}Wh battery capacity
              </p>
            </CardContent>
          </Card>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <Zap className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{result.totalLoadWatts}W</p>
                <p className="text-xs text-muted-foreground">Total Load</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Battery className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{result.batteryCapacityWh}Wh</p>
                <p className="text-xs text-muted-foreground">Capacity</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <BatteryCharging className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{result.usableCapacityWh}Wh</p>
                <p className="text-xs text-muted-foreground">Usable</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <Clock className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{result.backupTimeHours}h</p>
                <p className="text-xs text-muted-foreground">Backup Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Load breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Load Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {loads.map((load, i) => {
                  const watts = load.wattage * load.quantity;
                  const percentage = result.totalLoadWatts > 0
                    ? (watts / result.totalLoadWatts) * 100
                    : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {load.name} × {load.quantity}
                          </span>
                          <span className="text-sm text-muted-foreground shrink-0">
                            {watts}W
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/60"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Battery info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Battery Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Efficiency</span>
                <span className="font-medium">{(result.efficiencyFactor * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Power Factor</span>
                <span className="font-medium">{result.powerFactor}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Batteries</span>
                <span className="font-medium">{battery.batteryCount} × {battery.batteryAh}Ah</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span className="text-muted-foreground">Voltage</span>
                <span className="font-medium">{battery.batteryVoltage}V</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolPageLayout>
  );
}
