import type { NextAuthConfig } from "next-auth";
import type { AdminRole } from "@prisma/client";

/**
 * Edge-safe half of the Auth.js config — no providers (Credentials pulls
 * in bcryptjs + Prisma, which together push the Edge Middleware bundle
 * past Vercel's 1MB limit), just the JWT/session shaping needed to check
 * "is this request authenticated" in `middleware.ts`. The actual
 * Credentials provider (bcrypt + Prisma) lives in `auth.ts`, which only
 * ever runs in a Node.js runtime (route handlers, server actions, server
 * components) — never bundled for the edge.
 */
export const authConfig = {
  pages: { signIn: "/admin/login" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: AdminRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      // `token` here types looser than in the `jwt` callback above (its
      // fields read as `unknown` despite the same JWT augmentation) — cast
      // rather than fight the mismatch, since we control exactly what
      // `jwt()` put on it.
      session.user.id = token.id as string;
      session.user.role = token.role as AdminRole;
      return session;
    },
  },
} satisfies NextAuthConfig;
