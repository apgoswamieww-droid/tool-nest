"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Tool slug for analytics tracking */
  toolSlug?: string;
}

export function CopyButton({
  text,
  className,
  label = "Copy",
  size = "sm",
  variant = "outline",
  toolSlug,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track result copied
      if (toolSlug) {
        analytics.resultCopied(toolSlug, text.length);
      }
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track result copied (fallback path)
      if (toolSlug) {
        analytics.resultCopied(toolSlug, text.length);
      }
    }
  }, [text, toolSlug]);

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      disabled={!text}
      className={cn("gap-1.5", className)}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          {label}
        </>
      )}
    </Button>
  );
}
