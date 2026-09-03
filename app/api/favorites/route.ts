// ──────────────────────────────────────────────────────
// ToolNest — Favorites API
// GET /api/favorites — List user's favorite tools
// POST /api/favorites — Add a favorite tool
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserFavorites,
  addFavorite,
  toggleFavorite,
} from "@/lib/db/favorites";

/**
 * GET /api/favorites
 * Returns all favorite tools for the authenticated user.
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const favorites = await getUserFavorites(session.user.id);
    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 * Add or toggle a favorite tool.
 * Body: { toolSlug: string }
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { toolSlug } = body;

    if (!toolSlug || typeof toolSlug !== "string") {
      return NextResponse.json(
        { error: "toolSlug is required" },
        { status: 400 }
      );
    }

    // Validate toolSlug format (alphanumeric + hyphens, max 100 chars)
    if (!/^[a-z0-9-]{1,100}$/.test(toolSlug)) {
      return NextResponse.json(
        { error: "Invalid toolSlug format" },
        { status: 400 }
      );
    }

    const isFavorited = await toggleFavorite(session.user.id, toolSlug);
    return NextResponse.json({ favorited: isFavorited });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
