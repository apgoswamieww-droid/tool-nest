// ──────────────────────────────────────────────────────
// ToolNest — API key management (docs/api-platform.md §6)
//
// GET  /api/account/keys            — list the signed-in user's keys
// POST /api/account/keys            — issue a new key (shown once)
//
// Session-authenticated (web login), separate from the key-authenticated
// /api/v1 surface. Keys are free; quotaPerDay is a per-key fairness cap
// the owner may lower/raise for themselves (it never gates other users).
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { issueApiKey, hashApiKey, keyPrefixDisplay } from "@/lib/api/keys";

const MAX_KEYS_PER_USER = 50;
const MAX_QUOTA_PER_DAY = 100_000;

const createKeySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  quotaPerDay: z
    .number()
    .int()
    .min(1)
    .max(MAX_QUOTA_PER_DAY)
    .optional()
    .default(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  try {
    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        prefix: true,
        quotaPerDay: true,
        lastUsedAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json({ error: "Failed to list API keys" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = createKeySchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const existing = await prisma.apiKey.count({
      where: { userId: session.user.id },
    });
    if (existing >= MAX_KEYS_PER_USER) {
      return NextResponse.json(
        { error: `Key limit reached (${MAX_KEYS_PER_USER})` },
        { status: 400 }
      );
    }

    const rawKey = issueApiKey();
    const record = await prisma.apiKey.create({
      data: {
        name: parsed.data.name,
        keyHash: hashApiKey(rawKey),
        prefix: keyPrefixDisplay(rawKey),
        quotaPerDay: parsed.data.quotaPerDay,
        userId: session.user.id,
      },
      select: { id: true, name: true, prefix: true, quotaPerDay: true, createdAt: true },
    });

    // The raw key is returned exactly once, here. Store it client-side
    // or it is gone forever — only the hash exists in the database.
    return NextResponse.json(
      { key: rawKey, keyId: record.id, name: record.name, prefix: record.prefix, quotaPerDay: record.quotaPerDay },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json({ error: "Failed to create API key" }, { status: 500 });
  }
}
