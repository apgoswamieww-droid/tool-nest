// ──────────────────────────────────────────────────────
// ToolNest — Single Calculation API
// GET /api/calculations/[id] — Get a calculation
// PUT /api/calculations/[id] — Update a calculation
// DELETE /api/calculations/[id] — Delete a calculation
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getCalculation,
  updateCalculation,
  deleteCalculation,
} from "@/lib/db/calculations";

/**
 * GET /api/calculations/[id]
 * Get a single saved calculation.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const calculation = await getCalculation(id, session.user.id);

    if (!calculation) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ calculation });
  } catch (error) {
    console.error("Error fetching calculation:", error);
    return NextResponse.json(
      { error: "Failed to fetch calculation" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calculations/[id]
 * Update a saved calculation.
 * Body: { title?, input?, result? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, input, result } = body;

    // Verify ownership first
    const existing = await getCalculation(id, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      );
    }

    // Validate title length
    if (title && title.length > 200) {
      return NextResponse.json(
        { error: "Title must be 200 characters or less" },
        { status: 400 }
      );
    }

    await updateCalculation(id, session.user.id, {
      title,
      input,
      result,
    });

    return NextResponse.json({ updated: true });
  } catch (error) {
    console.error("Error updating calculation:", error);
    return NextResponse.json(
      { error: "Failed to update calculation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/calculations/[id]
 * Delete a saved calculation.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Verify ownership first
    const existing = await getCalculation(id, session.user.id);
    if (!existing) {
      return NextResponse.json(
        { error: "Calculation not found" },
        { status: 404 }
      );
    }

    await deleteCalculation(id, session.user.id);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Error deleting calculation:", error);
    return NextResponse.json(
      { error: "Failed to delete calculation" },
      { status: 500 }
    );
  }
}
