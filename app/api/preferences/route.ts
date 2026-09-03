// ──────────────────────────────────────────────────────
// ToolNest — User Preferences API
// GET /api/preferences — Get user preferences
// PUT /api/preferences — Update user preferences
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserPreferences, updateUserPreferences } from "@/lib/db/preferences";

/**
 * GET /api/preferences
 * Get user preferences (creates defaults if they don't exist).
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
    const preferences = await getUserPreferences(session.user.id);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/preferences
 * Update user preferences.
 * Body: { theme?, language?, defaults? }
 */
export async function PUT(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { theme, language, defaults } = body;

    // Validate theme
    if (theme && !["light", "dark", "system"].includes(theme)) {
      return NextResponse.json(
        { error: "Invalid theme value" },
        { status: 400 }
      );
    }

    // Validate language code length
    if (language && (typeof language !== "string" || language.length > 10)) {
      return NextResponse.json(
        { error: "Invalid language code" },
        { status: 400 }
      );
    }

    const preferences = await updateUserPreferences(session.user.id, {
      theme,
      language,
      defaults,
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}
