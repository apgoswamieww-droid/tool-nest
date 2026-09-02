"use client";

import { FileText, X } from "lucide-react";
import { Button } from "./button";
import { formatFileSize } from "@/lib/pdf/validators";

interface PdfFileInfoProps {
  file: File;
  pageCount?: number;
  onRemove: () => void;
}

export function PdfFileInfo({ file, pageCount, onRemove }: PdfFileInfoProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
      <FileText className="h-8 w-8 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatFileSize(file.size)}</span>
          {pageCount !== undefined && (
            <>
              <span>•</span>
              <span>{pageCount} page{pageCount !== 1 ? "s" : ""}</span>
            </>
          )}
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={onRemove}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
