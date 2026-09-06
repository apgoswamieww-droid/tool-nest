import type { Metadata } from "next";
import { AccountClient } from "./AccountClient";

export const metadata: Metadata = {
  title: "My account — ToolNest",
  robots: { index: false, follow: false },
};

/**
 * Signed-in account hub: profile, favorite tools, saved calculations,
 * and preferences. Content is gated client-side (next-auth session) —
 * signed-out visitors see a sign-in prompt, never a forced redirect.
 */
export default function AccountPage() {
  return <AccountClient />;
}
