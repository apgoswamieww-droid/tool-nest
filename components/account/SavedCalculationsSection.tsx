"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Saved calculations section (account page)
//
// History of the user's saved calculations with per-row details
// (inputs + result snapshots) and delete. Records resolve tool names
// through the shared registry; unknown slugs still render safely.
// ──────────────────────────────────────────────────────

import * as React from "react";
import Link from "next/link";
import { Calculator, ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTool } from "@/lib/registry";
import {
  deleteSavedCalculation,
  fetchSavedCalculations,
  type SavedCalculationItem,
} from "@/lib/account/client";

const PAGE_SIZE = 10;

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function RowDetails({ item }: { item: SavedCalculationItem }) {
  const [open, setOpen] = React.useState(false);
  const details = JSON.stringify({ input: item.input, result: item.result }, null, 2);
  return (
    <div className="mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-7 gap-1 text-xs text-muted-foreground"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
        {open ? "Hide details" : "View details"}
      </Button>
      {open && (
        <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted/60 p-3 text-xs leading-relaxed">
          {details}
        </pre>
      )}
    </div>
  );
}

export function SavedCalculationsSection() {
  const [items, setItems] = React.useState<SavedCalculationItem[] | null>(null);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const loadPage = React.useCallback(async (targetPage: number, append: boolean) => {
    setLoading(true);
    try {
      const result = await fetchSavedCalculations({
        page: targetPage,
        pageSize: PAGE_SIZE,
      });
      setItems((current) =>
        append ? [...(current ?? []), ...result.calculations] : result.calculations
      );
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.totalPages);
      setPage(targetPage);
    } catch {
      // Keep whatever is already loaded; the section shows an error hint.
      setItems((current) => current ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadPage(1, false);
  }, [loadPage]);

  const remove = async (id: string) => {
    setBusyId(id);
    const previous = items;
    setItems((current) => current?.filter((i) => i.id !== id) ?? []);
    setTotal((t) => Math.max(0, t - 1));
    try {
      await deleteSavedCalculation(id);
    } catch {
      setItems(previous);
      setTotal((t) => t + 1);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-4 w-4 text-primary" />
          Saved calculations
        </CardTitle>
        <CardDescription>
          {total > 0
            ? `${total} saved calculation${total === 1 ? "" : "s"}`
            : "Your calculation history will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing saved yet. When tools save calculations, they land here so you
            can review inputs and results later.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const tool = getTool(item.toolSlug);
              return (
                <li key={item.id} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {item.title || tool?.name || item.toolSlug}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tool
                          ? `${tool.name} · ${formatDate(item.createdAt)}`
                          : `${item.toolSlug} · ${formatDate(item.createdAt)}`}
                      </p>
                      <RowDetails item={item} />
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {tool && (
                        <Link href={`/tools/${tool.slug}`} title={`Open ${tool.name}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => void remove(item.id)}
                        disabled={busyId === item.id}
                        aria-label="Delete saved calculation"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {items !== null && page < totalPages && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={() => void loadPage(page + 1, true)}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load more"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
