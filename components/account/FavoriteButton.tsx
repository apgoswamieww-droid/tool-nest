"use client";

// ──────────────────────────────────────────────────────
// ToolNest — FavoriteButton
//
// Heart toggle on every tool page. Signed-out visitors are taken to
// /login with a callbackUrl back to the tool (accounts are free; tools
// always work without one). Signed-in visitors get an optimistic
// toggle persisted through POST /api/favorites.
// ──────────────────────────────────────────────────────

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchFavoriteSlugs, toggleFavorite } from "@/lib/account/client";

interface FavoriteButtonProps {
  toolSlug: string;
  /** Shown in tooltips/aria only — never sent to the server. */
  toolName?: string;
  className?: string;
}

export function FavoriteButton({
  toolSlug,
  toolName,
  className,
}: FavoriteButtonProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const [favorited, setFavorited] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Load the initial state once for signed-in visitors.
  React.useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetchFavoriteSlugs()
      .then((slugs) => {
        if (!cancelled) setFavorited(slugs.includes(toolSlug));
      })
      .catch(() => {
        // Leave the button in the un-favorited state on failure.
      });
    return () => {
      cancelled = true;
    };
  }, [status, toolSlug]);

  if (status === "loading") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("h-8 gap-1.5 text-xs", className)}
        disabled
        aria-label="Loading favorites"
      >
        <Heart className="h-3.5 w-3.5" />
      </Button>
    );
  }

  // Signed out: tools stay fully usable — the heart just explains that
  // saving needs a free account and returns the visitor to this tool.
  if (status !== "authenticated") {
    const callbackUrl = encodeURIComponent(pathname ?? `/tools/${toolSlug}`);
    return (
      <Link href={`/login?callbackUrl=${callbackUrl}`}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          title={`Sign in to save ${toolName ?? "this tool"} to favorites`}
        >
          <Heart className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </Link>
    );
  }

  const handleToggle = async () => {
    if (busy) return;
    const previous = favorited;
    setBusy(true);
    setFavorited(!previous); // optimistic
    try {
      const actual = await toggleFavorite(toolSlug);
      setFavorited(actual);
    } catch {
      setFavorited(previous);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size="sm"
      className={cn("h-8 gap-1.5 text-xs", className)}
      onClick={() => void handleToggle()}
      disabled={busy}
      aria-pressed={favorited}
      title={
        favorited
          ? `Remove ${toolName ?? "this tool"} from favorites`
          : `Save ${toolName ?? "this tool"} to favorites`
      }
    >
      <Heart
        className={cn("h-3.5 w-3.5", favorited && "fill-current")}
      />
      <span className="hidden sm:inline">
        {favorited ? "Saved" : "Save"}
      </span>
    </Button>
  );
}
