import { LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { AdminRole } from "@prisma/client";
import { logout } from "@/app/admin/actions";

export function AdminTopBar({ user }: { user: { name?: string | null; email?: string | null; role: AdminRole } }) {
  return (
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
      <div className="text-sm">
        <span className="font-medium">{user.name}</span>
        <span className="ml-2 text-stone-500">{ROLE_LABELS[user.role]}</span>
      </div>
      <form action={logout}>
        <button type="submit" className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900">
          <LogOut size={14} />
          Sign out
        </button>
      </form>
    </header>
  );
}
