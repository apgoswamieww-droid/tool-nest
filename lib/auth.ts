// ──────────────────────────────────────────────────────
// ToolNest — NextAuth Configuration
// Optional authentication for user features
// ──────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

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
        // For MVP: simple email lookup
        // In production, add proper password hashing
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        return user;
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
