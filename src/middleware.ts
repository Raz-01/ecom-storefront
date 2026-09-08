import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

/**
 * Protects every `/admin/*` route except the login page itself.
 * Server-side, not the frontend route-guard-only approach the project
 * brief explicitly warns against — a signed-out request never even
 * reaches an admin page/server action to begin with.
 *
 * Uses the edge-safe `authConfig` (no Credentials provider) directly,
 * rather than importing `auth` from `src/auth.ts` — that full config pulls
 * in bcryptjs + Prisma, which pushed this Edge Middleware bundle past
 * Vercel's 1MB limit. This only ever needs to read an existing JWT, not
 * authenticate one, so the lightweight config is all it needs.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isProtectedAdminRoute = pathname.startsWith("/admin") && !isLoginPage;

  if (isProtectedAdminRoute && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
