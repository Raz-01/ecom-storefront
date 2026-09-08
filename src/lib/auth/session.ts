import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { hasPermission, type Permission } from "@/lib/auth/permissions";

/** Server-side guard for admin pages/server actions. Middleware already redirects signed-out requests away from `/admin/*`, but every server action needs its own check too — a server action can be invoked directly, not just via a page render. */
export async function requireAdminSession() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  return session;
}

/** Guards a specific capability, not just "is signed in" — e.g. a warehouse-staff session hitting a products:manage action. */
export async function requirePermission(permission: Permission) {
  const session = await requireAdminSession();
  if (!hasPermission(session.user.role, permission)) {
    redirect("/admin?error=forbidden");
  }
  return session;
}
