"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { KeyRound, Loader2 } from "lucide-react";
import {
  HASH_ALGORITHMS,
  hashTextAll,
  type HashResults,
} from "@/lib/tools/hash-generator";
import { analytics } from "@/lib/analytics";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { CopyButton } from "@/components/tool/CopyButton";
import { Card, CardContent } from "@/components/ui/card";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

export default function HashGeneratorClient() {
  const tool = getTool("hash-generator")!;
  const [input, setInput] = React.useState(SAMPLE);
  const [results, setResults] = React.useState<HashResults | null>(null);
  // Sample input is non-empty on first render, so start busy to avoid
  // flashing the empty state before the first digest lands.
  const [busy, setBusy] = React.useState(true);

  // Hash live as the user types; ignore stale in-flight results.
  const requestRef = React.useRef(0);
  const lastEmittedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const requestId = ++requestRef.current;
    if (!input) {
      setResults(null);
      setBusy(false);
      return;
    }
    setBusy(true);
    void hashTextAll(input).then((res) => {
      if (requestRef.current !== requestId) return; // superseded
      setResults(res);
      setBusy(false);
      if (res.sha256 !== lastEmittedRef.current) {
        lastEmittedRef.current = res.sha256;
        analytics.toolCompleted(tool.slug);
      }
    });
  }, [input, tool.slug]);

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <ToolInputPanel
          title="Text to hash"
          icon={<KeyRound className="h-5 w-5" />}
        >
          <textarea
            id="hash-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            spellCheck={false}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
            placeholder="Type or paste text to hash…"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {input.length} characters — hashing runs locally in your browser;
            nothing is uploaded.
          </p>
        </ToolInputPanel>

        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Digests</p>
          {results === null && !busy ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Type some text to generate its hashes.
              </CardContent>
            </Card>
          ) : (
            HASH_ALGORITHMS.map((algo) => {
              const value = results ? results[algo.id] : "";
              return (
                <Card key={algo.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {algo.label}
                      </span>
                      {busy && !value ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        value && <CopyButton text={value} label="Copy" size="sm" />
                      )}
                    </div>
                    <p className="mt-2 font-mono text-xs break-all leading-relaxed text-foreground/90">
                      {busy && !value ? "…" : value}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
