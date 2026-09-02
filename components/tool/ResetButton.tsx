"use client";

import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResetButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function ResetButton({
  onClick,
  className,
  label = "Reset",
  disabled,
}: ResetButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-1.5 text-muted-foreground hover:text-foreground", className)}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
