"use client";

import * as React from "react";
import { Upload, FileText, AlertTriangle, Shield } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/pdf/validators";

interface PdfDropzoneProps {
  onFile: (file: File) => void;
  accept?: string;
  disabled?: boolean;
  error?: string | null;
  label?: string;
  description?: string;
}

export function PdfDropzone({
  onFile,
  accept = ".pdf",
  disabled = false,
  error,
  label = "Drop a PDF file here",
  description = "or click to browse",
}: PdfDropzoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-destructive/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!disabled ? handleClick : undefined}
      >
        <CardContent className="p-8 text-center">
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleChange}
            disabled={disabled}
          />
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Privacy badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Shield className="h-3.5 w-3.5 text-green-500" />
        <span>Your files are processed locally in your browser. Nothing is uploaded to any server.</span>
      </div>
    </div>
  );
}
