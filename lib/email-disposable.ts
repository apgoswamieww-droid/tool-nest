// ──────────────────────────────────────────────────────
// ToolNest — Disposable email detection (SERVER ONLY)
//
// Blocks throwaway inbox services (mailinator, yopmail, guerrilla mail,
// 121k+ more) at registration. The domain list is ~2.4 MB, so this module
// must never be imported from client code — the check runs exclusively in
// API routes. Subdomains of listed domains are blocked too.
// ──────────────────────────────────────────────────────

import DOMAINS from "disposable-email-domains";

/** Set for O(1) lookups; all entries lowercased defensively. */
const BLOCKED = new Set(
  (DOMAINS as readonly string[]).map((d) => d.toLowerCase().trim())
);

/** Longest listed domain length — caps the suffix-walk below. */
let maxLen = 0;
for (const d of BLOCKED) {
  if (d.length > maxLen) maxLen = d.length;
}

/**
 * True when the domain (or any of its parent domains) is a known
 * disposable-email provider. Example: `x@mail.10minutemail.com` is caught
 * via its parent `10minutemail.com`.
 */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).toLowerCase().trim();
  if (!domain || domain.length > 253) return false;

  // Walk parent domains: a.b.c → a.b.c, b.c, c.
  const labels = domain.split(".");
  for (let i = 0; i < labels.length; i++) {
    const candidate = labels.slice(i).join(".");
    if (candidate.length > maxLen) continue;
    if (BLOCKED.has(candidate)) return true;
  }
  return false;
}
