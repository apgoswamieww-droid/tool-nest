// ──────────────────────────────────────────────────────
// ToolNest — Password hashing
//
// bcrypt (bcryptjs, pure JS — no native build) with a cost factor of
// 10. Used by the Credentials provider (lib/auth.ts) and the
// registration API (app/api/auth/register/route.ts). Hashing never
// happens in client code.
// ──────────────────────────────────────────────────────

import { hash, compare } from "bcryptjs";

const BCRYPT_ROUNDS = 10;

/** Hash a plaintext password for storage. */
export function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Constant-time-ish comparison of a candidate password against a stored
 * bcrypt hash. Returns false (never throws) for malformed hashes.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  if (!password || !passwordHash) return false;
  try {
    return await compare(password, passwordHash);
  } catch {
    // Malformed/foreign hash format — treat as a mismatch.
    return false;
  }
}
