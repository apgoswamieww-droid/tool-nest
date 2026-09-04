// ──────────────────────────────────────────────────────
// ToolNest — Registration API
//
// POST /api/auth/register
//   Body: { email, password, name? }
//   Hashes the password (bcrypt) and creates the account + default
//   preferences. The client then signs in via the Credentials provider.
//   Returns 409 when the email is already registered.
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createUser } from "@/lib/db/users";

const registerSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  name: z.string().trim().min(1).max(60).optional(),
});

// Coarse per-IP limiter (single-instance guard, like lib/auth.ts).
const REGISTER_MAX = 10;
const REGISTER_WINDOW_MS = 60_000;
const registerAttempts = new Map<string, { count: number; resetAt: number }>();

function registerThrottled(key: string): boolean {
  const now = Date.now();
  const entry = registerAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    registerAttempts.set(key, { count: 1, resetAt: now + REGISTER_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > REGISTER_MAX;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (registerThrottled(ip)) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      name: parsed.data.name || email.split("@")[0],
      passwordHash,
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    // Unique-constraint race (concurrent registration of same email).
    const isUniqueViolation =
      typeof error === "object" &&
      error !== null &&
      (error as { code?: string }).code === "P2002";
    if (isUniqueViolation) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}
