"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { RefreshCw } from "lucide-react";
import { convertCgpaToPercentage, validateCgpaInput } from "@/lib/tools/cgpa-converter";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CgpaConverterClientProps {}

export default function CgpaConverterClient(props: CgpaConverterClientProps) {
  const tool = getTool("cgpa-converter")!;
  const [cgpa, setCgpa] = React.useState(8.5);
  const [scale, setScale] = React.useState<"10" | "4" | "5">("10");

  const result = React.useMemo(() => {
    if (validateCgpaInput({ cgpa, scale })) return null;
    return convertCgpaToPercentage({ cgpa, scale });
  }, [cgpa, scale]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="Enter CGPA" icon={<RefreshCw className="h-5 w-5" />}>
          <div className="space-y-4">
            <div><Label>CGPA</Label><Input type="number" step={0.01} min={0} value={cgpa} onChange={(e) => setCgpa(parseFloat(e.target.value) || 0)} className="mt-1.5" /></div>
            <div><Label>Scale</Label>
              <div className="flex gap-2 mt-1.5">
                {[{ v: "10" as const, l: "10-Point (Indian)" }, { v: "4" as const, l: "4-Point (US GPA)" }, { v: "5" as const, l: "5-Point (European)" }].map(s => (
                  <Button key={s.v} variant={scale === s.v ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setScale(s.v)}>{s.l}</Button>
                ))}
              </div>
            </div>
          </div>
        </ToolInputPanel>

        {result && (
          <div className="space-y-4">
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader className="pb-2"><CardTitle className="text-lg">Converted Result</CardTitle></CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-primary">{result.percentage}%</div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="default">{result.letterGrade}</Badge>
                  <Badge variant="outline">{result.scale}</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-base">Formula Used</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground"><p>{result.formula}</p></CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}
