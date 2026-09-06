"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Type, Timer, Hash } from "lucide-react";
import { countWords } from "@/lib/tools/word-counter";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.

How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.`;

export default function WordCounterClient() {
  const tool = getTool("word-counter")!;
  const [text, setText] = React.useState(SAMPLE_TEXT);

  const stats = React.useMemo(() => countWords(text), [text]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input */}
        <div className="lg:col-span-2">
          <ToolInputPanel title="Your Text" icon={<Type className="h-5 w-5" />}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="wc-text">Type or paste text — counts update live</Label>
                <textarea
                  id="wc-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={12}
                  className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y font-mono"
                  placeholder="Paste your text here…"
                />
              </div>
              <div className="flex items-center gap-2">
                <ResetButton onClick={() => setText("")} />
                {text && <CopyButton text={text} label="Copy text" size="sm" />}
              </div>
            </div>
          </ToolInputPanel>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Words", value: stats.words },
              { label: "Characters", value: stats.characters },
              { label: "No spaces", value: stats.charactersNoSpaces },
              { label: "Sentences", value: stats.sentences },
              { label: "Paragraphs", value: stats.paragraphs },
              { label: "Reading time", value: stats.readingTimeMinutes, suffix: " min" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">
                    {s.value.toLocaleString()}
                    {s.suffix ?? ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-4">
              <p className="flex items-center gap-2 text-sm font-medium mb-2">
                <Hash className="h-4 w-4 text-primary" /> Top words
              </p>
              {stats.topWords.length === 0 ? (
                <p className="text-xs text-muted-foreground">No words yet.</p>
              ) : (
                <ul className="space-y-1.5">
                  {stats.topWords.map((w) => (
                    <li key={w.word} className="flex items-center gap-2 text-sm">
                      <span className="w-24 truncate font-mono">{w.word}</span>
                      <span className="text-muted-foreground text-xs">{w.count}×</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
            <Timer className="h-3.5 w-3.5" /> Reading time estimated at 200 words per minute.
          </p>
        </div>
      </div>
    </ToolPageLayout>
  );
}
