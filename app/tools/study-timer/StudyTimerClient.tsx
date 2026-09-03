"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StudyTimerClientProps {}

export default function StudyTimerClient(props: StudyTimerClientProps) {
  const tool = getTool("study-timer")!;
  const [timeLeft, setTimeLeft] = React.useState(25 * 60);
  const [isRunning, setIsRunning] = React.useState(false);
  const [session, setSession] = React.useState<"focus" | "break" | "long-break">("focus");
  const [completedSessions, setCompletedSessions] = React.useState(0);

  const totalSeconds = session === "focus" ? 25 * 60 : session === "break" ? 5 * 60 : 15 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  React.useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Session complete
          if (session === "focus") {
            const newCount = completedSessions + 1;
            setCompletedSessions(newCount);
            if (newCount % 4 === 0) {
              setSession("long-break");
              return 15 * 60;
            }
            setSession("break");
            return 5 * 60;
          } else {
            setSession("focus");
            return 25 * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, session, completedSessions]);

  const handleReset = () => { setIsRunning(false); setTimeLeft(totalSeconds); };

  return (
    <ToolPageLayout tool={tool}>
      <div className="max-w-md mx-auto space-y-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex items-center justify-center gap-2">
              <Badge variant={session === "focus" ? "default" : "secondary"} className="capitalize">{session === "long-break" ? "Long Break" : session}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Circle */}
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" strokeDasharray={`${progress * 2.827} 282.7`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold font-mono">{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" size="icon" onClick={handleReset}><RotateCcw className="h-4 w-4" /></Button>
              <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="w-32">
                {isRunning ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Start</>}
              </Button>
            </div>

            {/* Session Count */}
            <div className="text-sm text-muted-foreground">
              <p>Sessions completed: <strong>{completedSessions}</strong></p>
              <div className="flex justify-center gap-1.5 mt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={cn("w-3 h-3 rounded-full", i < (completedSessions % 4) ? "bg-primary" : "bg-muted")} />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">How It Works</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>1. Focus for <strong>25 minutes</strong></p>
            <p>2. Take a <strong>5-minute break</strong></p>
            <p>3. After 4 sessions, take a <strong>15-minute long break</strong></p>
            <p>4. Repeat!</p>
          </CardContent>
        </Card>
      </div>
    </ToolPageLayout>
  );
}
