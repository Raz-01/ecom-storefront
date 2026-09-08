import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Protects every `/admin/*` route except the login page itself.
 * Server-side, not the frontend route-guard-only approach the project
 * brief explicitly warns against — a signed-out request never even
 * reaches an admin page/server action to begin with.
 */
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
