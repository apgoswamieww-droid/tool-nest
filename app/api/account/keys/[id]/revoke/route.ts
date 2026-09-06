// ──────────────────────────────────────────────────────
// ToolNest — API key revocation (docs/api-platform.md §6)
//
// POST /api/account/keys/[id]/revoke — session-authenticated, owner
// only. Sets revokedAt; the key stops authenticating immediately
// (403 FORBIDDEN). Rotate = revoke + issue a new key.
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ error: "Invalid key id" }, { status: 400 });
  }

  try {
    const result = await prisma.apiKey.updateMany({
      where: { id, userId: session.user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { error: "API key not found or already revoked" },
        { status: 404 }
      );
    }
    return NextResponse.json({ revoked: true });
  } catch (error) {
    console.error("Error revoking API key:", error);
    return NextResponse.json({ error: "Failed to revoke API key" }, { status: 500 });
  }
}
