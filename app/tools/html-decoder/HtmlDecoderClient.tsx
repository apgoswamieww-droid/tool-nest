"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Code2, Unlock } from "lucide-react";
import { decodeHtml, decodeUrlEncoded, decodeAll } from "@/lib/tools/html-decoder";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { ResetButton } from "@/components/tool/ResetButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const SAMPLE_TEXT = `&lt;h1&gt;Hello &amp;amp; World&lt;/h1&gt;
&lt;p&gt;Price: &amp;euro;100 &amp;mdash; &amp;copy; 2024&lt;/p&gt;
Email: user&amp;#64;example.com
Hex: &amp;#x1F600; is a smiley
URL: https%3A%2F%2Fexample.com%3Fq%3Dhello%26lang%3Den`;

interface HtmlDecoderClientProps {}

export default function HtmlDecoderClient(props: HtmlDecoderClientProps) {
  const tool = getTool("html-decoder")!;
  const [input, setInput] = React.useState(SAMPLE_TEXT);
  const [mode, setMode] = React.useState<"html" | "url" | "all">("all");

  const result = React.useMemo(() => {
    if (!input) return { decoded: "", entityCount: 0, originalLength: 0, decodedLength: 0 };

    switch (mode) {
      case "html":
        return decodeHtml(input);
      case "url":
        return decodeUrlEncoded(input);
      case "all":
        return decodeAll(input);
      default:
        return { decoded: input, entityCount: 0, originalLength: input.length, decodedLength: input.length };
    }
  }, [input, mode]);

  const handleReset = () => {
    setInput(SAMPLE_TEXT);
    setMode("all");
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Encoded Input"
          icon={<Code2 className="h-5 w-5" />}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="html-input">Encoded text</Label>
              <textarea
                id="html-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste HTML-encoded or URL-encoded text…"
                rows={8}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono"
                spellCheck={false}
              />
            </div>

            <div>
              <Label>Decode Mode</Label>
              <div className="flex gap-2 mt-1.5">
                {[
                  { key: "all" as const, label: "Decode All" },
                  { key: "html" as const, label: "HTML Only" },
                  { key: "url" as const, label: "URL Only" },
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

            <ResetButton onClick={handleReset} />
          </div>
        </ToolInputPanel>

        {/* Result Panel */}
        <ToolResultPanel
          title="Decoded Output"
          icon={<Unlock className="h-5 w-5" />}
          isEmpty={!result.decoded}
          empty="Decoded text will appear here."
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={result.entityCount > 0 ? "default" : "secondary"}>
                {result.entityCount} entity{result.entityCount !== 1 ? "ies" : "y"} decoded
              </Badge>
              <span className="text-xs text-muted-foreground">
                {result.originalLength} → {result.decodedLength} chars
              </span>
            </div>

            <pre className="max-h-80 overflow-auto rounded-md bg-muted/50 p-4 text-sm whitespace-pre-wrap break-all">
              {result.decoded}
            </pre>

            <CopyButton text={result.decoded} label="Copy decoded text" />
          </div>
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
