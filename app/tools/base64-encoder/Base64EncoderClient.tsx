"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Binary, ArrowDownUp, AlertTriangle } from "lucide-react";
import { encodeBase64, decodeBase64 } from "@/lib/tools/base64";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SAMPLE_TEXT = "Hello, ToolNest! 👋";

export default function Base64EncoderClient() {
  const tool = getTool("base64-encoder")!;
  const [direction, setDirection] = React.useState<"encode" | "decode">("encode");
  const [text, setText] = React.useState(SAMPLE_TEXT);

  const result = React.useMemo(
    () => (direction === "encode" ? encodeBase64(text) : decodeBase64(text)),
    [text, direction]
  );

  const hasError = result && !result.ok;

  const swap = () => {
    // Move the current output into the input and flip the direction.
    if (result?.ok) {
      setText(result.output);
      setDirection(direction === "encode" ? "decode" : "encode");
    }
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <ToolInputPanel title="Input" icon={<Binary className="h-5 w-5" />}>
          <div className="space-y-4">
            <div>
              <Label>Direction</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <Button
                  variant={direction === "encode" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirection("encode")}
                >
                  Text → Base64
                </Button>
                <Button
                  variant={direction === "decode" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDirection("decode")}
                >
                  Base64 → Text
                </Button>
                <Button variant="ghost" size="sm" onClick={swap} disabled={!result?.ok} title="Swap input and output">
                  <ArrowDownUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="b64-input">
                {direction === "encode" ? "Plain text" : "Base64 string"}
              </Label>
              <textarea
                id="b64-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono"
                placeholder={direction === "encode" ? "Type text to encode…" : "Paste Base64 to decode…"}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <ResetButton onClick={() => { setText(SAMPLE_TEXT); setDirection("encode"); }} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result */}
        <ToolResultPanel
          title={direction === "encode" ? "Base64 Output" : "Decoded Text"}
          icon={<Binary className="h-5 w-5" />}
          isEmpty={!text}
          empty="Enter text to see the result here."
        >
          <div className="space-y-3">
            {hasError ? (
              <p role="alert" className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                {result.error}
              </p>
            ) : (
              <>
                <Badge variant="secondary">{result.output.length.toLocaleString()} characters</Badge>
                <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap break-all font-mono">
                  {result.output}
                </pre>
                <CopyButton
                  text={result.output}
                  label={direction === "encode" ? "Copy Base64" : "Copy decoded text"}
                />
              </>
            )}
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
