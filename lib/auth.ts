// ──────────────────────────────────────────────────────
// ToolNest — NextAuth Configuration
// Optional authentication for user features
// ──────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

// ── Login throttling (coarse, in-memory) ─────────────
// Per-email attempt limiter so brute force is impractical. Suitable as
// a single-instance guard; move to a shared store (DB/Redis) before
// multi-instance deploys. Keyed by the normalized email only — never
// the raw password — and never persisted.

const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 60_000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isLoginThrottled(key: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(key);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LOGIN_MAX_ATTEMPTS;
}

/** Trim + lowercase an email, or null when it can't be a valid address. */
function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= 254 ? email : null;
}

/**
 * NextAuth handler with Prisma adapter.
 * Authentication is optional — public tools work without login.
 */
export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    // Credentials provider — simple email-based auth for MVP
    // Can be extended with OAuth providers later
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password;
        if (!email || typeof password !== "string" || password.length === 0) {
          return null;
        }

        // Throttle per email (counts unknown addresses too, so
        // enumeration attempts are slowed as well).
        if (isLoginThrottled(email)) return null;

        const user = await prisma.user.findUnique({ where: { email } });

        // Unknown email and wrong password return the SAME failure so
        // the endpoint doesn't reveal which accounts exist.
        if (!user?.passwordHash) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        // Never include the hash in the session user.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
