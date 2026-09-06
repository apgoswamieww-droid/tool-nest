"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Sparkles, Trophy } from "lucide-react";
import {
  pickNames,
  parseNames,
  validatePickerInput,
} from "@/lib/tools/random-name-picker";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SAMPLE = "Ava\nBen\nChloe\nDiego\nEmma\nFinn\nGrace\nHana";

interface HistoryEntry {
  winners: string[];
  at: string;
}

export default function RandomNamePickerClient() {
  const tool = getTool("random-name-picker")!;
  const [raw, setRaw] = React.useState(SAMPLE);
  const [count, setCount] = React.useState("1");
  const [allowDuplicates, setAllowDuplicates] = React.useState(false);
  const [outcome, setOutcome] = React.useState<HistoryEntry | null>(null);
  const [history, setHistory] = React.useState<HistoryEntry[]>([]);
  const [spinning, setSpinning] = React.useState(false);

  const names = parseNames(raw);
  const error = validatePickerInput(raw, Number(count) || 0);

  const handlePick = () => {
    if (error || names.length === 0) return;
    setSpinning(true);
    // Brief shuffle animation for the reveal moment.
    window.setTimeout(() => {
      const result = pickNames(raw, Number(count) || 1, { allowDuplicates });
      const entry: HistoryEntry = {
        winners: result.winners,
        at: new Date().toLocaleTimeString(),
      };
      setOutcome(entry);
      setHistory((prev) => [entry, ...prev].slice(0, 5));
      setSpinning(false);
    }, 450);
  };

  const handleReset = () => {
    setRaw(SAMPLE);
    setCount("1");
    setAllowDuplicates(false);
    setOutcome(null);
    setHistory([]);
  };

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="Names" icon={<Sparkles className="h-5 w-5" />}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="names-input">
                One name per line ({names.length} name{names.length === 1 ? "" : "s"})
              </Label>
              <textarea
                id="names-input"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                rows={10}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder={"Alice\nBob\nCarol…"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <Label htmlFor="winner-count">Winners to pick</Label>
                <Input
                  id="winner-count"
                  type="number"
                  min={1}
                  max={20}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <input
                  type="checkbox"
                  id="allow-dups"
                  checked={allowDuplicates}
                  onChange={(e) => setAllowDuplicates(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="allow-dups" className="text-sm font-normal cursor-pointer">
                  Allow repeat wins
                </Label>
              </div>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <div className="flex items-center gap-2 pt-1">
              <Button onClick={handlePick} disabled={!!error || spinning} className="gap-2">
                <Sparkles className="h-4 w-4" />
                {spinning ? "Picking…" : "Pick"}
              </Button>
              <ResetButton onClick={handleReset} />
            </div>
          </div>
        </ToolInputPanel>

        <ToolResultPanel
          title="Winner"
          icon={<Trophy className="h-5 w-5" />}
          isEmpty={!outcome}
          empty="Enter names and click Pick."
        >
          {outcome && (
            <div className="space-y-4">
              <div className="text-center py-2">
                {outcome.winners.length === 1 ? (
                  <p className="text-4xl font-bold text-primary break-words">
                    {outcome.winners[0]}
                  </p>
                ) : (
                  <div className="flex flex-wrap justify-center gap-2">
                    {outcome.winners.map((w, i) => (
                      <Badge key={i} variant="secondary" className="text-base px-3 py-1">
                        {w}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Picked from {names.length} name{names.length === 1 ? "" : "s"} at{" "}
                  {outcome.at}
                </p>
              </div>

              {history.length > 1 && (
                <div>
                  <p className="text-sm font-medium mb-1.5">Recent picks</p>
                  <ul className="space-y-1">
                    {history.slice(1).map((h, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm rounded-md bg-muted/50 px-3 py-1.5"
                      >
                        <span className="truncate">{h.winners.join(", ")}</span>
                        <span className="text-xs text-muted-foreground ml-2">{h.at}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </ToolResultPanel>
      </div>
    </ToolPageLayout>
  );
}
