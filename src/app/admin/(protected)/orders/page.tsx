import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { formatMoney } from "@/lib/currency";
import { getDisplayPaymentStatus, getDisplayFulfillmentStatus, ORDER_STATUS_LABELS } from "@/lib/orders/status";
import { PaymentStatusBadge, FulfillmentStatusBadge } from "@/components/domain/OrderStatusBadges";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Input, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import type { OrderStatus } from "@prisma/client";

const STATUS_FILTERS: OrderStatus[] = ["PENDING_PAYMENT", "PAYMENT_PROCESSING", "PAID", "PROCESSING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "COMPLETED", "CANCELLED"];

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requirePermission("orders:view");
  const sp = await searchParams;
  const status = typeof sp.status === "string" ? (sp.status as OrderStatus) : undefined;
  const search = typeof sp.q === "string" ? sp.q.trim() : undefined;

  const orders = await prisma.order.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
              { customerPhone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Orders</h1>

      <form action="/admin/orders" className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input type="search" name="q" defaultValue={search} placeholder="Search order #, name or phone…" className="sm:max-w-xs" />
        <Select name="status" defaultValue={status ?? ""} className="sm:w-56">
          <option value="">All statuses</option>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <Table>
        <Thead>
          <Tr>
            <Th>Order</Th>
            <Th>Customer</Th>
            <Th>Date</Th>
            <Th>Payment</Th>
            <Th>Fulfillment</Th>
            <Th className="text-right">Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td>
                <Link href={`/admin/orders/${order.orderNumber}`} className="font-medium hover:underline">
                  #{order.orderNumber}
                </Link>
              </Td>
              <Td>
                <div>{order.customerName}</div>
                <div className="text-xs text-zinc-500">{order.customerPhone}</div>
              </Td>
              <Td className="text-xs text-zinc-500">{order.createdAt.toLocaleDateString()}</Td>
              <Td>
                <PaymentStatusBadge status={getDisplayPaymentStatus(order, order.payments[0]?.status)} />
              </Td>
              <Td>
                <FulfillmentStatusBadge status={getDisplayFulfillmentStatus(order)} />
              </Td>
              <Td className="text-right font-medium">{formatMoney(order.totalMinor)}</Td>
            </Tr>
          ))}
          {orders.length === 0 && (
            <Tr>
              <Td colSpan={6} className="py-8 text-center text-sm text-zinc-500">
                No orders match this filter.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
