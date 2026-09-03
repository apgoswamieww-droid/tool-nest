"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Dice6, Plus, Trash2, RotateCcw, Maximize2 } from "lucide-react";
import {
  createEntries,
  spinWheel,
  getSpinAngle,
  WheelEntry,
  DEFAULT_ENTRIES,
} from "@/lib/tools/wheel-spinner";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const WHEEL_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f43f5e", "#a855f7", "#6366f1",
];

interface WheelSpinnerClientProps {}

export default function WheelSpinnerClient(props: WheelSpinnerClientProps) {
  const tool = getTool("wheel-spinner")!;
  const [entries, setEntries] = React.useState<WheelEntry[]>(() =>
    createEntries(DEFAULT_ENTRIES)
  );
  const [inputText, setInputText] = React.useState(
    DEFAULT_ENTRIES.join("\n")
  );
  const [winner, setWinner] = React.useState<WheelEntry | null>(null);
  const [isSpinning, setIsSpinning] = React.useState(false);
  const [rotation, setRotation] = React.useState(0);
  const [showResult, setShowResult] = React.useState(false);
  const [fullscreen, setFullscreen] = React.useState(false);
  const wheelRef = React.useRef<HTMLDivElement>(null);

  const handleUpdateEntries = () => {
    const lines = inputText.split("\n").filter((l) => l.trim());
    setEntries(createEntries(lines));
    setWinner(null);
    setShowResult(false);
  };

  const handleSpin = () => {
    if (entries.length < 2 || isSpinning) return;

    setShowResult(false);
    setWinner(null);
    setIsSpinning(true);

    const selected = spinWheel(entries);
    const angle = getSpinAngle(entries.indexOf(selected), entries.length);

    setRotation((prev) => prev + angle);

    setTimeout(() => {
      setWinner(selected);
      setIsSpinning(false);
      setShowResult(true);
    }, 4500);
  };

  const handleReset = () => {
    setEntries(createEntries(DEFAULT_ENTRIES));
    setInputText(DEFAULT_ENTRIES.join("\n"));
    setWinner(null);
    setRotation(0);
    setShowResult(false);
  };

  const segmentAngle = 360 / entries.length;

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <ToolInputPanel
          title="Options"
          icon={<Plus className="h-5 w-5" />}
          className="lg:col-span-1"
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="entries-input">Enter options (one per line)</Label>
              <textarea
                id="entries-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onBlur={handleUpdateEntries}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={8}
                className="mt-1.5 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {entries.length} options • {entries.length >= 2 ? "Ready to spin" : "Add at least 2 options"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSpin}
                disabled={entries.length < 2 || isSpinning}
                className="flex-1"
              >
                <RotateCcw className={`h-4 w-4 ${isSpinning ? "animate-spin" : ""}`} />
                {isSpinning ? "Spinning…" : "Spin!"}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </ToolInputPanel>

        {/* Wheel Display */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square mx-auto">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary" />
            </div>

            {/* Wheel */}
            <div
              ref={wheelRef}
              className="w-full h-full rounded-full border-4 border-primary/20 shadow-lg overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                  : "none",
              }}
            >
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {entries.map((entry, i) => {
                  const startAngle = i * segmentAngle - 90;
                  const endAngle = (i + 1) * segmentAngle - 90;
                  const startRad = (startAngle * Math.PI) / 180;
                  const endRad = (endAngle * Math.PI) / 180;
                  const x1 = 100 + 100 * Math.cos(startRad);
                  const y1 = 100 + 100 * Math.sin(startRad);
                  const x2 = 100 + 100 * Math.cos(endRad);
                  const y2 = 100 + 100 * Math.sin(endRad);
                  const largeArc = segmentAngle > 180 ? 1 : 0;
                  const midAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
                  const textX = 100 + 65 * Math.cos(midAngle);
                  const textY = 100 + 65 * Math.sin(midAngle);
                  const textRotation = (startAngle + endAngle) / 2;

                  return (
                    <g key={entry.id}>
                      <path
                        d={`M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`}
                        fill={entry.color}
                        stroke="white"
                        strokeWidth="1"
                      />
                      <text
                        x={textX}
                        y={textY}
                        fill="white"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                      >
                        {entry.label.length > 12
                          ? entry.label.slice(0, 12) + "…"
                          : entry.label}
                      </text>
                    </g>
                  );
                })}
                {/* Center circle */}
                <circle cx="100" cy="100" r="15" fill="white" stroke="var(--primary)" strokeWidth="3" />
                <text x="100" y="101" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="bold" fill="var(--primary)">
                  SPIN
                </text>
              </svg>
            </div>
          </div>

          {/* Result Display */}
          {showResult && winner && (
            <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Badge variant="outline" className="text-sm mb-2">🎉 Winner</Badge>
              <h2 className="text-3xl font-bold text-primary">
                {winner.label}
              </h2>
              <Button
                onClick={handleSpin}
                variant="outline"
                className="mt-4"
                disabled={isSpinning}
              >
                <RotateCcw className="h-4 w-4" />
                Spin Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </ToolPageLayout>
  );
}
