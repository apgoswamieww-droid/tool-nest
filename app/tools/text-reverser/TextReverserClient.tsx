"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { ArrowLeftRight } from "lucide-react";
import { reverseText, type ReverseMode } from "@/lib/tools/text-reverser";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SAMPLE_TEXT = "Hello ToolNest! Reverse this text 🚀";

export default function TextReverserClient() {
  const tool = getTool("text-reverser")!;
  const [text, setText] = React.useState(SAMPLE_TEXT);
  const [mode, setMode] = React.useState<ReverseMode>("characters");

  const result = React.useMemo(() => reverseText(text, mode), [text, mode]);

  const MODES: { key: ReverseMode; label: string }[] = [
    { key: "characters", label: "Characters" },
    { key: "words", label: "Words" },
    { key: "lines", label: "Lines" },
  ];

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input */}
        <ToolInputPanel title="Input Text" icon={<ArrowLeftRight className="h-5 w-5" />}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tr-text">Text to reverse</Label>
              <textarea
                id="tr-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Paste text here…"
              />
            </div>

            <div>
              <Label>Reverse By</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {MODES.map((m) => (
                  <Button
                    key={m.key}
                    variant={mode === m.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMode(m.key)}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {mode === "characters"
                  ? "Reverses every character (emoji stays intact)."
                  : mode === "words"
                    ? "Reverses word order, spacing preserved."
                    : "Reverses the order of lines."}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <ResetButton onClick={() => setText(SAMPLE_TEXT)} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result */}
        <ToolResultPanel
          title="Reversed Text"
          icon={<ArrowLeftRight className="h-5 w-5" />}
          isEmpty={!result.output}
          empty="Your reversed text will appear here."
        >
          <div className="space-y-3">
            <Badge variant="secondary">{result.charCount.toLocaleString()} characters</Badge>
            <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap break-all">
              {result.output}
            </pre>
            <CopyButton text={result.output} label="Copy reversed text" />
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
