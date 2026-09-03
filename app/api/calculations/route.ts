// ──────────────────────────────────────────────────────
// ToolNest — Calculations API
// GET /api/calculations — List saved calculations
// POST /api/calculations — Save a calculation
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserCalculations,
  saveCalculation,
} from "@/lib/db/calculations";

/**
 * GET /api/calculations
 * Returns saved calculations for the authenticated user.
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

    const result = await getUserCalculations(session.user.id, {
      toolSlug,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching calculations:", error);
    return NextResponse.json(
      { error: "Failed to fetch calculations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calculations
 * Save a new calculation.
 * Body: { toolSlug, title?, toolVersion?, input, result }
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
    const { toolSlug, title, toolVersion, input, result } = body;

    // Validate required fields
    if (!toolSlug || typeof toolSlug !== "string") {
      return NextResponse.json(
        { error: "toolSlug is required" },
        { status: 400 }
      );
    }

    if (!input || typeof input !== "object") {
      return NextResponse.json(
        { error: "input is required and must be an object" },
        { status: 400 }
      );
    }

    if (!result || typeof result !== "object") {
      return NextResponse.json(
        { error: "result is required and must be an object" },
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

    // Validate title length
    if (title && title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400 }
      );
    }

    const calculation = await saveCalculation(session.user.id, {
      toolSlug,
      title,
      toolVersion,
      input,
      result,
    });

    return NextResponse.json({ calculation }, { status: 201 });
  } catch (error) {
    console.error("Error saving calculation:", error);
    return NextResponse.json(
      { error: "Failed to save calculation" },
      { status: 500 }
    );
  }
}
