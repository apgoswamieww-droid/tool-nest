// ──────────────────────────────────────────────────────
// ToolNest — API route factory (docs/api-platform.md §3.1)
//
// The ONLY place that turns a capability into an App Router handler.
// Every endpoint file is three lines:
//
//   export const POST = createApiRoute(capabilities["text.repeat"]);
//
// Chain (order per docs §3.1 + §10 checklist #8 — bodies are read only
// after auth + content-type + size checks):
//   1. request id (echo x-request-id or generate)
//   2. authenticate bearer key
//   3. rate limit (burst + daily quota)
//   4. content-type check            → 400 INVALID_CONTENT_TYPE
//   5. body-size cap                 → 413 PAYLOAD_TOO_LARGE
//   6. parse JSON                    → 400 INVALID_JSON
//   7. zod-validate input            → 422 VALIDATION_FAILED (details)
//   8. run the shared tool function  → 500 INTERNAL on unexpected error
//   9. success envelope + rate-limit headers + usage row (best-effort)
//
// Error envelopes and rate headers come from lib/api/respond.ts, shared
// with the non-capability v1 routes, so consistency is structural.
// ──────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import type { ApiCapability } from "./registry";
import { ApiError, errorStatus } from "./errors";
import { makeRequestId, readRequestId } from "./request-id";
import { authenticateApiKey, type ApiKeyIdentity } from "./auth";
import { logApiUsage } from "./usage";
import {
  checkKeyRateLimits,
  errorBody,
  rateHeaders,
} from "./respond";

function zodIssuesToDetails(
  issues: readonly {
    path: readonly (string | number)[];
    code: string;
    message: string;
  }[]
): { field: string; code: string; message: string }[] {
  return issues.map((issue) => ({
    field: issue.path.length > 0 ? issue.path.join(".") : "(root)",
    code: issue.code,
    message: issue.message,
  }));
}

/**
 * Build the handler for one capability. Returns a Next.js route handler
 * (export as `export const POST = createApiRoute(capability)`).
 */
export function createApiRoute(capability: ApiCapability<any, any>) {
  return async function apiRouteHandler(
    request: NextRequest
  ): Promise<NextResponse> {
    const requestId = readRequestId(request.headers) ?? makeRequestId();
    const startedAt = Date.now();

    // 1. Authenticate. 401/403 responses cannot carry rate headers (no
    // key was identified) but still carry the request id in the body.
    let key: ApiKeyIdentity;
    try {
      key = await authenticateApiKey(request);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(errorBody(error.code, requestId), {
          status: errorStatus(error.code),
          headers: { "WWW-Authenticate": "Bearer" },
        });
      }
      throw error;
    }

    // From here on every response is logged and carries rate headers, so
    // one responder keeps the shapes identical.
    const respond = (
      status: number,
      body: unknown,
      headers: Record<string, string> = {}
    ): NextResponse => {
      void logApiUsage({
        apiKeyId: key.id,
        requestId,
        route: capability.path,
        method: capability.method,
        status,
        latencyMs: Date.now() - startedAt,
      });
      return NextResponse.json(body, { status, headers });
    };

    // 2. Rate limit (burst + daily quota) — counted once per request.
    const rate = checkKeyRateLimits(key);
    const rateLimitHeaderValues = rateHeaders(rate);
    if (!rate.allowed) {
      return respond(
        429,
        errorBody("RATE_LIMITED", requestId),
        {
          ...rateLimitHeaderValues,
          "Retry-After": String(Math.ceil(rate.retryAfterMs / 1000)),
        }
      );
    }

    // 3. Content type before any body read (checklist #8).
    const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
    if (!contentType.startsWith("application/json")) {
      return respond(
        400,
        errorBody("INVALID_CONTENT_TYPE", requestId),
        rateLimitHeaderValues
      );
    }

    // 4. Body-size cap (never clamp).
    let rawBody: string;
    try {
      rawBody = await request.text();
    } catch {
      return respond(400, errorBody("INVALID_JSON", requestId), rateLimitHeaderValues);
    }
    if (Buffer.byteLength(rawBody, "utf8") > capability.maxBodyBytes) {
      return respond(413, errorBody("PAYLOAD_TOO_LARGE", requestId), rateLimitHeaderValues);
    }
    if (rawBody.trim().length === 0) {
      return respond(400, errorBody("INVALID_JSON", requestId), rateLimitHeaderValues);
    }

    // 5. Parse JSON.
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return respond(400, errorBody("INVALID_JSON", requestId), rateLimitHeaderValues);
    }

    // 6. Validate input against the capability schema (strict edge).
    const parsed = capability.input.safeParse(body);
    if (!parsed.success) {
      return respond(
        422,
        errorBody(
          "VALIDATION_FAILED",
          requestId,
          zodIssuesToDetails(
            parsed.error.issues as unknown as {
              path: readonly (string | number)[];
              code: string;
              message: string;
            }[]
          )
        ),
        rateLimitHeaderValues
      );
    }

    // 7. Run the shared tool function. Inputs are already validated and
    // bounded, so a failure here is an internal bug, not a client issue.
    let data: unknown;
    try {
      data = await capability.run(parsed.data);
    } catch (error) {
      console.error(
        `[API] ${capability.operationId} failed (requestId ${requestId}):`,
        error
      );
      return respond(500, errorBody("INTERNAL", requestId), rateLimitHeaderValues);
    }

    // 8. Success envelope — `data` is the unmodified tool result.
    return respond(
      200,
      {
        data,
        meta: {
          toolSlug: capability.toolSlug,
          operationId: capability.operationId,
        },
        requestId,
      },
      rateLimitHeaderValues
    );
  };
}
