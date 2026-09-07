import type { AdminRole } from "@prisma/client";

/**
 * Capability-based permissions, mapped from the three roles in the project
 * brief. A plain enum + map rather than a Role/Permission DB table — with
 * only three known roles, adding a fourth later is one enum value plus one
 * entry here, not a migration. If role/permission combinations ever need
 * to be admin-editable at runtime, that's the point to introduce a real
 * Role table; not before.
 *
 * Reading of the brief's per-role lists into permissions:
 * - OWNER: everything.
 * - ADMIN (sales staff): orders + quotes, no product/inventory/staff/
 *   settings changes, and — per "Cannot change sensitive business
 *   settings" — no financial analytics (revenue etc.), only operational
 *   figures (order counts, statuses).
 * - WAREHOUSE_STAFF: inventory + fulfilling orders, explicitly no
 *   financial analytics, no staff/settings.
 */
export type Permission =
  | "dashboard:view_operational" // order counts, inventory status, non-money charts
  | "dashboard:view_financial" // revenue, AOV, money-denominated analytics
  | "products:manage"
  | "inventory:manage"
  | "orders:view"
  | "orders:manage" // change order status
  | "quotes:manage"
  | "staff:manage"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  OWNER: [
    "dashboard:view_operational",
    "dashboard:view_financial",
    "products:manage",
    "inventory:manage",
    "orders:view",
    "orders:manage",
    "quotes:manage",
    "staff:manage",
    "settings:manage",
  ],
  ADMIN: ["dashboard:view_operational", "orders:view", "orders:manage", "quotes:manage"],
  WAREHOUSE_STAFF: ["dashboard:view_operational", "inventory:manage", "orders:view", "orders:manage"],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  WAREHOUSE_STAFF: "Warehouse Staff",
};
