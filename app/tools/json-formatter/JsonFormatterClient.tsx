"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Braces, AlertTriangle } from "lucide-react";
import { formatJson, JSON_FORMATTER_SAMPLE, type JsonIndent } from "@/lib/tools/json-formatter";
import { analytics } from "@/lib/analytics";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INDENTS: { value: JsonIndent; label: string }[] = [
  { value: 2, label: "2 spaces" },
  { value: 4, label: "4 spaces" },
  { value: "\t", label: "Tab" },
];

export default function JsonFormatterClient() {
  const tool = getTool("json-formatter")!;
  const [input, setInput] = React.useState(JSON_FORMATTER_SAMPLE);
  const [mode, setMode] = React.useState<"format" | "minify">("format");
  const [indent, setIndent] = React.useState<JsonIndent>(2);

  const result = React.useMemo(
    () => formatJson(input, { mode, indent }),
    [input, mode, indent]
  );

  // Completion analytics: fire once per successful input, not per render.
  const lastEmittedRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (result.ok && result.output !== lastEmittedRef.current) {
      lastEmittedRef.current = result.output;
      analytics.toolCompleted(tool.slug);
    }
  }, [result, tool.slug]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <ToolInputPanel title="JSON Input" icon={<Braces className="h-5 w-5" />}>
          <textarea
            id="json-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            placeholder='{"hello": "world"}'
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border p-0.5">
              <Button
                variant={mode === "format" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMode("format")}
              >
                Beautify
              </Button>
              <Button
                variant={mode === "minify" ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setMode("minify")}
              >
                Minify
              </Button>
            </div>

            <div className="flex rounded-md border p-0.5">
              {INDENTS.map((opt) => (
                <Button
                  key={opt.label}
                  variant={indent === opt.value ? "default" : "ghost"}
                  size="sm"
                  className="h-7 text-xs"
                  disabled={mode === "minify"}
                  onClick={() => setIndent(opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </ToolInputPanel>

        {/* Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Output</p>
            {result.ok && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {result.lines} lines · {result.chars} chars · {(result.bytes / 1024).toFixed(1)} KB
                </span>
                <CopyButton text={result.output} label="Copy JSON" />
              </div>
            )}
          </div>

          {result.ok ? (
            <Card className={cn(mode === "minify" && "opacity-95")}>
              <CardContent className="p-0">
                <pre className="max-h-96 overflow-auto rounded-md bg-muted/40 p-4 font-mono text-xs leading-relaxed whitespace-pre">
                  {result.output}
                </pre>
              </CardContent>
            </Card>
          ) : (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
            >
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Invalid JSON</p>
                <p className="mt-1 text-destructive/90">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
