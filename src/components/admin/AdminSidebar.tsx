import { LogoMark } from "@/components/site/Logo";
import { businessConfig } from "@/lib/business.config";
import { AdminNavLinks } from "@/components/admin/AdminNavLinks";
import type { AdminRole } from "@prisma/client";

/** Desktop-only (md+) nav column — the mobile equivalent is `MobileAdminNav`, opened from `AdminTopBar`. Both render `AdminNavLinks` so the link list itself never drifts between the two. */
export function AdminSidebar({ role }: { role: AdminRole }) {
  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-stone-200 bg-surface md:block">
      <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-4">
        <LogoMark className="h-7 w-7" />
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">{businessConfig.name}</p>
          <p className="text-xs text-stone-500">Admin</p>
        </div>
      </div>
      <AdminNavLinks role={role} />
    </aside>
  );
}
