import { LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { AdminRole } from "@prisma/client";
import { logout } from "@/app/admin/actions";
import { MobileAdminNav } from "@/components/admin/MobileAdminNav";

export function AdminTopBar({ user }: { user: { name?: string | null; email?: string | null; role: AdminRole } }) {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-surface px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <MobileAdminNav role={user.role} />
        <div className="text-sm">
          <span className="font-medium text-foreground">{user.name}</span>
          <span className="ml-2 hidden text-stone-500 sm:inline">{ROLE_LABELS[user.role]}</span>
        </div>
      </div>
      <form action={logout}>
        <button type="submit" className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-brand-primary-dark">
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </form>
    </header>
  );
}
