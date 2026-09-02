"use client";

import * as React from "react";
import { SmilePlus, Eraser } from "lucide-react";
import { getTool } from "@/lib/registry";
import {
  removeEmojis,
  removeSpecialChars,
  removeCustomPattern,
} from "@/lib/tools/remove-emojis";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const tool = getTool("remove-emojis")!;

const SAMPLE_TEXT = `Hello World! 👋🌍
This is a great tool 🔥💯
I love using emojis 😊🎉✨
No more special characters! 🚫™©®
Math symbols: × ÷ ± µ
Arrows: ← → ↑ ↓`;

const FAQ_ITEMS = [
  {
    question: "Why would I need to remove emojis?",
    answer:
      "Emojis can cause issues in various contexts: database imports, CSV files, programming strings, email subjects, API responses, and legacy systems that don't support Unicode characters. This tool helps you clean text quickly.",
  },
  {
    question: "What types of characters does this remove?",
    answer:
      "The tool removes Unicode emojis (😊, 🔥, 👋), symbols (©, ®, ™), dingbats (♥, ♦, ♣), transport symbols (🚗, ✈️), flags, and other special Unicode characters. You can also remove all non-ASCII characters.",
  },
  {
    question: "Will this affect regular text?",
    answer:
      "No. The tool only removes emojis and special Unicode characters. Regular letters, numbers, punctuation, and standard ASCII characters remain unchanged.",
  },
  {
    question: "Can I use a custom pattern to remove characters?",
    answer:
      "Yes! Switch to the 'Custom Pattern' mode and enter a regular expression to target specific characters or patterns for removal.",
  },
];

export default function RemoveEmojisPage() {
  const [input, setInput] = React.useState(SAMPLE_TEXT);
  const [mode, setMode] = React.useState<"emojis" | "special" | "custom">("emojis");
  const [customPattern, setCustomPattern] = React.useState("");
  const [keepSpaces, setKeepSpaces] = React.useState(true);

  const result = React.useMemo(() => {
    if (!input) return { cleaned: "", removedCount: 0, originalLength: 0, cleanedLength: 0 };

    switch (mode) {
      case "emojis":
        return removeEmojis(input, { keepSpaces });
      case "special":
        return removeSpecialChars(input);
      case "custom":
        return removeCustomPattern(input, customPattern);
      default:
        return { cleaned: input, removedCount: 0, originalLength: input.length, cleanedLength: input.length };
    }
  }, [input, mode, customPattern, keepSpaces]);

  const handleReset = () => {
    setInput(SAMPLE_TEXT);
    setMode("emojis");
    setCustomPattern("");
    setKeepSpaces(true);
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ_ITEMS}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Input Text"
          icon={<SmilePlus className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="emoji-input">Text with emojis / special characters</Label>
              <textarea
                id="emoji-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste text here…"
                rows={8}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Mode selector */}
            <div>
              <Label>Removal Mode</Label>
              <div className="flex gap-2 mt-1.5">
                {[
                  { key: "emojis" as const, label: "Emojis" },
                  { key: "special" as const, label: "All Non-ASCII" },
                  { key: "custom" as const, label: "Custom Pattern" },
                ].map((m) => (
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
            </div>

            {mode === "emojis" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="keep-spaces"
                  checked={keepSpaces}
                  onChange={(e) => setKeepSpaces(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="keep-spaces" className="text-sm font-normal cursor-pointer">
                  Collapse multiple spaces
                </Label>
              </div>
            )}

            {mode === "custom" && (
              <div>
                <Label htmlFor="custom-pattern">Regex Pattern</Label>
                <Input
                  id="custom-pattern"
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  placeholder="e.g. [aeiou]"
                  className="mt-1.5 font-mono"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a valid regular expression
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <ResetButton onClick={handleReset} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result Panel */}
        <ToolResultPanel
          title="Cleaned Text"
          icon={<Eraser className="h-5 w-5" />}
          isEmpty={!result.cleaned}
          empty="Your cleaned text will appear here."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={result.removedCount > 0 ? "default" : "secondary"}>
                {result.removedCount} character{result.removedCount !== 1 ? "s" : ""} removed
              </Badge>
              <span className="text-xs text-muted-foreground">
                {result.originalLength} → {result.cleanedLength} chars
              </span>
            </div>

            <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap break-all">
              {result.cleaned}
            </pre>

            <CopyButton text={result.cleaned} label="Copy cleaned text" />
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
