"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Award } from "lucide-react";
import { calculatePercentage, validateMarksInput } from "@/lib/tools/marks-percentage";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarksPercentageClientProps {}

export default function MarksPercentageClient(props: MarksPercentageClientProps) {
  const tool = getTool("marks-percentage-calculator")!;
  const [totalMarks, setTotalMarks] = React.useState(100);
  const [obtainedMarks, setObtainedMarks] = React.useState(75);

  const result = React.useMemo(() => {
    if (validateMarksInput({ totalMarks, obtainedMarks })) return null;
    return calculatePercentage({ totalMarks, obtainedMarks });
  }, [totalMarks, obtainedMarks]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="Enter Marks" icon={<Award className="h-5 w-5" />}>
          <div className="space-y-4">
            <div><Label>Total Marks</Label><Input type="number" min={1} value={totalMarks} onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Marks Obtained</Label><Input type="number" min={0} max={totalMarks} value={obtainedMarks} onChange={(e) => setObtainedMarks(parseInt(e.target.value) || 0)} className="mt-1.5" /></div>
            <Button onClick={() => calculatePercentage({ totalMarks, obtainedMarks })} className="w-full">Calculate</Button>
          </div>
        </ToolInputPanel>

        {result && (
          <div className="space-y-4">
            <Card className={cn("border-2", result.status === "fail" ? "border-destructive/30 bg-destructive/5" : result.status === "distinction" ? "border-green-500/30 bg-green-500/5" : "border-primary/20 bg-primary/5")}>
              <CardHeader className="pb-2"><CardTitle className="text-lg">Result</CardTitle></CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">{result.percentage}%</div>
                <div className="flex gap-2 mt-3">
                  <Badge variant={result.status === "fail" ? "destructive" : "default"} className={cn(result.status === "distinction" && "bg-green-500")}>Grade: {result.grade}</Badge>
                  <Badge variant="outline">GPA: {result.gradePoint}</Badge>
                  <Badge variant={result.status === "pass" || result.status === "distinction" ? "default" : "destructive"}>{result.status === "fail" ? "Fail" : result.status === "distinction" ? "Distinction" : "Pass"}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Formula</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p><strong>Percentage</strong> = (Obtained ÷ Total) × 100 = ({obtainedMarks} ÷ {totalMarks}) × 100 = {result.percentage}%</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
