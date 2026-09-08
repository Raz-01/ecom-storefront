import Link from "next/link";
import { requireAdminSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getRevenueSummary,
  getOrderCounts,
  getAverageOrderValue,
  getCustomerStats,
  getInventoryStats,
  getLowStockProducts,
  getBestSellingProducts,
  getSalesByCategory,
  getDailyTrend,
  startOfMonth,
  daysAgo,
} from "@/lib/analytics/dashboard";
import { formatMoney } from "@/lib/currency";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardTrendChart } from "@/components/admin/DashboardTrendChart";

const RANGE_OPTIONS: { value: string; label: string; days: number }[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "3 months", days: 90 },
  { value: "365d", label: "1 year", days: 365 },
];

export default async function AdminDashboardPage({ searchParams }: PageProps<"/admin">) {
  const session = await requireAdminSession();
  const canViewFinancial = hasPermission(session.user.role, "dashboard:view_financial");

  const sp = await searchParams;
  const rangeValue = typeof sp.range === "string" ? sp.range : "30d";
  const range = RANGE_OPTIONS.find((r) => r.value === rangeValue) ?? RANGE_OPTIONS[1];
  const periodStart = daysAgo(range.days);

  const [orderCounts, inventoryStats, lowStockProducts, bestSellers, salesByCategory, trend] = await Promise.all([
    getOrderCounts(),
    getInventoryStats(),
    getLowStockProducts(),
    getBestSellingProducts(periodStart),
    getSalesByCategory(periodStart),
    getDailyTrend(range.days),
  ]);

  const [revenue, avgOrderValue, customerStats] = canViewFinancial
    ? await Promise.all([getRevenueSummary(), getAverageOrderValue(), getCustomerStats(startOfMonth(new Date()))])
    : [null, null, null];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex gap-1 rounded-full border border-zinc-200 p-1 dark:border-zinc-800">
          {RANGE_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/admin?range=${opt.value}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                opt.value === range.value ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {canViewFinancial && revenue && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Revenue today" value={formatMoney(revenue.today)} />
          <StatCard label="Revenue this week" value={formatMoney(revenue.week)} />
          <StatCard label="Revenue this month" value={formatMoney(revenue.month)} />
          <StatCard label="Revenue this year" value={formatMoney(revenue.year)} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total orders" value={String(orderCounts.total)} />
        <StatCard label="Pending payment" value={String(orderCounts.pendingPayment)} tone={orderCounts.pendingPayment > 0 ? "warning" : "neutral"} />
        <StatCard label="Completed" value={String(orderCounts.completed)} tone="success" />
        <StatCard label="Cancelled" value={String(orderCounts.cancelled)} tone={orderCounts.cancelled > 0 ? "danger" : "neutral"} />
        {canViewFinancial && avgOrderValue !== null && <StatCard label="Average order value" value={formatMoney(avgOrderValue)} />}
        {canViewFinancial && customerStats && <StatCard label="Unique customers" value={String(customerStats.uniqueCustomers)} hint={`${customerStats.newCustomers} new this month`} />}
        <StatCard label="Low stock products" value={String(inventoryStats.lowStockCount)} tone={inventoryStats.lowStockCount > 0 ? "warning" : "neutral"} />
        <StatCard label="Out of stock" value={String(inventoryStats.outOfStockCount)} tone={inventoryStats.outOfStockCount > 0 ? "danger" : "neutral"} />
      </div>

      {canViewFinancial && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardTrendChart data={trend} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Best-selling products ({range.label})</CardTitle>
          </CardHeader>
          <CardContent>
            {bestSellers.length === 0 ? (
              <p className="text-sm text-zinc-500">No sales in this period yet.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {bestSellers.map((p) => (
                  <li key={p.productId} className="flex justify-between">
                    <span>{p.productName}</span>
                    <span className="text-zinc-500">
                      {p.unitsSold} sold{canViewFinancial ? ` · ${formatMoney(p.revenueMinor)}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low-stock alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-zinc-500">Everything is healthily stocked.</p>
            ) : (
              <ul className="flex flex-col gap-2 text-sm">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <Link href="/admin/inventory" className="hover:underline">
                      {p.name} <span className="text-xs text-zinc-500">({p.packageSize})</span>
                    </Link>
                    <Badge tone={p.stock <= 0 ? "danger" : "warning"}>{p.stock <= 0 ? "Out of stock" : `${p.stock} left`}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {canViewFinancial && (
          <Card>
            <CardHeader>
              <CardTitle>Sales by category ({range.label})</CardTitle>
            </CardHeader>
            <CardContent>
              {salesByCategory.length === 0 ? (
                <p className="text-sm text-zinc-500">No sales in this period yet.</p>
              ) : (
                <ul className="flex flex-col gap-2 text-sm">
                  {salesByCategory.map((c) => (
                    <li key={c.category} className="flex justify-between">
                      <span>{c.category}</span>
                      <span className="text-zinc-500">{formatMoney(c.revenueMinor)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              <li className="flex justify-between">
                <span>Pending payment</span>
                <span className="text-zinc-500">{orderCounts.pendingPayment}</span>
              </li>
              <li className="flex justify-between">
                <span>Paid</span>
                <span className="text-zinc-500">{orderCounts.paid}</span>
              </li>
              <li className="flex justify-between">
                <span>Processing</span>
                <span className="text-zinc-500">{orderCounts.processing}</span>
              </li>
              <li className="flex justify-between">
                <span>Ready for pickup</span>
                <span className="text-zinc-500">{orderCounts.readyForPickup}</span>
              </li>
              <li className="flex justify-between">
                <span>Out for delivery</span>
                <span className="text-zinc-500">{orderCounts.outForDelivery}</span>
              </li>
              <li className="flex justify-between">
                <span>Completed</span>
                <span className="text-zinc-500">{orderCounts.completed}</span>
              </li>
              <li className="flex justify-between">
                <span>Cancelled</span>
                <span className="text-zinc-500">{orderCounts.cancelled}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
