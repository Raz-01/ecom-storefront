import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";

/**
 * Admin authentication (Auth.js / NextAuth v5). Credentials-only — staff
 * log in with an email + password stored in `AdminUser`, hashed with
 * bcrypt. JWT session strategy: no Session/Account tables needed, since
 * those exist in Auth.js's schema for OAuth account-linking, which this
 * app has no use for. Customers never authenticate at all (guest
 * checkout only) — this is exclusively for `/admin`.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: serverEnv.authSecret,
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : undefined;
        const password = typeof credentials?.password === "string" ? credentials.password : undefined;
        if (!email || !password) return null;

        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin || !admin.isActive) return null;

        const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordMatches) return null;

        await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

        return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
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
});
