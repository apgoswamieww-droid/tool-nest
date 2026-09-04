"use client";

import { ReactNode, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import type { AnalyticsEventName } from "@/lib/analytics";
import { useToolSlug } from "./AnalyticsProvider";
import { getTool } from "@/lib/registry";

interface ToolResultPanelProps {
  title: string;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
  /**
   * Completion analytics. Defaults to `calculation_completed` for
   * calculator/converter tools and `tool_completed` for others.
   * Set to null to disable completion tracking for this panel.
   */
  completionEvent?: AnalyticsEventName | null;
}

// Categories whose tools produce numeric results (funnel: calculation_completed).
const CALCULATOR_CATEGORIES = new Set([
  "financial-calculators",
  "construction-calculators",
  "energy-calculators",
  "personal-calculators",
  "agriculture-tools",
  "student-tools",
]);

/** Best-effort classifier: does this tool produce a *calculation* result? */
function defaultCompletionEvent(toolSlug: string): AnalyticsEventName | null {
  const tool = getTool(toolSlug);
  if (!tool) return null;
  const isCalculation =
    CALCULATOR_CATEGORIES.has(tool.category) ||
    /\b(calculator|converter)\b/i.test(tool.name);
  return isCalculation
    ? "calculation_completed"
    : "tool_completed";
}

export function ToolResultPanel({
  title,
  children,
  className,
  icon,
  empty,
  isEmpty = false,
  completionEvent,
}: ToolResultPanelProps) {
  // Resolve the active tool (AnalyticsProvider on every tool page).
  const toolSlug = useToolSlug();

  // Emit a completion event when the panel transitions empty → filled:
  // the moment a tool actually produces a visible result. Mounting an
  // already-filled panel (a page view) never fires — only real fills do.
  const prevIsEmpty = useRef(isEmpty);

  useEffect(() => {
    const wasEmpty = prevIsEmpty.current;
    prevIsEmpty.current = isEmpty;
    if (!wasEmpty || isEmpty) return;
    if (!toolSlug) return;

    const event =
      completionEvent === undefined
        ? defaultCompletionEvent(toolSlug)
        : completionEvent;
    if (!event) return;

    if (event === "calculation_completed") {
      analytics.calculationCompleted(toolSlug);
    } else {
      analytics.toolCompleted(toolSlug);
    }
  }, [isEmpty, toolSlug, completionEvent]);

  return (
    <Card className={cn("border-2 border-dashed", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {isEmpty && empty ? (
          <div className="text-muted-foreground text-sm py-4">{empty}</div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
