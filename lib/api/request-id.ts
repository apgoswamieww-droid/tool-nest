// ──────────────────────────────────────────────────────
// ToolNest — API platform request correlation
//
// Every /api/v1 response carries a requestId (echoed from the
// `x-request-id` request header when the client supplies one,
// otherwise generated). Usage rows store the same id so support can
// correlate a response with its log line.
// ──────────────────────────────────────────────────────

import { randomUUID } from "node:crypto";

export const REQUEST_ID_HEADER = "x-request-id";
const MAX_ECHO_LENGTH = 64;

export function makeRequestId(): string {
  return randomUUID();
}

/** Accept a client-supplied id (bounded, safe to echo) or return null. */
export function readRequestId(headers: Headers): string | null {
  const value = headers.get(REQUEST_ID_HEADER);
  if (!value) return null;
  const trimmed = value.trim().slice(0, MAX_ECHO_LENGTH);
  // Only echo plain, log-friendly ids (no whitespace/control chars).
  return /^[A-Za-z0-9._:-]+$/.test(trimmed) ? trimmed : null;
}
