"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Boxes, ClipboardList, MessageSquareText, Users } from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { businessConfig } from "@/lib/business.config";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";
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
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-stone-200 bg-surface md:block">
      <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-4">
        <LogoMark className="h-7 w-7" />
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">{businessConfig.name}</p>
          <p className="text-xs text-stone-500">Admin</p>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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
    </aside>
  );
}
