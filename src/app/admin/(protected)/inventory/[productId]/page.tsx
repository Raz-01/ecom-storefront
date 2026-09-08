import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/session";
import { StockBadge } from "@/components/domain/StockBadge";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { AdjustStockForm } from "@/components/admin/AdjustStockForm";

const REASON_LABELS: Record<string, string> = {
  STOCK_RECEIVED: "Stock received",
  ORDER_PLACED: "Order placed (paid)",
  ORDER_CANCELLED: "Order cancelled (restored)",
  MANUAL_ADJUSTMENT: "Manual adjustment",
  DAMAGED: "Damaged / written off",
  CORRECTION: "Count correction",
};

export default async function ProductInventoryHistoryPage({ params }: PageProps<"/admin/inventory/[productId]">) {
  await requirePermission("inventory:manage");
  const { productId } = await params;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) notFound();

  const movements = await prisma.inventoryMovement.findMany({
    where: { productId },
    include: { order: { select: { orderNumber: true } }, admin: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">{product.name}</h1>
        <p className="text-sm text-zinc-500">
          {product.sku} · {product.packageSize}
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div>
          <p className="text-xs text-zinc-500">Current stock</p>
          <p className="text-2xl font-semibold">{product.stock}</p>
        </div>
        <StockBadge stock={product.stock} lowStockThreshold={product.lowStockThreshold} />
        <div className="ml-auto">
          <AdjustStockForm productId={product.id} />
        </div>
      </div>

      <h2 className="text-sm font-semibold">Movement history</h2>
      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Change</Th>
            <Th className="text-right">Before → After</Th>
            <Th>Reason</Th>
            <Th>Reference</Th>
          </Tr>
        </Thead>
        <Tbody>
          {movements.map((m) => (
            <Tr key={m.id}>
              <Td className="text-xs text-zinc-500">{m.createdAt.toLocaleString()}</Td>
              <Td>
                <Badge tone={m.quantityChange > 0 ? "success" : "danger"}>
                  {m.quantityChange > 0 ? "+" : ""}
                  {m.quantityChange}
                </Badge>
              </Td>
              <Td className="text-right text-zinc-500">
                {m.previousQuantity} → {m.newQuantity}
              </Td>
              <Td>{REASON_LABELS[m.reason] ?? m.reason}</Td>
              <Td className="text-xs text-zinc-500">{m.order ? `Order #${m.order.orderNumber}` : m.admin ? m.admin.name : m.note ?? "—"}</Td>
            </Tr>
          ))}
          {movements.length === 0 && (
            <Tr>
              <Td colSpan={5} className="py-8 text-center text-sm text-zinc-500">
                No inventory movements yet.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </div>
  );
}
