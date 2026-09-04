"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Analytics Dashboard (client)
//
// Renders the aggregates from GET /api/analytics/summary — anonymous,
// aggregated counts only; never raw events. Access mirrors the API:
//   - dev without ANALYTICS_DASHBOARD_TOKEN configured → open
//   - production / token configured → the API answers 401 and this
//     page asks for the token (kept in sessionStorage only, sent as an
//     Authorization header — never a cookie or query string).
// ──────────────────────────────────────────────────────

import * as React from "react";
import {
  Activity,
  BarChart3,
  Database,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_EVENT_SPECS,
  ANALYTICS_FUNNELS,
} from "@/lib/analytics";
import type { AnalyticsFunnel } from "@/lib/analytics";
import type { AnalyticsSummary } from "@/lib/analytics/server";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TOKEN_KEY = "analytics.dashboardToken";
const DAY_OPTIONS = [1, 7, 30, 90] as const;
const REFRESH_INTERVAL_MS = 60_000;

class UnauthorizedError extends Error {}

function getStoredToken(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

async function fetchSummary(
  days: number,
  token: string
): Promise<AnalyticsSummary> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api/analytics/summary?days=${days}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) {
    if (res.status === 401) throw new UnauthorizedError();
    throw new Error(`Request failed with status ${res.status}`);
  }
  return (await res.json()) as AnalyticsSummary;
}

type LoadStatus = "loading" | "ready" | "unauthorized" | "error";

export function AnalyticsDashboardClient() {
  const [summary, setSummary] = React.useState<AnalyticsSummary | null>(null);
  const [days, setDays] = React.useState<number>(7);
  const [status, setStatus] = React.useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);
  const [tokenInput, setTokenInput] = React.useState("");

  const tokenRef = React.useRef<string>(getStoredToken());
  const statusRef = React.useRef<LoadStatus>("loading");
  statusRef.current = status;

  const load = React.useCallback(async (d: number, token: string) => {
    try {
      const data = await fetchSummary(d, token);
      setSummary(data);
      setErrorMessage(null);
      setStatus("ready");
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        // Drop a stale stored token so the gate starts fresh.
        tokenRef.current = "";
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(TOKEN_KEY);
        }
        setStatus("unauthorized");
      } else {
        setErrorMessage(
          e instanceof Error ? e.message : "Failed to load analytics"
        );
        setStatus("error");
      }
    }
  }, []);

  // Load on mount and whenever the day range changes.
  React.useEffect(() => {
    void load(days, tokenRef.current);
  }, [days, load]);

  // Quiet auto-refresh while the tab is visible and data is showing.
  React.useEffect(() => {
    const id = setInterval(() => {
      if (statusRef.current !== "ready") return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden")
        return;
      void load(days, tokenRef.current);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [days, load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await load(days, tokenRef.current);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTokenSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const token = tokenInput.trim();
    if (!token) return;
    tokenRef.current = token;
    if (typeof window !== "undefined") {
      sessionStorage.setItem(TOKEN_KEY, token);
    }
    setStatus("loading");
    void load(days, token);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Anonymous, aggregated product analytics — never raw events or
            personal data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-0.5">
            {DAY_OPTIONS.map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => setDays(d)}
              >
                {d}d
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
          </Button>
        </div>
      </div>

      {errorMessage && summary && (
        <div className="mt-6 rounded-md bg-destructive/10 text-destructive text-sm p-3">
          {errorMessage} — showing the last successful refresh.
        </div>
      )}

      {status === "unauthorized" ? (
        <TokenGate
          tokenInput={tokenInput}
          onTokenInput={setTokenInput}
          onSubmit={handleTokenSubmit}
        />
      ) : status === "error" && !summary ? (
        <ErrorCard message={errorMessage ?? "Failed to load analytics"} />
      ) : !summary ? (
        <LoadingState />
      ) : (
        <DashboardBody summary={summary} />
      )}
    </div>
  );
}

// ── Sections ─────────────────────────────────────────

function DashboardBody({ summary }: { summary: AnalyticsSummary }) {
  const totals = new Map(summary.byEvent.map((e) => [e.event, e.count]));

  const byEvent: EventCountMap = new Map();
  for (const e of summary.byEvent) byEvent.set(e.event, e.count);

  const toolUsageFunnel = ANALYTICS_FUNNELS.find((f) => f.id === "tool-usage");
  const funnelCounts = toolUsageFunnel?.steps.map((step) =>
    step.events.reduce((sum, ev) => sum + (byEvent.get(ev) ?? 0), 0)
  ) ?? [];
  const completionPct =
    funnelCounts.length > 1 && funnelCounts[0] > 0
      ? Math.round(
          (funnelCounts[funnelCounts.length - 1] / funnelCounts[0]) * 100
        )
      : null;

  const averagePerDay = summary.days > 0 ? summary.totalEvents / summary.days : 0;

  return (
    <>
      {/* Stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label={`Events · last ${summary.days} days`}
          value={summary.totalEvents.toLocaleString()}
        />
        <StatCard
          icon={<BarChart3 className="h-4 w-4" />}
          label="Average per day"
          value={averagePerDay.toFixed(1)}
        />
        <StatCard
          icon={<Activity className="h-4 w-4" />}
          label="Tool funnel completion"
          value={completionPct === null ? "—" : `${completionPct}%`}
          sub={
            completionPct !== null
              ? "outcome ÷ tool opened"
              : "no tool_opened data yet"
          }
        />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Storage"
          value={
            <Badge
              variant={summary.mode === "prisma" ? "default" : "secondary"}
            >
              {summary.mode}
            </Badge>
          }
          sub={
            summary.mode === "memory"
              ? "in-memory — resets on restart"
              : "Postgres · analytics_events"
          }
        />
      </div>

      {/* Funnels */}
      <h2 className="text-lg font-semibold mt-10 mb-3">Funnels</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {ANALYTICS_FUNNELS.map((funnel) => (
          <FunnelCard key={funnel.id} funnel={funnel} byEvent={byEvent} />
        ))}
      </div>

      {/* Events + top tools */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <EventTable summary={summary} totals={totals} />
          </CardContent>
        </Card>
        <TopToolsCard summary={summary} />
      </div>

      <p className="mt-10 text-xs text-muted-foreground text-right">
        Updated{" "}
        {new Date(summary.generatedAt).toLocaleTimeString()}
      </p>
    </>
  );
}

// ── Stat card ────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <div className="mt-2 text-2xl font-semibold tabular-nums">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ── Funnel card ──────────────────────────────────────

type EventCountMap = Map<string, number>;

function FunnelCard({
  funnel,
  byEvent,
}: {
  funnel: AnalyticsFunnel;
  byEvent: EventCountMap;
}) {
  const counts = funnel.steps.map((step) =>
    step.events.reduce((sum, ev) => sum + (byEvent.get(ev) ?? 0), 0)
  );
  const baseline = counts[0] ?? 0;
  const pcts = counts.map((c) =>
    baseline > 0 ? Math.round((c / baseline) * 100) : 0
  );
  const last = counts.length - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{funnel.name}</CardTitle>
        {funnel.description && (
          <p className="text-xs text-muted-foreground">{funnel.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {funnel.steps.map((step, i) => (
          <div key={i}>
            <div className="flex items-baseline justify-between gap-2 text-sm mb-1">
              <span className="text-muted-foreground truncate">
                {i + 1}. {step.label}
              </span>
              <span className="tabular-nums whitespace-nowrap">
                {counts[i].toLocaleString()}
                {i > 0 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {pcts[i]}%
                  </span>
                )}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  i === 0
                    ? "bg-primary"
                    : i === last
                      ? "bg-green-500/80"
                      : "bg-primary/60"
                )}
                style={{ width: `${pcts[i]}%` }}
              />
            </div>
          </div>
        ))}
        {last > 0 && (
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Completion:{" "}
            <span className="font-medium text-foreground">
              {pcts[last]}%
            </span>{" "}
            ({counts[last].toLocaleString()} of {baseline.toLocaleString()})
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Event table ──────────────────────────────────────

function EventTable({
  summary,
  totals,
}: {
  summary: AnalyticsSummary;
  totals: Map<string, number>;
}) {
  // Union of every registered event (zero-count rows are informative).
  const rows = ANALYTICS_EVENT_NAMES.map((name) => ({
    name,
    count: totals.get(name) ?? 0,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 text-left font-medium">Event</th>
            <th className="hidden md:table-cell px-5 py-3 text-left font-medium">
              Description
            </th>
            <th className="px-5 py-3 text-right font-medium">Count</th>
            <th className="px-5 py-3 text-right font-medium">Share</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ name, count }) => {
            const spec = ANALYTICS_EVENT_SPECS[name];
            const share =
              summary.totalEvents > 0 ? (count / summary.totalEvents) * 100 : 0;
            return (
              <tr
                key={name}
                className="border-b last:border-0 hover:bg-muted/40"
              >
                <td className="px-5 py-2.5 font-mono text-xs">{name}</td>
                <td className="hidden md:table-cell px-5 py-2.5 text-muted-foreground text-xs">
                  {spec.description}
                </td>
                <td className="px-5 py-2.5 text-right tabular-nums">
                  {count.toLocaleString()}
                </td>
                <td className="px-5 py-2.5">
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.min(100, share)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                      {Math.round(share)}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Top tools ────────────────────────────────────────

function TopToolsCard({ summary }: { summary: AnalyticsSummary }) {
  const top = summary.byTool.slice(0, 10);
  const max = top.length > 0 ? top[0].count : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {top.length === 0 && (
          <p className="text-sm text-muted-foreground">No tool events yet.</p>
        )}
        {top.map((row) => (
          <div key={row.tool} className="flex items-center gap-3">
            <span className="w-36 truncate text-xs">{row.tool}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary/80"
                style={{
                  width: `${max > 0 ? (row.count / max) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs tabular-nums w-14 text-right text-muted-foreground">
              {row.count.toLocaleString()}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ── Daily timeline ───────────────────────────────────

function LoadingState() {
  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border bg-muted/30 h-28" />
      ))}
    </div>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="mt-8 mx-auto max-w-md">
      <CardContent className="p-6 text-center">
        <p className="text-sm text-destructive">{message}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Try refreshing. If this persists, the summary API may be down.
        </p>
      </CardContent>
    </Card>
  );
}

function TokenGate({
  tokenInput,
  onTokenInput,
  onSubmit,
}: {
  tokenInput: string;
  onTokenInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <Card className="mt-10 mx-auto max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="h-4 w-4" /> Dashboard protected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This dashboard reads the summary API, which requires the{" "}
          <code className="text-xs">ANALYTICS_DASHBOARD_TOKEN</code> in
          production. Enter it to view the aggregates.
        </p>
        <form onSubmit={onSubmit} className="flex gap-2 mt-4">
          <Input
            type="password"
            value={tokenInput}
            onChange={(e) => onTokenInput(e.target.value)}
            placeholder="Dashboard token"
            className="flex-1"
          />
          <Button type="submit" disabled={!tokenInput.trim()}>
            Unlock
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-3">
          Stored only in this tab's session storage and sent as an
          Authorization header — never a cookie or URL parameter.
        </p>
      </CardContent>
    </Card>
  );
}


