"use client";

import * as React from "react";
import { getTool } from "@/lib/registry";
import { Timer, ArrowLeftRight, Clock } from "lucide-react";
import {
  listTimeZones,
  convertTimeZone,
  validateConvertInput,
  getOffsetMinutes,
  formatOffset,
  type TimeZoneInfo,
} from "@/lib/tools/time-zone";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { ToolInputPanel } from "@/components/tool/ToolInputPanel";
import { ToolResultPanel } from "@/components/tool/ToolResultPanel";
import { ResetButton } from "@/components/tool/ResetButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function localParts(date: Date) {
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export default function TimeZoneConverterClient() {
  const tool = getTool("time-zone-converter")!;
  const localZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const [zones, setZones] = React.useState<TimeZoneInfo[]>([]);
  const [sourceZone, setSourceZone] = React.useState(localZone);
  const [targetZone, setTargetZone] = React.useState("America/New_York");
  const [query, setQuery] = React.useState<"source" | "target" | null>(null);
  const [search, setSearch] = React.useState("");
  const [now, setNow] = React.useState(() => new Date());
  const [date, setDate] = React.useState(() => localParts(new Date()).date);
  const [time, setTime] = React.useState(() => localParts(new Date()).time);

  // Curated zone list, computed once on the client (offsets reflect DST now).
  React.useEffect(() => {
    setZones(listTimeZones(new Date()));
  }, []);

  // Live clock for the current-time row.
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // If the browser zone isn't in the curated list, fall back to UTC label.
  const sourceInfo =
    zones.find((z) => z.id === sourceZone) ??
    (isValid(sourceZone)
      ? {
          id: sourceZone,
          city: sourceZone.split("/").pop()?.replace(/_/g, " ") ?? sourceZone,
          name: sourceZone,
          offsetMinutes: getOffsetMinutes(sourceZone),
          offsetLabel: formatOffset(getOffsetMinutes(sourceZone)),
        }
      : undefined);
  const targetInfo =
    zones.find((z) => z.id === targetZone) ??
    (isValid(targetZone)
      ? {
          id: targetZone,
          city: targetZone.split("/").pop()?.replace(/_/g, " ") ?? targetZone,
          name: targetZone,
          offsetMinutes: getOffsetMinutes(targetZone),
          offsetLabel: formatOffset(getOffsetMinutes(targetZone)),
        }
      : undefined);

  function isValid(z: string): boolean {
    try {
      new Intl.DateTimeFormat("en", { timeZone: z }).format(now);
      return true;
    } catch {
      return false;
    }
  }

  const input = { date, time, sourceZone, targetZone };
  const error = validateConvertInput(input);
  const result = error ? null : convertTimeZone(input);

  const offsetDiff =
    sourceInfo && targetInfo ? targetInfo.offsetMinutes - sourceInfo.offsetMinutes : 0;

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? zones.filter(
          (z) =>
            z.city.toLowerCase().includes(q) ||
            z.id.toLowerCase().includes(q) ||
            z.name.toLowerCase().includes(q)
        )
      : zones;
    return base.slice(0, 40);
  }, [zones, search]);

  const openPicker = (which: "source" | "target") => {
    setQuery(which);
    setSearch("");
  };

  const pickZone = (id: string) => {
    if (query === "source") setSourceZone(id);
    if (query === "target") setTargetZone(id);
    setQuery(null);
  };

  const swap = () => {
    setSourceZone(targetZone);
    setTargetZone(sourceZone);
  };

  const useNow = () => {
    const p = localParts(new Date());
    setDate(p.date);
    setTime(p.time);
  };

  const sourceLabel = (z: TimeZoneInfo | undefined) =>
    z ? `${z.city} — ${z.offsetLabel}` : "Select timezone…";

  return (
    <ToolPageLayout tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolInputPanel title="From → To" icon={<Timer className="h-5 w-5" />}>
          <div className="space-y-4">
            {/* Source zone */}
            <div>
              <Label>From timezone</Label>
              <Button
                variant="outline"
                className="w-full justify-between mt-1.5 font-normal"
                onClick={() => openPicker("source")}
              >
                <span>{sourceLabel(sourceInfo)}</span>
                <span className="text-xs text-muted-foreground">change</span>
              </Button>
            </div>

            {/* Target zone */}
            <div>
              <Label>To timezone</Label>
              <Button
                variant="outline"
                className="w-full justify-between mt-1.5 font-normal"
                onClick={() => openPicker("target")}
              >
                <span>{sourceLabel(targetInfo)}</span>
                <span className="text-xs text-muted-foreground">change</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={swap}>
                <ArrowLeftRight className="h-4 w-4 mr-1" /> Swap
              </Button>
            </div>

            {/* Date & time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tz-date">Date</Label>
                <Input
                  id="tz-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="tz-time">Time</Label>
                <Input
                  id="tz-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <Button variant="secondary" size="sm" onClick={useNow}>
              <Clock className="h-4 w-4 mr-1" /> Use current time
            </Button>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </ToolInputPanel>

        <div className="space-y-4">
          <ToolResultPanel
            title="Converted Time"
            icon={<Timer className="h-5 w-5" />}
            isEmpty={!result}
            empty="Pick two timezones to convert instantly."
          >
            {result && (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-5xl font-bold text-primary">{result.time12}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.weekday}, {result.date} · {result.time24} (24h)
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="outline">{result.offsetLabel}</Badge>
                  <Badge
                    variant={result.dayShift === 0 ? "secondary" : "default"}
                  >
                    {result.dayShift === 0
                      ? "same day"
                      : result.dayShift > 0
                        ? `+${result.dayShift} day${result.dayShift > 1 ? "s" : ""}`
                        : `${result.dayShift} day${result.dayShift < -1 ? "s" : ""}`}
                  </Badge>
                  {offsetDiff !== 0 && (
                    <Badge variant="secondary">
                      {formatOffset(Math.abs(offsetDiff))}{" "}
                      {offsetDiff > 0 ? "ahead" : "behind"} source
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </ToolResultPanel>

          {/* Live current time in both zones */}
          {sourceInfo && targetInfo && (
            <div className="grid grid-cols-2 gap-3">
              {[sourceInfo, targetInfo].map((z, i) => (
                <div key={z.id} className="rounded-md border bg-muted/30 p-3 text-center">
                  <p className="text-xs text-muted-foreground">
                    {i === 0 ? "Now in source" : "Now in target"}
                  </p>
                  <p className="text-lg font-semibold">
                    {new Intl.DateTimeFormat("en-US", {
                      timeZone: z.id,
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    }).format(now)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {z.city} · {z.offsetLabel}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timezone picker dialog */}
      {query && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQuery(null)}
        >
          <div
            className="w-full max-w-md rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b">
              <Input
                autoFocus
                placeholder="Search city or timezone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-1">
              {filtered.map((z) => (
                <li key={z.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent flex items-center justify-between text-sm"
                    onClick={() => pickZone(z.id)}
                  >
                    <span>
                      <span className="font-medium">{z.city}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{z.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{z.offsetLabel}</span>
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No matching timezone
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
