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
    <aside className="hidden w-56 flex-shrink-0 border-r border-stone-200 bg-white md:block">
      <div className="border-b border-stone-200 px-4 py-4">
        <Link href="/admin" className="text-sm font-semibold">
          {businessConfig.name}
        </Link>
        <p className="text-xs text-stone-500">Admin</p>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100">
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
