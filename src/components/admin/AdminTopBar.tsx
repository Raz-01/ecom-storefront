import { LogOut } from "lucide-react";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { AdminRole } from "@prisma/client";
import { logout } from "@/app/admin/actions";

export function AdminTopBar({ user }: { user: { name?: string | null; email?: string | null; role: AdminRole } }) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 sm:px-6">
      <div className="text-sm">
        <span className="font-medium">{user.name}</span>
        <span className="ml-2 text-zinc-500">{ROLE_LABELS[user.role]}</span>
      </div>
      <form action={logout}>
        <button type="submit" className="flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
          <LogOut size={14} />
          Sign out
        </button>
      </form>
    </header>
  );
}
