// ──────────────────────────────────────────────────────
// ToolNest — NextAuth Configuration
// Optional authentication for user features
// ──────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createMemoryLimiter } from "@/lib/rate-limit-memory";

// ── Login throttling (coarse, in-memory) ─────────────
// Two per-IP limits: per-email (targeted brute force) and per-IP total
// (password spraying across many addresses). IP comes from proxy
// headers, so a spoofable x-forwarded-for only hurts the attacker.
// Suitable as a single-instance guard; move to a shared store before
// multi-instance deploys. Keys are the normalized email / IP — never
// the raw password — and nothing is persisted.

const LOGIN_MAX_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 60_000;
const loginEmailLimiter = createMemoryLimiter({
  max: LOGIN_MAX_ATTEMPTS,
  windowMs: LOGIN_WINDOW_MS,
});
const loginIpLimiter = createMemoryLimiter({
  max: 30,
  windowMs: LOGIN_WINDOW_MS,
});

/** Trim + lowercase an email, or null when it can't be a valid address. */
function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length > 0 && email.length <= 254 ? email : null;
}

/**
 * Pre-computed bcrypt digest of a random string. Comparing against it
 * on the unknown-email path burns the same CPU as a real compare, so
 * attackers can't time-distinguish "no such user" from "wrong password".
 */
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEeO7ZbWyyFCDLKUkAeJ1q1S9Z8P9FvHBju";

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
      async authorize(credentials, request) {
        const email = normalizeEmail(credentials?.email);
        const password = credentials?.password;
        if (!email || typeof password !== "string" || password.length === 0) {
          return null;
        }

        // Throttle per email (targeted brute force) and per IP
        // (spraying many accounts from one host).
        const ip =
          request?.headers?.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          request?.headers?.get("x-real-ip") ??
          "unknown";
        if (loginEmailLimiter.check(email) || loginIpLimiter.check(ip)) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Unknown email and wrong password return the SAME failure so
        // the endpoint doesn't reveal which accounts exist. A dummy
        // bcrypt compare equalizes response timing between the paths.
        if (!user?.passwordHash) {
          await verifyPassword(password, DUMMY_HASH);
          return null;
        }

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
