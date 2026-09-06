// ──────────────────────────────────────────────────────
// ToolNest — API platform error contract (docs/api-platform.md §5.2)
//
// Stable machine codes + HTTP statuses for every v1 error. Codes are
// contract-frozen once v1 ships: changing one is a breaking change.
// Body shape: { error: { code, message, details? }, requestId }.
// ──────────────────────────────────────────────────────

export type ApiErrorCode =
  | "INVALID_JSON"
  | "INVALID_CONTENT_TYPE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "PAYLOAD_TOO_LARGE"
  | "VALIDATION_FAILED"
  | "RATE_LIMITED"
  | "INTERNAL";

export interface ApiErrorDetail {
  field: string;
  code: string;
  message: string;
}

const ERROR_META: Record<ApiErrorCode, { status: number; message: string }> = {
  INVALID_JSON: { status: 400, message: "Request body is not valid JSON" },
  INVALID_CONTENT_TYPE: {
    status: 400,
    message: "Content-Type must be application/json",
  },
  UNAUTHORIZED: {
    status: 401,
    message: "A valid API key is required (Authorization: Bearer tn_…)",
  },
  FORBIDDEN: { status: 403, message: "This API key has been revoked" },
  NOT_FOUND: { status: 404, message: "Not found" },
  METHOD_NOT_ALLOWED: { status: 405, message: "Method not allowed" },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    message: "Request body exceeds the allowed size",
  },
  VALIDATION_FAILED: {
    status: 422,
    message: "Request did not validate",
  },
  RATE_LIMITED: {
    status: 429,
    message: "Rate limit exceeded — slow down and retry after the reset",
  },
  INTERNAL: { status: 500, message: "Internal server error" },
};

export function errorStatus(code: ApiErrorCode): number {
  return ERROR_META[code].status;
}

export function errorMessage(code: ApiErrorCode): string {
  return ERROR_META[code].message;
}

/**
 * A platform error thrown by lib/api middleware. The route factory
 * (and only the route factory) converts it into a response, so error
 * shape is produced in exactly one place.
 */
export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message?: string,
    public readonly details?: ApiErrorDetail[],
    public readonly headers?: Record<string, string>
  ) {
    super(message ?? ERROR_META[code].message);
    this.name = "ApiError";
  }
}

/** All error codes with their status — used by the catalog endpoint. */
export const API_ERROR_TABLE: Record<ApiErrorCode, number> = Object.fromEntries(
  (Object.keys(ERROR_META) as ApiErrorCode[]).map((code) => [
    code,
    ERROR_META[code].status,
  ])
) as Record<ApiErrorCode, number>;
