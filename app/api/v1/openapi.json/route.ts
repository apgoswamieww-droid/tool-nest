// ──────────────────────────────────────────────────────
// ToolNest — Generated OpenAPI 3.1 (docs/api-platform.md §11.2)
//
// GET /api/v1/openapi.json — derives each path's request schema from
// the capability registry's zod input via zod v4's `toJSONSchema`, so
// the docs cannot drift from the enforced contract. `data` response
// shapes are the shared lib/tools interfaces (documented in
// docs/api-platform.md §8); they are plain TS, not zod, so they are
// described rather than derived.
// ──────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import { CAPABILITY_LIST } from "@/lib/api/registry";

function inputJsonSchema(capability: { input: unknown }): unknown {
  try {
    const schema = capability.input as {
      toJSONSchema?: () => unknown;
    };
    if (typeof schema.toJSONSchema === "function") {
      return schema.toJSONSchema();
    }
  } catch {
    // fall through to a permissive placeholder — never break the doc
  }
  return { type: "object" };
}

export function GET() {
  const paths: Record<string, unknown> = {};
  for (const cap of CAPABILITY_LIST) {
    const relPath = cap.path.replace(/^\/api\/v1/, "");
    paths[relPath] = {
      post: {
        operationId: cap.operationId,
        summary: cap.summary,
        tags: [cap.toolSlug],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: inputJsonSchema(cap) },
          },
        },
        responses: {
          200: {
            description:
              "Success — `data` is the shared tool function's unmodified result " +
              "(see docs/api-platform.md §8); `meta` carries toolSlug/operationId.",
          },
          400: { description: "INVALID_JSON / INVALID_CONTENT_TYPE" },
          401: { description: "UNAUTHORIZED — missing or unknown bearer key" },
          403: { description: "FORBIDDEN — key revoked" },
          413: { description: "PAYLOAD_TOO_LARGE" },
          422: {
            description:
              "VALIDATION_FAILED — field-level `details`; the edge never clamps",
          },
          429: { description: "RATE_LIMITED — includes Retry-After" },
        },
      },
    };
  }

  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "ToolNest API",
      version: "v1",
      description:
        "Public API for a curated set of ToolNest tools. Reuses the same " +
        "pure functions as the website — one implementation, two surfaces. " +
        "See docs/api-platform.md for the full contract.",
    },
    servers: [{ url: "/api/v1" }],
    paths,
  });
}
