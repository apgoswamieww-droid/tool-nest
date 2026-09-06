// ──────────────────────────────────────────────────────
// ToolNest — API key authentication (docs/api-platform.md §6)
//
// `Authorization: Bearer tn_…` → sha256(presented) → lookup by digest.
// The raw key is never compared or stored, and never appears in logs,
// usage rows, or responses. Revoked keys answer 403; unknown or
// malformed keys answer 401 with `WWW-Authenticate: Bearer`.
// ──────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { ApiError } from "./errors";
import { hashApiKey, KEY_PREFIX } from "./keys";

export interface ApiKeyIdentity {
  id: string;
  userId: string;
  name: string;
  quotaPerDay: number;
}

/**
 * Authenticate a bearer key. Throws ApiError(401) when the header is
 * missing/malformed/unknown, ApiError(403) when the key is revoked,
 * ApiError(500) when the key store is unreachable. Returns the stored
 * key record's identity on success — never the raw key or its hash.
 */
export async function authenticateApiKey(
  request: NextRequest
): Promise<ApiKeyIdentity> {
  const header = request.headers.get("authorization");
  const presented = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : "";
  if (!presented) {
    throw new ApiError("UNAUTHORIZED", undefined, undefined, {
      "WWW-Authenticate": "Bearer",
    });
  }
  if (!presented.startsWith(KEY_PREFIX)) {
    throw new ApiError("UNAUTHORIZED", undefined, undefined, {
      "WWW-Authenticate": "Bearer",
    });
  }

  let record: { id: string; userId: string; name: string; quotaPerDay: number; revokedAt: Date | null } | null;
  try {
    record = await prisma.apiKey.findUnique({
      where: { keyHash: hashApiKey(presented) },
      select: {
        id: true,
        userId: true,
        name: true,
        quotaPerDay: true,
        revokedAt: true,
      },
    });
  } catch (error) {
    console.error("[API] Key lookup failed:", error);
    throw new ApiError("INTERNAL");
  }

  if (!record) {
    throw new ApiError("UNAUTHORIZED", undefined, undefined, {
      "WWW-Authenticate": "Bearer",
    });
  }
  if (record.revokedAt) {
    throw new ApiError("FORBIDDEN");
  }

  return {
    id: record.id,
    userId: record.userId,
    name: record.name,
    quotaPerDay: record.quotaPerDay,
  };
}
