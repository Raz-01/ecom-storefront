import { prisma } from "@/lib/prisma";

const PAID_ONWARD_STATUSES = ["PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED"] as const;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function startOfWeek(d: Date) {
  const day = startOfDay(d);
  const diff = (day.getDay() + 6) % 7; // Monday-start week
  day.setDate(day.getDate() - diff);
  return day;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

/** `days` back from now — the entry point for "last N days" range queries, kept as a named helper (rather than inlined at each call site) so the impure `Date.now()` call lives in a plain utility function, not directly in a component/hook body. */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

/** Revenue is recognized off successful `Payment` rows (not `Order.totalMinor`) so a failed/retried attempt never inflates the figure. */
async function revenueSince(date: Date): Promise<number> {
  const result = await prisma.payment.aggregate({
    where: { status: "SUCCESS", paidAt: { gte: date } },
    _sum: { amountMinor: true },
  });
  return result._sum.amountMinor ?? 0;
}

export async function getRevenueSummary() {
  const now = new Date();
  const [today, week, month, year] = await Promise.all([
    revenueSince(startOfDay(now)),
    revenueSince(startOfWeek(now)),
    revenueSince(startOfMonth(now)),
    revenueSince(startOfYear(now)),
  ]);
  return { today, week, month, year };
}

export async function getOrderCounts() {
  const grouped = await prisma.order.groupBy({ by: ["status"], _count: { _all: true } });
  const byStatus = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Record<string, number>;
  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  return {
    total,
    pendingPayment: byStatus.PENDING_PAYMENT ?? 0,
    paid: byStatus.PAID ?? 0,
    processing: byStatus.PROCESSING ?? 0,
    readyForPickup: byStatus.READY_FOR_PICKUP ?? 0,
    outForDelivery: byStatus.OUT_FOR_DELIVERY ?? 0,
    completed: byStatus.COMPLETED ?? 0,
    cancelled: byStatus.CANCELLED ?? 0,
  };
}

export async function getAverageOrderValue(): Promise<number> {
  const result = await prisma.order.aggregate({
    where: { status: { in: [...PAID_ONWARD_STATUSES] } },
    _avg: { totalMinor: true },
  });
  return Math.round(result._avg.totalMinor ?? 0);
}

/** Customers only exist as order contact info (no accounts) — "unique customers" is distinct phone numbers. New vs returning is judged against each phone's first-ever order date. */
export async function getCustomerStats(periodStart: Date) {
  const [phonesInPeriod, phonesBeforePeriod] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: periodStart } }, select: { customerPhone: true }, distinct: ["customerPhone"] }),
    prisma.order.findMany({ where: { createdAt: { lt: periodStart } }, select: { customerPhone: true }, distinct: ["customerPhone"] }),
  ]);
  const beforeSet = new Set(phonesBeforePeriod.map((p) => p.customerPhone));
  const inPeriodPhones = phonesInPeriod.map((p) => p.customerPhone);
  const newCustomers = inPeriodPhones.filter((phone) => !beforeSet.has(phone)).length;
  const returningCustomers = inPeriodPhones.length - newCustomers;

  const totalUnique = await prisma.order.findMany({ select: { customerPhone: true }, distinct: ["customerPhone"] });

  return { uniqueCustomers: totalUnique.length, newCustomers, returningCustomers };
}

/** Small catalog (tens of SKUs) — fetching and comparing in JS is simpler and plenty fast; a raw column-vs-column comparison would only pay for itself at a much larger scale. */
export async function getInventoryStats() {
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { stock: true, lowStockThreshold: true } });
  const totalStockUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;
  return { totalProducts: products.length, totalStockUnits, lowStockCount, outOfStockCount };
}

export async function getLowStockProducts(limit = 10) {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, sku: true, stock: true, lowStockThreshold: true, packageSize: true },
  });
  return products
    .filter((p) => p.stock <= p.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, limit);
}

export async function getBestSellingProducts(periodStart: Date, limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: { order: { status: { in: [...PAID_ONWARD_STATUSES] }, createdAt: { gte: periodStart } } },
    _sum: { quantity: true, lineTotalMinor: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });
  return grouped.map((g) => ({
    productId: g.productId,
    productName: g.productName,
    unitsSold: g._sum.quantity ?? 0,
    revenueMinor: g._sum.lineTotalMinor ?? 0,
  }));
}

export async function getSalesByCategory(periodStart: Date) {
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: [...PAID_ONWARD_STATUSES] }, createdAt: { gte: periodStart } } },
    select: { lineTotalMinor: true, product: { select: { category: { select: { name: true } } } } },
  });
  const byCategory = new Map<string, number>();
  for (const item of items) {
    const name = item.product.category.name;
    byCategory.set(name, (byCategory.get(name) ?? 0) + item.lineTotalMinor);
  }
  return Array.from(byCategory.entries())
    .map(([category, revenueMinor]) => ({ category, revenueMinor }))
    .sort((a, b) => b.revenueMinor - a.revenueMinor);
}

/** Daily revenue + order count for the last `days` days, for the dashboard trend chart. Zero-fills days with no activity so the chart doesn't show gaps. */
export async function getDailyTrend(days: number) {
  const periodStart = startOfDay(new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000));

  const [orders, payments] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: periodStart } }, select: { createdAt: true } }),
    prisma.payment.findMany({ where: { status: "SUCCESS", paidAt: { gte: periodStart } }, select: { paidAt: true, amountMinor: true } }),
  ]);

  const dayKey = (d: Date) => d.toISOString().slice(0, 10);
  const revenueByDay = new Map<string, number>();
  const ordersByDay = new Map<string, number>();

  for (const payment of payments) {
    if (!payment.paidAt) continue;
    const key = dayKey(payment.paidAt);
    revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + payment.amountMinor);
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }

  const result: { date: string; revenueMinor: number; orders: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(periodStart.getTime() + i * 24 * 60 * 60 * 1000);
    const key = dayKey(d);
    result.push({ date: key, revenueMinor: revenueByDay.get(key) ?? 0, orders: ordersByDay.get(key) ?? 0 });
  }
  return result;
}

export { startOfDay, startOfWeek, startOfMonth, startOfYear };
