"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Premium tool gate (locked experience)
//
// Shown on premium tool pages when the visitor is not entitled
// (docs/monetization.md §4.2). Renders inside <ToolPageLayout>, so the
// page keeps its full chrome (breadcrumbs, related tools, FAQ) and the
// URL stays crawlable — a gate, never a 404.
//
// Upgrade surface:
//   - signed out  → "Get Premium" routes to /login with a callbackUrl
//     back to this tool (accounts are free; plan unlocks here).
//   - signed in   → reflects the free plan and points at the next
//     milestone (checkout). Swap `href` for the billing route when the
//     webhook lands — no other change needed.
// Guardrails honored: no popup, no interstitial before first use, free
// tools always linked from the gate.
// ──────────────────────────────────────────────────────

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Crown, Check, ArrowRight } from "lucide-react";
import { getTool } from "@/lib/registry";
import { ToolPageLayout } from "@/components/tool/ToolPageLayout";
import { PremiumBadge } from "./PremiumBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Resolves the tool from the registry client-side — the server only
 * passes the slug, because the full Tool object carries a component
 * (icon) that must not cross the server → client boundary.
 */
export function PremiumGate({ toolSlug }: { toolSlug: string }) {
  const tool = getTool(toolSlug)!;
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated";
  const Icon = tool.icon;
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/tools/${tool.slug}`)}`;
  const features = tool.premiumFeatures?.length
    ? tool.premiumFeatures
    : ["Full access to this premium tool", "No ads on premium pages"];

  return (
    <ToolPageLayout tool={tool}>
      <Card className="max-w-2xl mx-auto overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-amber-500/80 via-amber-400/80 to-amber-500/80" />
        <CardHeader className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Icon className="h-7 w-7" />
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <CardTitle className="text-2xl">{tool.name}</CardTitle>
            <PremiumBadge />
          </div>
          <CardDescription className="max-w-md mx-auto text-sm">
            {tool.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <ul className="space-y-2.5 mx-auto max-w-md">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="border-t pt-5 text-center">
            {signedIn ? (
              <>
                <p className="text-sm text-muted-foreground mb-3">
                  You're signed in on the{" "}
                  <span className="font-medium text-foreground">Free plan</span>.
                </p>
                <Button className="gap-2" disabled>
                  <Crown className="h-4 w-4" />
                  Activate Premium
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Checkout is being wired up — premium tools activate on your
                  account as soon as it ships.
                </p>
              </>
            ) : (
              <>
                <Button asChild className="gap-2">
                  <Link href={loginHref}>
                    <Crown className="h-4 w-4" />
                    Get Premium
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Accounts are free and take seconds — Premium unlocks on your
                  plan.
                </p>
              </>
            )}

            <div className="mt-5">
              <Link
                href="/tools"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Free tools stay free — browse all {">"} 50 tools
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolPageLayout>
  );
}
