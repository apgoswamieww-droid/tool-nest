// ──────────────────────────────────────────────────────
// ToolNest — Password hashing & policy
//
// bcryptjs with cost 12 (~250ms/hash on typical hardware): a good
// online-attack trade-off given the per-email and per-IP throttles on
// the login route. Input is pre-hashed with SHA-256 so passwords longer
// than bcrypt's 72-byte limit can't be silently truncated.
// Hashing never happens in client code.
// ──────────────────────────────────────────────────────

import { createHash } from "crypto";
import { hash, compare } from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/**
 * bcrypt only uses the first 72 bytes of its input. Pre-hash with SHA-256
 * (base64, 44 chars) so long passphrases keep their entropy instead of
 * being silently truncated. Deterministic and fast; bcrypt remains the
 * slow, salted KDF.
 */
function prehash(password: string): string {
  return createHash("sha256").update(password, "utf8").digest("base64");
}

/** Hash a plaintext password for storage. */
export function hashPassword(password: string): Promise<string> {
  return hash(prehash(password), BCRYPT_ROUNDS);
}

/**
 * Compare a candidate password against a stored bcrypt hash.
 * Returns false (never throws) for malformed hashes.
 */
export async function verifyPassword(
  password: string,
  passwordHash: string
): Promise<boolean> {
  if (!password || !passwordHash) return false;
  try {
    return await compare(prehash(password), passwordHash);
  } catch {
    // Malformed/foreign hash format — treat as a mismatch.
    return false;
  }
}

// ── Policy (NIST SP 800-63B aligned: length over composition rules) ──

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

/** Common/weak passwords that fail even though they meet length rules. */
const BLOCKED_PASSWORDS = new Set([
  "password",
  "password1",
  "password12",
  "password123",
  "password1234",
  "12345678",
  "123456789",
  "1234567890",
  "qwerty123",
  "qwertyuiop",
  "iloveyou1",
  "letmein12",
  "admin1234",
  "welcome1",
  "monkey123",
  "dragon123",
  "master123",
  "sunshine1",
  "princess1",
  "football1",
  "baseball1",
  "trustno12",
]);

/**
 * Policy check for registration/password change. Returns an error message
 * or null when the password is acceptable.
 */
export function validatePasswordStrength(password: string): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;
  }
  // Top-of-mind common passwords are rejected even though they satisfy
  // the length rule. (Auth.js's built-in zxcvbn-style check also runs at
  // the signIn layer on registration through the Credentials provider.)
  const lower = password.toLowerCase();
  if (BLOCKED_PASSWORDS.has(lower)) {
    return "This password is too common. Choose something less predictable.";
  }
  return null;
}
