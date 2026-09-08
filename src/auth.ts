import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { serverEnv } from "@/lib/env.server";
import { authConfig } from "@/auth.config";

/**
 * Full admin authentication config (Auth.js / NextAuth v5) — Node.js
 * runtime only. Credentials-only: staff log in with an email + password
 * stored in `AdminUser`, hashed with bcrypt. JWT session strategy: no
 * Session/Account tables needed, since those exist in Auth.js's schema for
 * OAuth account-linking, which this app has no use for. Customers never
 * authenticate at all (guest checkout only) — this is exclusively for
 * `/admin`.
 *
 * Deliberately separate from `auth.config.ts`: this file's Credentials
 * provider pulls in bcryptjs + Prisma, which must never end up in the Edge
 * Middleware bundle (see that file's comment) — so `middleware.ts` imports
 * `authConfig` directly, not this module.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: serverEnv.authSecret,
  session: { strategy: "jwt" },
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
});
