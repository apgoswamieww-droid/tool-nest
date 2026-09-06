"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { TextCursorInput, AlignLeft } from "lucide-react";
import { generateLorem, type LoremMode } from "@/lib/tools/lorem-ipsum";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const COUNT_LIMITS: Record<LoremMode, number> = {
  paragraphs: 50,
  sentences: 10,
  words: 500,
};

const MODE_HINTS: Record<LoremMode, string> = {
  paragraphs: "1–50 paragraphs, 3–7 sentences each",
  sentences: "1–10 sentences in a single block",
  words: "1–500 words in a single block",
};

export default function LoremIpsumGeneratorClient() {
  const tool = getTool("lorem-ipsum-generator")!;
  const [mode, setMode] = React.useState<LoremMode>("paragraphs");
  const [count, setCount] = React.useState("3");
  const [startWithLorem, setStartWithLorem] = React.useState(true);
  const [generated, setGenerated] = React.useState<string | null>(null);

  const handleGenerate = () => {
    const result = generateLorem({
      mode,
      count: Number(count) || 1,
      startWithLorem,
    });
    setGenerated(result.output);
  };

  const handleReset = () => {
    setMode("paragraphs");
    setCount("3");
    setStartWithLorem(true);
    setGenerated(null);
  };

  // Clamp the count when switching modes so the input is always valid.
  const handleModeChange = (next: LoremMode) => {
    setMode(next);
    const max = COUNT_LIMITS[next];
    const n = Number(count) || 1;
    if (n > max) setCount(String(max));
  };

  const countError =
    !Number.isFinite(Number(count)) || Number(count) < 1
      ? "Enter a count of at least 1."
      : Number(count) > COUNT_LIMITS[mode]
        ? `Maximum for ${mode} mode is ${COUNT_LIMITS[mode]}.`
        : null;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Options Panel */}
        <ToolInputPanel
          title="Options"
          icon={<TextCursorInput className="h-5 w-5" />}
        >
          <div className="space-y-4">
            {/* Mode selector */}
            <div>
              <Label>Output Type</Label>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {(
                  [
                    { key: "paragraphs", label: "Paragraphs" },
                    { key: "sentences", label: "Sentences" },
                    { key: "words", label: "Words" },
                  ] as const
                ).map((m) => (
                  <Button
                    key={m.key}
                    variant={mode === m.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleModeChange(m.key)}
                  >
                    {m.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                {MODE_HINTS[mode]}
              </p>
            </div>

            {/* Count */}
            <div>
              <Label htmlFor="lorem-count">
                How many {mode === "paragraphs" ? "paragraphs" : mode}?
              </Label>
              <Input
                id="lorem-count"
                type="number"
                min={1}
                max={COUNT_LIMITS[mode]}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="mt-1.5 max-w-32"
              />
              {countError && (
                <p className="text-xs text-destructive mt-1">{countError}</p>
              )}
            </div>

            {/* Start with classic opening */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="start-lorem"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="start-lorem" className="text-sm font-normal cursor-pointer">
                Start with “Lorem ipsum dolor sit amet”
              </Label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleGenerate} disabled={!!countError}>
                <AlignLeft className="h-4 w-4 mr-2" />
                Generate
              </Button>
              <ResetButton onClick={handleReset} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result Panel */}
        <ToolResultPanel
          title="Generated Text"
          icon={<AlignLeft className="h-5 w-5" />}
          isEmpty={!generated}
          empty="Click Generate to create placeholder text."
        >
          {generated !== null && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {generated.split(/\s+/).filter(Boolean).length} words
                </Badge>
                <Badge variant="secondary">
                  {generated.split(/\n\n/).length}{" "}
                  {generated.split(/\n\n/).length === 1 ? "paragraph" : "paragraphs"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {generated.length} chars
                </span>
              </div>

              <div className="max-h-96 overflow-auto rounded-md bg-muted/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                {generated}
              </div>

              <CopyButton text={generated} label="Copy text" />
            </div>
          )}
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
