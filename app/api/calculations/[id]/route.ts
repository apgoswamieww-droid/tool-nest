// ──────────────────────────────────────────────────────
// ToolNest — Saved calculation item
// DELETE /api/calculations/[id] — delete one of the signed-in user's
// saved calculations (owner-scoped; 404 when it isn't theirs).
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ error: "Invalid calculation id" }, { status: 400 });
  }

  try {
    const result = await prisma.savedCalculation.deleteMany({
      where: { id, userId: session.user.id },
    });
    if (result.count === 0) {
      return NextResponse.json(
        { error: "Saved calculation not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error deleting saved calculation:", error);
    return NextResponse.json(
      { error: "Failed to delete saved calculation" },
      { status: 500 }
    );
  }
}
