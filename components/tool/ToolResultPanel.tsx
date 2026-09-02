"use client";

import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolResultPanelProps {
  title: string;
  children?: ReactNode;
  className?: string;
  icon?: ReactNode;
  empty?: ReactNode;
  isEmpty?: boolean;
}

export function ToolResultPanel({
  title,
  children,
  className,
  icon,
  empty,
  isEmpty = false,
}: ToolResultPanelProps) {
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
