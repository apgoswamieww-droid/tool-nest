// ──────────────────────────────────────────────────────
// ToolNest — Favorites by ToolSlug API
// DELETE /api/favorites/[toolSlug] — Remove a favorite
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFavorite } from "@/lib/db/favorites";

/**
 * DELETE /api/favorites/[toolSlug]
 * Remove a tool from user's favorites.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ toolSlug: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { toolSlug } = await params;

    if (!toolSlug || typeof toolSlug !== "string") {
      return NextResponse.json(
        { error: "toolSlug is required" },
        { status: 400 }
      );
    }

    await removeFavorite(session.user.id, toolSlug);
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
