"use client";

import * as React from "react";
import { Repeat, FileText, Settings2 } from "lucide-react";
import { getTool } from "@/lib/registry";
import { repeatText, validateRepeatInput } from "@/lib/tools/text-repeater";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const tool = getTool("text-repeater")!;

const FAQ_ITEMS = [
  {
    question: "What is the Text Repeater tool?",
    answer:
      "The Text Repeater tool lets you duplicate any text, phrase, or string a specified number of times. It's useful for testing, generating repeated patterns, filling templates, or creating placeholder content.",
  },
  {
    question: "What's the maximum number of repeats?",
    answer:
      "You can repeat text up to 10,000 times. The input text can be up to 10,000 characters long. The tool processes everything in your browser — no data is sent to any server.",
  },
  {
    question: "Can I add separators between repeats?",
    answer:
      "Yes! You can choose a custom separator (like a comma, pipe, or dash) or use line breaks to place each repetition on a new line.",
  },
  {
    question: "Is my data kept private?",
    answer:
      "Absolutely. All processing happens entirely in your browser. Your text is never sent to any server or stored anywhere.",
  },
];

export default function TextRepeaterPage() {
  const [text, setText] = React.useState("");
  const [count, setCount] = React.useState(10);
  const [separator, setSeparator] = React.useState("");
  const [lineBreak, setLineBreak] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const result = React.useMemo(() => {
    const validationError = validateRepeatInput(text, count);
    if (validationError) {
      setError(validationError);
      return { output: "", charCount: 0, lineCount: 0 };
    }
    setError(null);
    return repeatText({ text, count, separator, lineBreak });
  }, [text, count, separator, lineBreak]);

  const handleReset = () => {
    setText("");
    setCount(10);
    setSeparator("");
    setLineBreak(false);
    setError(null);
  };

  return (
    <ToolPageLayout tool={tool} faqItems={FAQ_ITEMS}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Input"
          icon={<Settings2 className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="text-input">Text to Repeat</Label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to repeat…"
                rows={4}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                maxLength={10000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {text.length.toLocaleString()} / 10,000 characters
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="repeat-count">Repeat Count</Label>
                <Input
                  id="repeat-count"
                  type="number"
                  min={1}
                  max={10000}
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="separator">Separator</Label>
                <Input
                  id="separator"
                  value={separator}
                  onChange={(e) => setSeparator(e.target.value)}
                  placeholder="None"
                  className="mt-1.5"
                  disabled={lineBreak}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="line-break"
                checked={lineBreak}
                onChange={(e) => setLineBreak(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <Label htmlFor="line-break" className="text-sm font-normal cursor-pointer">
                Use line breaks (each repeat on new line)
              </Label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={() => repeatText({ text, count, separator, lineBreak })} disabled={!text.trim()}>
                <Repeat className="h-4 w-4" />
                Repeat
              </Button>
              <ResetButton onClick={handleReset} />
            </div>
          </div>
        </ToolInputPanel>

        {/* Result Panel */}
        <ToolResultPanel
          title="Result"
          icon={<FileText className="h-5 w-5" />}
          isEmpty={!result.output}
          empty="Your repeated text will appear here. Enter some text and click Repeat."
        >
          <div className="space-y-3">
            <div className="relative">
              <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-4 text-sm font-mono whitespace-pre-wrap break-all">
                {result.output}
              </pre>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  <strong>{result.charCount.toLocaleString()}</strong> characters
                </span>
                <span>
                  <strong>{result.lineCount.toLocaleString()}</strong> lines
                </span>
              </div>
              <CopyButton text={result.output} />
            </div>
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
