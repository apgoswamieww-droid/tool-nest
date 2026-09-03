"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Calendar, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import {
  calculateAttendance,
  validateAttendanceInput,
} from "@/lib/tools/attendance-calculator";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AttendanceCalculatorClientProps {}

export default function AttendanceCalculatorClient(props: AttendanceCalculatorClientProps) {
  const tool = getTool("attendance-calculator")!;
  const [totalClasses, setTotalClasses] = React.useState(50);
  const [classesAttended, setClassesAttended] = React.useState(40);
  const [targetPercentage, setTargetPercentage] = React.useState(75);
  const [error, setError] = React.useState<string | null>(null);

  const result = React.useMemo(() => {
    const validationError = validateAttendanceInput(totalClasses, classesAttended);
    if (validationError) {
      setError(validationError);
      return null;
    }
    setError(null);
    return calculateAttendance({
      totalClasses,
      classesAttended,
      targetPercentage,
    });
  }, [totalClasses, classesAttended, targetPercentage]);

  const handleReset = () => {
    setTotalClasses(50);
    setClassesAttended(40);
    setTargetPercentage(75);
    setError(null);
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Input"
          icon={<Calendar className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="total-classes">Total Classes Held</Label>
              <Input
                id="total-classes"
                type="number"
                min={1}
                max={1000}
                value={totalClasses}
                onChange={(e) => setTotalClasses(parseInt(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="classes-attended">Classes Attended</Label>
              <Input
                id="classes-attended"
                type="number"
                min={0}
                max={totalClasses}
                value={classesAttended}
                onChange={(e) => setClassesAttended(parseInt(e.target.value) || 0)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="target-percentage">Target Attendance (%)</Label>
              <Input
                id="target-percentage"
                type="number"
                min={1}
                max={100}
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(parseInt(e.target.value) || 75)}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Default: 75% (most institutions require this)
              </p>
            </div>

            <Button onClick={handleReset} variant="outline" className="w-full">
              Reset
            </Button>
          </div>
        </ToolInputPanel>

        {/* Results */}
        <div className="space-y-4">
          {error ? (
            <ToolResultPanel title="Error" isEmpty empty={error} />
          ) : result && (
            <>
              {/* Main stat */}
              <Card className={cn(
                "border-2",
                result.isEligible ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Current Attendance</CardTitle>
                    {result.isEligible ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Eligible
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        At Risk
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-5xl font-bold text-primary">
                    {result.currentPercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Target: {targetPercentage}% • Need {result.classesNeededForTarget > 0 ? result.classesNeededForTarget : 0} more class{result.classesNeededForTarget !== 1 ? "es" : ""}
                  </p>
                </CardContent>
              </Card>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Classes Missed</p>
                    <p className="text-2xl font-bold mt-1">{result.classesMissed}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Max Bunkable</p>
                    <p className="text-2xl font-bold mt-1">{result.maxBunkable}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Min Required</p>
                    <p className="text-2xl font-bold mt-1">{result.minimumRequired}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Classes Needed</p>
                    <p className={cn(
                      "text-2xl font-bold mt-1",
                      result.classesNeededForTarget > 0 ? "text-destructive" : "text-green-500"
                    )}>
                      {result.classesNeededForTarget}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Progress bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress to {targetPercentage}%</span>
                    <span className="text-sm text-muted-foreground">
                      {result.currentPercentage}% / {targetPercentage}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        result.isEligible ? "bg-green-500" : "bg-destructive"
                      )}
                      style={{ width: `${Math.min(100, (result.currentPercentage / targetPercentage) * 100)}%` }}
                    />
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
