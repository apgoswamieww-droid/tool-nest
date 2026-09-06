// ──────────────────────────────────────────────────────
// ToolNest — Disposable-email domain check
//
// POST /api/auth/check-email
//   Body: { email }
//   Returns { disposable: boolean } — a DOMAIN-level check only, so it
//   reveals nothing about whether an account exists (no enumeration).
//   Used by the register form for inline, pre-submit feedback; the
//   authoritative block remains in /api/auth/register.
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDisposableEmail } from "@/lib/email-disposable";

const bodySchema = z.object({
  email: z.email("Enter a valid email address"),
});

// Generous per-IP throttle — the debounced client fires rarely; this only
// caps abuse. Never logs or stores the email itself.
const CHECK_MAX = 60;
const CHECK_WINDOW_MS = 60_000;
const checkAttempts = new Map<string, { count: number; resetAt: number }>();

function checkThrottled(key: string): boolean {
  const now = Date.now();
  const entry = checkAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    checkAttempts.set(key, { count: 1, resetAt: now + CHECK_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > CHECK_MAX;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (checkThrottled(ip)) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  return NextResponse.json({ disposable: isDisposableEmail(email) });
}
