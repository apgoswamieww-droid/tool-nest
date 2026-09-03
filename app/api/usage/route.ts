// ──────────────────────────────────────────────────────
// ToolNest — Usage History API
// GET /api/usage — Get usage history
// POST /api/usage — Record usage event
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserUsageHistory,
  recordUsage,
} from "@/lib/db/usage-history";

/**
 * GET /api/usage
 * Returns usage history for the authenticated user.
 * Query params: toolSlug, page, pageSize
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get("toolSlug") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    // Validate pagination params
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const result = await getUserUsageHistory(session.user.id, {
      toolSlug,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching usage history:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage history" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/usage
 * Record a tool usage event.
 * Body: { toolSlug, action, metadata? }
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
    const { toolSlug, action, metadata } = body;

    // Validate required fields
    if (!toolSlug || typeof toolSlug !== "string") {
      return NextResponse.json(
        { error: "toolSlug is required" },
        { status: 400 }
      );
    }

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "action is required" },
        { status: 400 }
      );
    }

    // Validate toolSlug format
    if (!/^[a-z0-9-]{1,100}$/.test(toolSlug)) {
      return NextResponse.json(
        { error: "Invalid toolSlug format" },
        { status: 400 }
      );
    }

    // Validate action length
    if (action.length > 50) {
      return NextResponse.json(
        { error: "Action must be 50 characters or less" },
        { status: 400 }
      );
    }

    // Validate metadata
    if (metadata && typeof metadata !== "object") {
      return NextResponse.json(
        { error: "metadata must be an object" },
        { status: 400 }
      );
    }

    await recordUsage(session.user.id, {
      toolSlug,
      action,
      metadata,
    });

    return NextResponse.json({ recorded: true }, { status: 201 });
  } catch (error) {
    console.error("Error recording usage:", error);
    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    );
  }
}
