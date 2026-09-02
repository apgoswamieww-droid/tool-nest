"use client";

import * as React from "react";
import { Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ProcessingState } from "@/lib/pdf/types";

interface PdfProgressProps {
  state: ProcessingState;
  onCancel?: () => void;
  fileName?: string;
}

export function PdfProgress({ state, onCancel, fileName }: PdfProgressProps) {
  if (state.status === "idle") return null;

  return (
    <Card
      className={cn(
        "border transition-colors",
        state.status === "complete" && "border-green-500/30 bg-green-500/5",
        state.status === "error" && "border-destructive/30 bg-destructive/5"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {/* Status icon */}
          {state.status === "processing" && (
            <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
          )}
          {state.status === "complete" && (
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          )}
          {state.status === "error" && (
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          )}
          {state.status === "reading" && (
            <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {state.status === "complete"
                ? "Processing complete"
                : state.status === "error"
                ? "Processing failed"
                : state.message}
            </p>
            {fileName && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {fileName}
              </p>
            )}
          </div>

          {/* Cancel button */}
          {state.status === "processing" && onCancel && (
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        {state.status === "processing" && (
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {Math.round(state.progress)}%
            </p>
          </div>
        )}

        {/* Error details */}
        {state.status === "error" && state.error && (
          <p className="text-xs text-destructive mt-2">{state.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
