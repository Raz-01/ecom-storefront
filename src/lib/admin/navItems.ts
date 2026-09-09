import { LayoutDashboard, Package, Boxes, ClipboardList, MessageSquareText, Users } from "lucide-react";
import type { Permission } from "@/lib/auth/permissions";

/** Shared between the desktop sidebar and the mobile drawer nav so the two never drift apart. */
export const ADMIN_NAV_ITEMS: { href: string; label: string; icon: typeof LayoutDashboard; permission: Permission }[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view_operational" },
  { href: "/admin/products", label: "Products", icon: Package, permission: "products:manage" },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes, permission: "inventory:manage" },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList, permission: "orders:view" },
  { href: "/admin/quotes", label: "Quotes", icon: MessageSquareText, permission: "quotes:manage" },
  { href: "/admin/staff", label: "Staff", icon: Users, permission: "staff:manage" },
];
