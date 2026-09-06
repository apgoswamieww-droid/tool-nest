"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Account client
//
// Session-gated account hub. While loading, renders a placeholder;
// signed-out visitors get a prompt to sign in (with a callback back
// here), never a forced redirect. Signed-in visitors see their
// favorites, saved calculations, and preferences.
// ──────────────────────────────────────────────────────

import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FavoritesSection } from "@/components/account/FavoritesSection";
import { SavedCalculationsSection } from "@/components/account/SavedCalculationsSection";
import { PreferencesPanel } from "@/components/account/PreferencesPanel";

function ProfileCard() {
  const { data: session } = useSession();
  const name = session?.user?.name || session?.user?.email?.split("@")[0];
  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UserCircle2 className="h-7 w-7" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">{name ?? "Signed in"}</p>
        <p className="truncate text-sm text-muted-foreground">
          {session?.user?.email}
        </p>
      </div>
    </div>
  );
}

export function AccountClient() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-muted-foreground">Loading your account…</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <UserCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Sign in to manage your account</h1>
        <p className="mt-2 text-muted-foreground">
          All tools are free and work without an account. Signing in adds favorites,
          saved calculations, and preferences.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link href="/login?callbackUrl=/account">
            <Button className="gap-2">
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </Link>
          <Link href="/tools">
            <Button variant="outline">Browse tools</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 sm:py-12">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">My account</h1>
      <div className="space-y-6">
        <ProfileCard />
        <div className="grid gap-6 lg:grid-cols-2">
          <FavoritesSection />
          <SavedCalculationsSection />
        </div>
        <PreferencesPanel />
      </div>
    </div>
  );
}
