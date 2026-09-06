"use client";

// ──────────────────────────────────────────────────────
// ToolNest — Sign in / Create account form
//
// Credentials sign-in via next-auth/react; registration posts to
// /api/auth/register (bcrypt-hashed server-side) and then signs in.
// After success, redirects to the `callbackUrl` query param when it is
// a safe local path, otherwise home.
// ──────────────────────────────────────────────────────

import * as React from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "signin" | "register";

/** Resolve a safe post-auth redirect (local paths only). */
function safeCallbackUrl(): string {
  if (typeof window === "undefined") return "/";
  const target = new URLSearchParams(window.location.search).get("callbackUrl");
  if (target && target.startsWith("/") && !target.startsWith("//")) return target;
  return "/";
}

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setPassword("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loading) return;
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
            name: name.trim() || undefined,
          }),
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          setError(body?.error ?? "Could not create an account.");
          return;
        }
      }

      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push(safeCallbackUrl());
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isSignIn = mode === "signin";

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            {isSignIn ? (
              <LogIn className="h-5 w-5 text-primary" />
            ) : (
              <UserPlus className="h-5 w-5 text-primary" />
            )}
            {isSignIn ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-sm">
            {isSignIn
              ? "Sign in to save results and unlock your account features."
              : "One account for saved calculations, favorites, and more."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === "register" && (
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  className="mt-1.5"
                  placeholder="Ada Lovelace"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="mt-1.5"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                required
                minLength={mode === "register" ? 8 : undefined}
                className="mt-1.5"
                placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="text-sm text-destructive bg-destructive/10 rounded-md p-2.5"
              >
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="w-full gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignIn ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isSignIn ? (
              <>
                New to ToolNest?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("signin")}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            All tools work without an account — signing in only adds
            saved results and favorites.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
