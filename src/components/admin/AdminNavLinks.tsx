"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/navItems";
import { hasPermission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
import type { AdminRole } from "@prisma/client";

/** The nav link list itself — shared by the desktop sidebar and the mobile drawer so permission filtering and active-route styling can't drift between the two. */
export function AdminNavLinks({ role, onNavigate }: { role: AdminRole; onNavigate?: () => void }) {
  const items = ADMIN_NAV_ITEMS.filter((item) => hasPermission(role, item.permission));
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium",
              isActive ? "bg-brand-primary/10 text-brand-primary-dark" : "text-stone-700 hover:bg-stone-100",
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
