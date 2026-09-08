import Link from "next/link";
import { LayoutDashboard, Package, Boxes, ClipboardList, MessageSquareText, Users } from "lucide-react";
import { businessConfig } from "@/lib/business.config";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import type { AdminRole } from "@prisma/client";

const NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view_operational" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products:manage" },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, permission: "inventory:manage" },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, permission: "orders:view" },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquareText, permission: "quotes:manage" },
  { href: "/admin/staff", label: "Staff", icon: Users, permission: "staff:manage" },
];

export function AdminSidebar({ role }: { role: AdminRole }) {
  const items = NAV_ITEMS.filter((item) => hasPermission(role, item.permission));

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:block">
      <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <Link href="/admin" className="text-sm font-semibold">
          {businessConfig.name}
        </Link>
        <p className="text-xs text-zinc-500">Admin</p>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900">
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
