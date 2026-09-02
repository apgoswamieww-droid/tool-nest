"use client";

import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ToolInputPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function ToolInputPanel({ title, children, className, icon }: ToolInputPanelProps) {
  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
