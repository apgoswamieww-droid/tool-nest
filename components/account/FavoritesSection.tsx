"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Favorites section (account page)
//
// Lists the signed-in user's favorite tools with quick links and a
// remove action. Tool metadata (name, icon, category) resolves from the
// shared registry, so cards match the rest of the site.
// ──────────────────────────────────────────────────────

import * as React from "react";
import Link from "next/link";
import { Star, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTool } from "@/lib/registry";
import { fetchFavoriteSlugs, toggleFavorite } from "@/lib/account/client";

export function FavoritesSection() {
  const [slugs, setSlugs] = React.useState<string[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetchFavoriteSlugs()
      .then((list) => {
        if (!cancelled) setSlugs(list);
      })
      .catch(() => {
        if (!cancelled) setSlugs([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const remove = async (slug: string) => {
    setBusy(slug);
    const previous = slugs;
    setSlugs((current) => current?.filter((s) => s !== slug) ?? []);
    try {
      await toggleFavorite(slug); // toggles off
    } catch {
      setSlugs(previous ?? []);
    } finally {
      setBusy(null);
    }
  };

  const tools =
    slugs === null
      ? null
      : slugs
          .map((slug) => ({ slug, tool: getTool(slug) }))
          .filter((entry): entry is { slug: string; tool: NonNullable<ReturnType<typeof getTool>> } => !!entry.tool);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="h-4 w-4 text-primary" />
          Favorite tools
        </CardTitle>
        <CardDescription>
          Tools you saved from their pages — jump back to any of them in one click.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tools === null ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : tools.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No favorites yet. Open any tool and press{" "}
            <Star className="inline h-3.5 w-3.5 -translate-y-px" /> Save to pin it here.
          </p>
        ) : (
          <ul className="space-y-2">
            {tools.map(({ slug, tool }) => {
              const Icon = tool.icon;
              return (
                <li
                  key={slug}
                  className="flex items-center gap-3 rounded-lg border p-2.5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <Link
                    href={`/tools/${slug}`}
                    className="min-w-0 flex-1"
                    title={`Open ${tool.name}`}
                  >
                    <p className="truncate text-sm font-medium">{tool.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {tool.description}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => void remove(slug)}
                    disabled={busy === slug}
                    aria-label={`Remove ${tool.name} from favorites`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
