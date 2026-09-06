import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — ToolNest",
  robots: { index: false, follow: false },
};

/**
 * Sign in / create account. NextAuth points its `pages.signIn` at this
 * route (lib/auth.ts). Free tools never require an account — this page
 * backs the account layer (saved results, favorites, preferences).
 */
export default function LoginPage() {
  return <LoginForm />;
}
