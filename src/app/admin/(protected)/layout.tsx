import type { ReactNode } from "react";
import { requireAdminSession } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

/**
 * Wraps every authenticated admin page (dashboard, products, inventory,
 * orders, quotes, staff) — deliberately NOT `/admin/login`, which lives as
 * a sibling outside this `(protected)` route group so it isn't itself
 * gated behind a session check. Middleware already redirects signed-out
 * requests away from `/admin/*`; this is the second, page-level check
 * (also gives us the session to pass down to the sidebar/top bar).
 */
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="flex min-h-screen bg-stone-50">
      <AdminSidebar role={session.user.role} />
      <div className="flex flex-1 flex-col">
        <AdminTopBar user={session.user} />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
